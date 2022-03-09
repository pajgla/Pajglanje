import {GameMode, GameOptions, GameplayController, GameStatistics, GameStatus, GuessProblem} from "./gameplay.js";
import {Board, HelpWindow, Keyboard, popup, StatisticsWindow} from "./view.js";
import {delay} from "./animation.js";
import { DICT_DAILY_WORDS } from './dict_daily_words.js';

function getRandomPajglaTime()
{
   return Math.floor( Math.random() * DICT_DAILY_WORDS.length);
}

document.addEventListener("DOMContentLoaded", () => {
    let options = new GameOptions(true, false, 6, 6, false, 30, GameMode.RushHour);
    let game = new GameplayController(options);
    let board = new Board(options);
    let keyboard = new Keyboard();
    
    let FLIP_ANIMATION_SPEED = 0.25;
    let WIN_MESSAGE = (score) => `Ispajglano! Skor: ${score}`;
    let LOSE_MESSAGE = (correct) => `Reč je bila: ${correct.toUpperCase()}!`;
    let WORD_TOO_SHORT_MESSAGE = "Uneta reč je prekratka";
    let WORD_NOT_KNOWN_MESSAGE = "Uneta reč nije u bazi";

    let wordsCompleted = 0;

    game.connectToGameInstance(function(instance) {
        
        instance.replayEvent.push((state, image) => {
            
        });

        instance.gameWonEvent.push(() => {
            wordsCompleted++;
            keyboard.toggle(false);
            popup(WIN_MESSAGE(wordsCompleted), 5000);
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
        game.currentGameInstance.state.updateRushHourStarted(new Date());
    });
    
    let randomPajglaTime = getRandomPajglaTime();
    game.triggerPajglaChanged(randomPajglaTime);
});