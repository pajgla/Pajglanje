
import { DICT_DAILY_WORDS } from './dict_daily_words.js';
import { DICT_GUESS_WORDS } from './dict_guess_words.js';
import {consolidate_digraphs, LetterStatus, match_words, valueToLetterStatus} from "./core_logic.js";
import {ajax} from "./ajax.js"

function dateToPajglaTime(end) {
    let start = new Date('2/6/2022');
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    let dateDiff = end - start;
    let hourDiff = Math.floor(dateDiff / (1000 * 60 * 60));
    return Math.floor(hourDiff / 8);
}

function getLocalPajglaTime() {
    let currentDate = new Date();
    return dateToPajglaTime(currentDate);
}

function getServerPajglaTime() {
    let [status, data] = ajax.sync.get("http://worldtimeapi.org/api/timezone/Europe/Belgrade", []);
    if (status !== 200) {
        console.warn(`World Time API status returned ${status}!`);
    }
    let currentDate = new Date(JSON.parse(data).utc_datetime);
    return dateToPajglaTime(currentDate);
}


export class GuessProblem {
    static WordTooShort = new GuessProblem("word too short")
    static WordNotKnown = new GuessProblem("word not in dictionary")
    static GameOver = new GuessProblem("game over")

    constructor(name) {
        this.name = name
    }
}

export class GameStatus {
    static Active = new GameStatus("active")
    static Solved = new GameStatus("solved")
    static Failed = new GameStatus("failed")

    constructor(name) {
        this.name = name
    }
}

class GameState {
    constructor(status, time, word, guesses) {
        this.status = GameStatus.Active;
        this.time = time;
        this.correctWord = word;
        this.guesses = guesses;
        this.letters = {};
        this.replaying = false;
    }

    replay(options) {
        this.replaying = true;
        this.status = GameStatus.Active;
        let image = [];
        let guesses = [...this.guesses];
        for (let guess of guesses) {
            if (this.is_open_for_guessing()) {
                let matchResult = match_words(this.correctWord, guess);
                this.update(guess, matchResult);

                let [success, matches] = matchResult;
                image.push({ guess: guess, result: matches });

                if (success) {
                    this.status = GameStatus.Solved;
                }
            }
        }

        if (this.is_open_for_guessing() && this.guesses.length >= options.attemptOptions) {
            this.status = GameStatus.Failed;
        }

        this.replaying = false;
        return image;
    }

    update(guess, matchResult) {
        let [ success, matches ] = matchResult;
        if (!this.replaying) {
            this.guesses.push(guess);
        }

        for (let [letter, new_status] of matches) {
            let old_status = LetterStatus.Gray;
            if (this.letters.hasOwnProperty(letter)) {
                old_status = this.letters[letter];
            }

            let value = (new_status.value > old_status.value) ? new_status.value : old_status.value;
            this.letters[letter] = valueToLetterStatus(value);
        }

        if (success) {
            this.status = GameStatus.Solved;
        }
    }

    is_open_for_guessing() {
        return this.status === GameStatus.Active;
    }
}

export class GameOptions {
    constructor() {
        this.useSaveGames = true;
        this.clearSavedIfOld = true;
        this.wordLength = 6;
        this.attemptOptions = 6;
        this.useServerTime = true;
    }
}

export class GameInstance {
    static SavedGameStorageKey = "saved_game";

    constructor(pairTimeWord, options) {
        this.options = options;
        console.assert(pairTimeWord.word.length === this.options.wordLength, "Any pajgla has to have 6 letters");
        this.state = new GameState(GameStatus.Active, pairTimeWord.time, pairTimeWord.word, []);

        this.currentWord = pairTimeWord.word;
        this.currentTime = pairTimeWord.time;

        this.replayEvent = [];
        this.gameWonEvent = [];
        this.gameLostEvent = [];
        this.problematicGuessEvent = [];
        this.guessMadeEvent = [];
    }

