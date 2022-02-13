
import {GameOptions, GameplayController, GameStatus, GuessProblem} from "./gameplay.js";
import {Board, Keyboard, popup} from "./view.js";
import {delay} from "./animation.js";

document.addEventListener("DOMContentLoaded", () => {
    let options = new GameOptions();
    let game = new GameplayController(options);
    let board = new Board(options);
    let keyboard = new Keyboard();

    let FLIP_ANIMATION_SPEED = 0.25;
    let WIN_MESSAGE = "ISPAJGLANO!";
    let LOSE_MESSAGE = (correct) => `Reč je bila: ${correct.toUpperCase()}!`;
    let WORD_TOO_SHORT_MESSAGE = "Uneta reč je prekratka";
    let WORD_NOT_KNOWN_MESSAGE = "Uneta reč nije u bazi";

    game.connectToGameInstance(function(instance) {
        instance.replayEvent.push((state, image) => {
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
                    popup(WIN_MESSAGE);
                }
            }
        });

        instance.gameWonEvent.push(() => {
            keyboard.toggle(false);
            popup(WIN_MESSAGE);
        });

        instance.gameLostEvent.push((correct) => {
            keyboard.toggle(false);
            popup(LOSE_MESSAGE(correct), 5000);
        });

        instance.problematicGuessEvent.push((guess, reason) => {
            switch(reason) {
                case GuessProblem.WordTooShort: popup(WORD_TOO_SHORT_MESSAGE); break;
                case GuessProblem.WordNotKnown: popup(WORD_NOT_KNOWN_MESSAGE); break;
            }
        });

        instance.guessMadeEvent.push((success, letters, matches) => {
            let [ guessAttempt, _ ] = board.currentPosition;
            let full_length = matches.length * FLIP_ANIMATION_SPEED;

            keyboard.toggle(false);
            for (let index in matches) {
                let [ _, status ] = matches[index];
                delay(() => board.updateFieldColor(guessAttempt, index, status),
                    index * FLIP_ANIMATION_SPEED);
            }

            delay(() => {
                board.nextGuess();
                for (const key in letters) {
                    keyboard.updateKeyColor(key, letters[key]);
                }
                keyboard.toggle(true);
            }, full_length);
        });

        keyboard.confirmKeyPressedEvent.push(() => {
            if (keyboard.enabled) {
                console.log(board.getCurrentGuess());
                instance.pushGuess(board.getCurrentGuess());
            }
        });

        keyboard.deleteKeyPressedEvent.push(() => {
            if (keyboard.enabled) {
                board.retractLetter();
            }
        });

        keyboard.letterKeyPressedEvent.push((keyElement) => {
            if (keyboard.enabled) {
                board.fillNextLetter(keyElement);
            }
        });

        window.onresize = () => board.onResize();
        keyboard.onConnect();
        board.onConnect();
        board.onResize();
    });

    game.pajglaChangedEvent.push((pajgla) => {
        document.title = `Pajglanje #${pajgla.time}`;
        document.getElementById('centralHeaderSpace').textContent = `PAJGLANJE #${pajgla.time}`;
    });

    game.triggerPajglaChanged();
});