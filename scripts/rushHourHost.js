import {GameMode, GameOptions, GameplayController, GameStatistics, GameStatus, GuessProblem} from "./gameplay.js";
import {Board, HelpWindow, Keyboard, popup, StatisticsWindow} from "./view.js";
import {delay} from "./animation.js";
import { DICT_DAILY_WORDS } from './dict_daily_words.js';
import { make_stable_seeded_rand, stringDecrypt } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    let options = new GameOptions(true, true, 6, 6, false, 30, GameMode.RushHour);
    let game = new GameplayController(options);
    let board = new Board(options);
    let keyboard = new Keyboard();
    
    let FLIP_ANIMATION_SPEED = 0.25;
    let WIN_MESSAGE = (score) => `Ispajglano! Skor: ${score}`;
    let LOSE_MESSAGE = (correct) => `Reč je bila: ${correct.toUpperCase()}!\nSkor: ${game.currentGameInstance.state.rushHourScore}`;
    let WORD_TOO_SHORT_MESSAGE = "Uneta reč je prekratka";
    let WORD_NOT_KNOWN_MESSAGE = "Uneta reč nije u bazi";

    let randomPajglaFunct = make_stable_seeded_rand(game.getTimeFunc(), DICT_DAILY_WORDS.length);
    let wordsCompleted = 0;

    let timerInterval;

    function StartTimer()
    {
        timerInterval = setInterval(() => {
            UpdateTimer();
        }, 200);
    }

    function StopTimer()
    {
        clearInterval(timerInterval);
    }

    function UpdateTimer()
    {
        let startTime = new Date(game.currentGameInstance.state.rushHourStartTime);
        if (startTime === undefined)
        {
            console.error("Start time is undefined.");
            StopTimer();
        }

        let timeRemaining = startTime.setMinutes(startTime.getMinutes() + options.rushHourDuration) - new Date();
        if (timeRemaining <= 0)
        {
            StopTimer();
            game.currentGameInstance.triggerGameLostEvent();
        }
    }

    game.connectToGameInstance(function(instance) {
        
        instance.replayEvent.push((state, image) => {
            wordsCompleted = state.rushHourScore;
            for (let guessAttempt in image) {
                let { _, result } = image[guessAttempt];
                for (let letterIndex in result) {
                    let [ letter, status ] = result[letterIndex];

                    board.updateFieldLetter(guessAttempt, letterIndex, letter);
                    board.updateFieldColor(guessAttempt, letterIndex, status, false);
                }
            }

            for (const key in state.letters) {
                keyboard.updateKeyColor(key, state.letters[key]);
            }

            board.currentPosition = [ image.length, 0 ];
            if (state.status !== GameStatus.Active) {
                keyboard.toggle(false);

                if (state.status === GameStatus.Solved) {
                    popup(WIN_MESSAGE(wordsCompleted), score);
                }
                else if (state.status === GameStatus.Failed)
                {
                    popup(LOSE_MESSAGE(stringDecrypt(instance.state.correctWord)), 5000);
                }
            }

            for (let i = 0; i < state.rushHourScore; ++i)
            {
                let randomWordIndex = randomPajglaFunct();
                game.triggerRushHourPajglaChanged(randomWordIndex, false, false);
            }

            if (state.rushHourStartTime !== undefined)
            {
                board.startRushHourTimer(state.rushHourStartTime);
                StartTimer();
            }
        });

        instance.gameWonEvent.push(() => {
            let score = ++instance.state.rushHourScore;
            keyboard.toggle(false);
            let randomWordIndex = randomPajglaFunct();
            game.triggerRushHourPajglaChanged(randomWordIndex, false, true);
            instance.triggerStateSave();
            popup(WIN_MESSAGE(score), 5000);
            delay(() => {
                keyboard.clearKeyColors();
                board.clearBoard();
                keyboard.toggle(true);
            }, 2);
        })

        instance.guessMadeEvent.push((success, letters, matches) => {

            //Start the rush hour timer once the guess is pushed
            if (!board.isRushHourStarted)
            {
                game.currentGameInstance.state.updateRushHourStarted(new Date());
                board.startRushHourTimer();
                StartTimer();
            }

            let [ guessAtempt, _ ] = board.currentPosition;
            let fullLength = matches.length * FLIP_ANIMATION_SPEED;
    
            keyboard.toggle(false);
            for (let index in matches)
            {
                let [ key, status ] = matches[index];
                delay(() => {
                    board.updateFieldColor(guessAtempt, index, status);
                    if (status.value > keyboard.getValueForKey(key))
                    {
                        keyboard.updateKeyColor(key, status);
                    }
                }, index * FLIP_ANIMATION_SPEED);
            }
    
            delay(() => {
                board.nextGuess();
                keyboard.toggle(true);
            }, fullLength);
        });

        instance.problematicGuessEvent.push((guess, reason) => {
            switch(reason) {
                case GuessProblem.WordTooShort: popup(WORD_TOO_SHORT_MESSAGE); break;
                case GuessProblem.WordNotKnown: popup(WORD_NOT_KNOWN_MESSAGE); break;
            }
        });

        instance.gameLostEvent.push((correct) => {
            keyboard.toggle(false);
            board.stopRushHourTimer();
            delay(() => {
                popup(LOSE_MESSAGE(correct), 5000);
            }, options.wordLength * FLIP_ANIMATION_SPEED);
        });

        keyboard.confirmKeyPressedEvent.push(() => {
            if (keyboard.enabled)
            {
                instance.pushGuess(board.getCurrentGuess());
            }
        });

        keyboard.deleteKeyPressedEvent.push(() => {
            if (keyboard.enabled)
            {
                board.retractLetter();
            }
        });

        keyboard.letterKeyPressedEvent.push((keyElement) => {
            if (keyboard.enabled)
            {
                board.fillNextLetter(keyElement);
            }
        });

        window.onresize= () => board.onResize();
        board.onResize();
        keyboard.onConnect();
        board.onConnect();
    });
    
    let randomPajglaTime = randomPajglaFunct();
    game.triggerRushHourPajglaChanged(randomPajglaTime);
});