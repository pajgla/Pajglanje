
import { DICT_DAILY_WORDS } from './dict_daily_words.js';
import { DICT_GUESS_WORDS } from './dict_guess_words.js';
import {consolidate_digraphs, LetterStatus, match_words, valueToLetterStatus} from "./core_logic.js";
import {ajax} from "./ajax.js"
import { stringDecrypt, stringEncrypt } from './utils.js';

function dateToPajglaTime(end) {
    let start = new Date('2/6/2022');
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    let dateDiff = end - start;
    let hourDiff = Math.floor(dateDiff / (1000 * 60 * 60));
    return Math.floor(hourDiff / 8);
}

function dateToRushHourTime(end)
{
    let start = new Date('3/11/2022');
    start.setHours(17);
    start.setMinutes(0);
    start.setSeconds(0);
    let dateDiff = end - start;
    let hourDiff = Math.floor(dateDiff / (1000 * 60 * 60));
    return Math.floor(hourDiff / 24);
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

function getLocalRushHourTime()
{
    let currentDate = new Date();
    return dateToRushHourTime(currentDate);
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

export class GameStatistics {
    static RegisterWin = new GameStatus("win")
    static RegisterLose = new GameStatus("lose")
    static Check = new GameStatus("check")

    constructor(name) {
        this.name = name
    }
}

class GameState {
    constructor(status, time, word, guesses) {
        this.status = GameStatus.Active;
        this.time = time;
        this.correctWord = stringEncrypt(word);
        this.guesses = guesses;
        this.letters = {};
        this.replaying = false;
        this.rushHourStartTime = undefined;
        this.rushHourScore = 0;
    }

    replay(options) {
        this.replaying = true;
        this.status = GameStatus.Active;
        let image = [];
        let guesses = [...this.guesses];
        for (let guess of guesses) {
            if (this.is_open_for_guessing()) {
                let matchResult = match_words(stringDecrypt(this.correctWord), guess);
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

    updateRushHourStarted(startTime)
    {
        this.rushHourStartTime = startTime;
    }

    is_open_for_guessing() {
        return this.status === GameStatus.Active;
    }
}

export class GameMode
{
    static Normal = new GameStatus("normal")
    static RushHour = new GameStatus("rushHour")

    constructor(name) {
        this.name = name
    }
}

export class GameOptions {
    static RushHourStartTime = 17;

    constructor(useSaveGames = true, clearSavedIfOld = true, wordLength = 6, attemptOptions = 6, useServerTime = false, rushHourDuration = 0, gameMode = GameMode.Normal) {
        this.useSaveGames = useSaveGames;
        this.clearSavedIfOld = clearSavedIfOld;
        this.wordLength = wordLength;
        this.attemptOptions = attemptOptions;
        //#TODO : fix a bug caused by API and use server time
        this.useServerTime = useServerTime;
        this.rushHourDuration = rushHourDuration;
        this.gameMode = gameMode;
    }
}

export class GameInstance {
    static SavedGameStorageKey = "pajgla_saved_game";
    static RushHourSavedGameStorageKey = "rushhour_saved_game";
    static SaveGameVersion = 1;

    constructor(gameplayController, pairTimeWord) {
        this.gameplayController = gameplayController;
        this.options = this.gameplayController.options;
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

    reinitialize(currentWord, currentTime, deleteGuesses)
    {
        this.state.status = GameStatus.Active;
        this.state.correctWord = stringEncrypt(currentWord);
        this.state.time = currentTime;
        this.currentWord = currentWord;
        this.currentTime = currentTime;
        if (deleteGuesses)
        {
            this.state.guesses = [];
            this.state.letters = [];
        }
    }

    triggerStateSave()
    {
        let storageKeyToUse;
        switch (this.options.gameMode)
        {
            case GameMode.Normal:
                storageKeyToUse = GameInstance.SavedGameStorageKey;
                break;
            case GameMode.RushHour:
                storageKeyToUse = GameInstance.RushHourSavedGameStorageKey;
                break;
            default:
                console.error("Invalid game mode type used");
                break;
        }


        //If someone loads the page with clean savegame, the next reload will be overwritten since we never save 'savegame version'
        //and since we can't do that in the constructor, we have to that manually here
        if (this.state.saveGameVersion === undefined)
        {
            this.state.saveGameVersion = GameInstance.SaveGameVersion;
        }

        window.localStorage.setItem(storageKeyToUse, JSON.stringify(this.state));
    }

    onConnect() {
        if (this.options.useSaveGames) {
            switch (this.options.gameMode)
            {
                case GameMode.Normal:
                    this.loadNormalGameModeSavegame();
                    break;
                case GameMode.RushHour:
                    this.loadRushHourGameModeSavegame();
                    break;
                default:
                    console.error("Unknown game mode type provided");
                    break;
            }
        }
    }

    loadRushHourGameModeSavegame()
    {
        let shouldSaveNewState = false;
        let savedGame = window.localStorage.getItem(GameInstance.RushHourSavedGameStorageKey);

        if (savedGame === null)
        {
            shouldSaveNewState = true;
        }
        else
        {
            let state = JSON.parse(savedGame);

            //Simple save version check
            //#TODO delete rushhour gamemode in couple days. This is just to ensure that the old save is deleted
            if (state.saveGameVersion === undefined)
            {
                this.state.saveGameVersion = GameInstance.SaveGameVersion;
                if (this.options.gameMode === GameMode.RushHour)
                {
                    shouldSaveNewState = true;
                }
            }

            if (state.saveGameVersion < GameInstance.SaveGameVersion)
            {
                shouldSaveNewState = true;
            }
            
            if (this.options.clearSavedIfOld && state.time < this.state.time)
            {
                shouldSaveNewState = true;
            }
            
            if (shouldSaveNewState !== true)
            {
                console.log("Overwriting empty game from local storage");
                this.state.status = state.status;
                Object.setPrototypeOf(this.state.status, GameStatus.prototype);

                this.state.letters = state.letters;
                this.state.time = state.time;
                this.state.guesses = state.guesses;
                this.state.rushHourScore = state.rushHourScore;
                this.state.rushHourStartTime = state.rushHourStartTime;
                this.state.correctWord = state.correctWord;
                this.state.saveGameVersion = this.state.SaveGameVersion;
            }
        }

        if (shouldSaveNewState)
        {
            console.warn("Overwriting previous local storage");
            this.triggerStateSave();
        }

        let image = this.state.replay(this.options);
        for (let replayHanlder of this.replayEvent)
        {
            replayHanlder(this.state, image);
        }
    }

    loadNormalGameModeSavegame()
    {
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
            this.triggerStateSave();
        }

        let image = this.state.replay(this.options);
        for (let replayHandler of this.replayEvent) {
            replayHandler(this.state, image);
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

    triggerGameLostEvent()
    {
        for (let gameLostHandler of this.gameLostEvent) {
            gameLostHandler(this.currentWord);
        }
    }

    pushGuess(guess) {
        if (this.state.is_open_for_guessing()) {
            if (!this.guessIsProblematic(guess)) {
                let [success, matches] = match_words(stringDecrypt(this.state.correctWord), guess);
                this.state.update(guess, [ success, matches ]);

                for (let guessMadeHandler of this.guessMadeEvent) {
                    guessMadeHandler(success, this.state.letters, matches);
                }

                if (success) {
                    this.state.status = GameStatus.Solved;
                    if (this.options.gameMode === GameMode.Normal)
                    {
                        this.gameplayController.updateStatistics(GameStatistics.RegisterWin);
                    }
                    for (let gameWonHandler of this.gameWonEvent) {
                        gameWonHandler(matches);
                    }
                } else {
                    if (this.state.guesses.length === this.options.attemptOptions) {
                        this.state.status = GameStatus.Failed;
                        this.gameplayController.updateStatistics(GameStatistics.RegisterLose);
                        for (let gameLostHandler of this.gameLostEvent) {
                            gameLostHandler(this.currentWord, matches);
                        }
                    }
                }

                if (this.options.useSaveGames) {
                    this.triggerStateSave();
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
    static StatisticsStorageKey = "pajgla_statistics";

    constructor(options = new GameOptions()) {
        this.options = options;
        this.getTimeFunc = this.getTimeFunct();
        this.currentGameInstance = null;
        this.gameInstanceConnection = null;
        this.pajglaChangedEvent = [];
        this.statisticsChangedEvent = [];
    }

    getTimeFunct()
    {
        switch (this.options.gameMode)
        {
            case GameMode.Normal:
                return this.options.useServerTime ? getServerPajglaTime : getLocalPajglaTime;
            case GameMode.RushHour:
                return getLocalRushHourTime;
            default:
                console.error("Invalid game mode provided");
                return getLocalPajglaTime;
        }
    }

    triggerPajglaChanged(pajglaTime = this.getTimeFunc(), initialize = true, deleteGuesses = true) {
        let pajglaWord = DICT_DAILY_WORDS[pajglaTime];
        if (pajglaWord === undefined) {
            console.error("Dictionary doesn't have word at index:", pajglaTime);
            return;
        }

        let pairTimeWord = { time: pajglaTime, word: pajglaWord };

        for (let pajglaChangedHandler of this.pajglaChangedEvent) {
            pajglaChangedHandler(pairTimeWord);
        }

        if (initialize)
        {
            this.currentGameInstance = new GameInstance(this, pairTimeWord);
            this.gameInstanceConnection(this.currentGameInstance);
            this.currentGameInstance.onConnect();
        }
        else
        {
            this.currentGameInstance.reinitialize(pajglaWord, pajglaTime, deleteGuesses);
        }
    }

    triggerRushHourPajglaChanged(wordIndex, initialize = true, deleteGuesses = true)
    {
        let rushHourTime = this.getTimeFunc();
        let pajglaWord = DICT_DAILY_WORDS[wordIndex];
        if (pajglaWord === undefined)
        {
            console.error("Dictionary doesn't have word at index:", wordIndex);
            return;
        }

        let pairTimeWord = {time: rushHourTime, word: pajglaWord};

        for (let pajglaChangedHandler of this.pajglaChangedEvent)
        {
            pajglaChangedHandler(pairTimeWord);
        }

        if (initialize)
        {
            this.currentGameInstance = new GameInstance(this, pairTimeWord);
            this.gameInstanceConnection(this.currentGameInstance);
            this.currentGameInstance.onConnect();
        }
        else
        {
            this.currentGameInstance.reinitialize(pajglaWord, rushHourTime, deleteGuesses);
        }
    }

    connectToGameInstance(gameCallback) {
        this.gameInstanceConnection = gameCallback;
    }

    createFreshStatistics() {
        return { 
            won: 0, 
            lost: 0, 
            totalPlayed: 0,
            experience: 0,
            currentStreak: 0,
            longestStreak: 0,
            histogram: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0
            }
        };
    }

    updateStatistics(stat) {
        let stats = window.localStorage.getItem(GameplayController.StatisticsStorageKey);
        if (stats === null) {
            stats = this.createFreshStatistics();
        }
        else
        {
            stats = JSON.parse(stats);
        }

        if (stat !== GameStatistics.Check) {
            stats.totalPlayed++;

            if (stat === GameStatistics.RegisterWin) {
                stats.won++;
                stats.currentStreak++;
                let histogramKey = this.currentGameInstance.state.guesses.length;
                stats.histogram[histogramKey]++;
            } else if (stat === GameStatistics.RegisterLose) {
                stats.lost++;
                stats.currentStreak = 0;
            }

            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
        }

        for (let statisticsHandler of this.statisticsChangedEvent) {
            statisticsHandler(stats);
        }

        window.localStorage.setItem(GameplayController.StatisticsStorageKey, JSON.stringify(stats));
    }

    triggerStatistics() {
        this.updateStatistics(GameStatistics.Check);
    }
}