    onConnect() {
        if (this.options.useSaveGames) {
            let shouldSaveNewState = false;

            let savedGame = window.localStorage.getItem(GameInstance.SavedGameStorageKey);

            if (savedGame === null) {
                shouldSaveNewState = true;
            } else {
                let state = JSON.parse(savedGame);

                if (this.options.clearSavedIfOld && state.time < this.state.time) {
                    shouldSaveNewState = true;
                } else {
                    console.warn("Overwriting empty game from local storage");
                    this.state.status = state.status;
                    Object.setPrototypeOf(this.state.status, GameStatus.prototype);

                    this.state.letters = state.letters;

                    this.state.time = state.time;
                    this.state.guesses = state.guesses;
                    this.state.correctWord = state.correctWord;
                }
            }

            if (shouldSaveNewState) {
                console.warn("Overwriting previous local storage");
                window.localStorage.setItem(GameInstance.SavedGameStorageKey, JSON.stringify(this.state));
            }

            let image = this.state.replay(this.options);
            for (let replayHandler of this.replayEvent) {
                replayHandler(this.state, image);
            }
        }
    }

    guessIsProblematic(guess) {
        if (consolidate_digraphs(guess).length < this.options.wordLength) {
            for (let problematicGuessHandler of this.problematicGuessEvent) {
                problematicGuessHandler(guess, GuessProblem.WordTooShort);
            }
            return true;
        }

        if (!DICT_GUESS_WORDS.includes(guess)) {
            for (let problematicGuessHandler of this.problematicGuessEvent) {
                problematicGuessHandler(guess, GuessProblem.WordNotKnown);
            }
            return true;
        }

        return false;
    }

    pushGuess(guess) {
        if (this.state.is_open_for_guessing()) {
            if (!this.guessIsProblematic(guess)) {
                let [success, matches] = match_words(this.state.correctWord, guess);
                this.state.update(guess, [ success, matches ]);

                for (let guessMadeHandler of this.guessMadeEvent) {
                    guessMadeHandler(success, this.state.letters, matches);
                }

                if (success) {
                    this.state.status = GameStatus.Solved;
                    for (let gameWonHandler of this.gameWonEvent) {
                        gameWonHandler(matches);
                    }
                } else {
                    if (this.state.guesses.length === this.options.attemptOptions) {
                        this.state.status = GameStatus.Failed;
                        for (let gameLostHandler of this.gameLostEvent) {
                            gameLostHandler(this.currentWord, matches);
                        }
                    }
                }

                if (this.options.useSaveGames) {
                    window.localStorage.setItem(GameInstance.SavedGameStorageKey, JSON.stringify(this.state));
                }
            }
        } else {
            for (let problematicGuessHandler of this.problematicGuessEvent) {
                problematicGuessHandler(guess, GuessProblem.GameOver);
            }
        }
    }
}

export class GameplayController {
    constructor(options = new GameOptions()) {
        this.options = options;
        this.getTimeFunc = this.options.useServerTime ? getServerPajglaTime : getLocalPajglaTime;
        this.currentGameInstance = null;
        this.gameInstanceConnection = null;
        this.pajglaChangedEvent = [];
    }

    triggerPajglaChanged(pajglaTime = this.getTimeFunc()) {
        let pajglaWord = DICT_DAILY_WORDS[pajglaTime];

        if (pajglaWord === undefined) {
            console.error("Dictionary doesn't have word at index:", pajglaTime);
            return;
        }

        let pairTimeWord = { time: pajglaTime, word: pajglaWord };

        for (let pajglaChangedHandler of this.pajglaChangedEvent) {
            pajglaChangedHandler(pairTimeWord);
        }

        this.currentGameInstance = new GameInstance(pairTimeWord, this.options);
        this.gameInstanceConnection(this.currentGameInstance);
        this.currentGameInstance.onConnect();
    }

    connectToGameInstance(gameCallback) {
        this.gameInstanceConnection = gameCallback;
    }
}