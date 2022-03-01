import {GameOptions, GameplayController, GameStatistics, GameStatus, GuessProblem} from "./gameplay.js";
import {Board, HelpWindow, Keyboard, popup, StatisticsWindow} from "./view.js";
import {delay} from "./animation.js";
import { DICT_DAILY_WORDS } from './dict_daily_words.js';

document.addEventListener("DOMContentLoaded", () => {
    let options = new GameOptions(false, false, 6, 6, false);
    let game = new GameplayController(options);
    let board = new Board(options);
    let keyboard = new Keyboard();
    
    let FLIP_ANIMATION_SPEED = 0.25;
    let WIN_MESSAGE = "ISPAJGLANO!";
    let LOSE_MESSAGE = (correct) => `Reč je bila: ${correct.toUpperCase()}!`;
    let WORD_TOO_SHORT_MESSAGE = "Uneta reč je prekratka";
    let WORD_NOW_KNOWN_MESSAGE = "Uneta reč nije u bazi";
    let STATISTICS_WINDOW_OPEN_DELAY = 1;

    let dailyWordsCount = DICT_DAILY_WORDS.length;

    function getRandomPajglaTime()
    {
       return Math.floor( Math.random() * dailyWordsCount);
    }

    game.connectToGameInstance(function(instance) {

        instance.gameWonEvent.push(() => {
            keyboard.toggle(false);
            delay(() => {
                keyboard.clearKeyColors();
                board.clearBoard();
                keyboard.toggle(true);
                let randomWordIndex = getRandomPajglaTime();
                console.log(randomWordIndex);
                game.triggerPajglaChanged(randomWordIndex, false);
            }, 2);
        })

        instance.guessMadeEvent.push((success, letters, matches) => {
            console.log(matches);
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
    
    game.triggerPajglaChanged();
});