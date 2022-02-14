
import { simpleAnimateFlipAndClear } from "./animation.js";
import {LetterStatus, reverse_to_digraph} from "./core_logic.js";

export function popup(message, duration = 3000) {
    return Toastify({ text: message, className: "toastify-center", duration: duration }).showToast();
}

export function getIdForField(guessAttempt, letterIndex) {
    return `guess_${guessAttempt}__letter_${letterIndex}`;
}

function getStyleForColoring(color) {
    return `background-color:${color};border-color:${color}`;
}

const DEFAULT_LETTER_COLOR_GRAY = "rgb(58, 58, 60)";
const DEFAULT_LETTER_COLOR_GREEN = "rgb(83, 141, 78)";
const DEFAULT_LETTER_COLOR_YELLOW = "rgb(181, 159, 59)";
const DEFAULT_LETTER_COLOR_ERROR = "rgb(255, 0, 0)";

const simpleStatusToColor = (status) => {
    switch(status) {
        case LetterStatus.Gray: return DEFAULT_LETTER_COLOR_GRAY;
        case LetterStatus.Yellow: return DEFAULT_LETTER_COLOR_YELLOW;
        case LetterStatus.Green: return DEFAULT_LETTER_COLOR_GREEN;
        default:
            console.error("Non-existent letter status converted to color");
            return DEFAULT_LETTER_COLOR_ERROR;
    }
};

export class Board {
    constructor(options, statusToColorConverter = simpleStatusToColor, flipAnimation = simpleAnimateFlipAndClear) {
        this.options = options;
        this.statusToColorConverter = statusToColorConverter;
        this.flipAnimation = flipAnimation;

        this.currentPosition = [ 0, 0 ];
    }

    onConnect() {
        let boardElement = document.getElementById("board");

        console.log("Generating a", this.options.attemptOptions, "by", this.options.wordLength, "board");
        for (let guessAttempt = 0; guessAttempt < this.options.attemptOptions; guessAttempt++) {
            for (let letterIndex = 0; letterIndex < this.options.wordLength; letterIndex++) {
                let square = document.createElement("div");
                square.classList.add("square");
                square.classList.add("animate__animated");
                square.setAttribute("id", getIdForField(guessAttempt, letterIndex));
                square.setAttribute("data-key", '');
                boardElement.appendChild(square);
            }
        }
    }

    onResize() {
        let boardElement = document.getElementById("board");
        let height = getComputedStyle(boardElement).height;
        boardElement.style = `width:${height}`;

        if (window.screen.height <= 600) {
            boardElement.classList.remove("BigFontSize");
            boardElement.classList.add("SmallFontSize");
        } else {
            boardElement.classList.remove("SmallFontSize");
            boardElement.classList.add("BigFontSize");
        }

        let headerElement = document.getElementById("centralHeaderSpace");
        if (window.screen.width <= 450) {
            headerElement.style.fontSize = "25px";
            headerElement.style.marginTop = "1.5vh";
        } else {
            headerElement.style.fontSize = "36px";
            headerElement.style.marginTop = null;
        }
    }

    getCurrentGuess() {
        let [ guessAttempt, letterIndex ] = this.currentPosition;
        let guess = "";
        for (let i = 0; i < letterIndex; i++) {
            let id = getIdForField(guessAttempt, i);
            const letterElement = document.getElementById(id);
            let dataKey = letterElement.getAttribute("data-key");
            guess += dataKey;
        }

        return guess.trim();
    }

    nextGuess() {
        let [ guessAttempt, _ ] = this.currentPosition;
        if (guessAttempt < this.options.attemptOptions) {
            this.currentPosition = [ guessAttempt + 1, 0 ];
        }
    }

    updateFieldLetter(guessAttempt, letterIndex, letter) {
        let id = getIdForField(guessAttempt, letterIndex);
        let letterElement = document.getElementById(id);
        letterElement.textContent = `${reverse_to_digraph(letter)}`.toUpperCase();
        letterElement.setAttribute("data-key", letter);
    }

    updateFieldColor(guessAttempt, letterIndex, fieldStatus, animated = true) {
        let id = getIdForField(guessAttempt, letterIndex);
        let color = this.statusToColorConverter(fieldStatus);

        const letterElement = document.getElementById(id);
        letterElement.style = getStyleForColoring(color);

        if (animated) {
            this.flipAnimation(letterElement).then(() => {});
        }
    }

    fillNextLetter(keyElement) {
        let [ guessAttempt, letterIndex ] = this.currentPosition;
        if (letterIndex < this.options.wordLength) {
            let id = getIdForField(guessAttempt, letterIndex);
            let letterElement = document.getElementById(id);
            letterElement.textContent = keyElement.textContent.toUpperCase();
            letterElement.setAttribute("data-key", keyElement.getAttribute("data-key"));
            this.currentPosition = [ guessAttempt, letterIndex + 1 ];
        }
    }

    retractLetter() {
        let [ guessAttempt, letterIndex ] = this.currentPosition;
        if (letterIndex > 0) {
            let id = getIdForField(guessAttempt, letterIndex - 1);
            let letterElement = document.getElementById(id);
            letterElement.textContent = '';
            letterElement.setAttribute("data-key", '');
            this.currentPosition = [ guessAttempt, letterIndex - 1 ];
        }
    }
}

function isLetter(c) {
    if (c === null) return false;
    if (c === undefined) return false;
    return c.toLowerCase() != c.toUpperCase();
}

export class Keyboard {
    constructor(statusToColorConverter = simpleStatusToColor,
                keyButtonQuerySelector = ".keyboard-row button",
                confirmKeyTitle = "enter", deleteKeyTitle = "del") {

        this.confirmKeyPressedEvent = [];
        this.deleteKeyPressedEvent = [];
        this.letterKeyPressedEvent = [];

        this.keyButtonQuerySelector = keyButtonQuerySelector;
        this.confirmKeyTitle = confirmKeyTitle;
        this.deleteKeyTitle = deleteKeyTitle;

        this.enabled = true;
        this.statusToColorConverter = statusToColorConverter;
        this.keys = new Map();
    }

    onConnect() {
        for (let key of document.querySelectorAll(this.keyButtonQuerySelector)) {
            let dataKey = key.getAttribute("data-key");

            if (dataKey === this.confirmKeyTitle) {
                key.onclick = (target) => {
                    for (let confirmKeyHandler of this.confirmKeyPressedEvent) {
                        confirmKeyHandler();
                    }
                }
            } else if (dataKey === this.deleteKeyTitle) {
                key.onclick = (target) => {
                    for (let deleteKeyHandler of this.deleteKeyPressedEvent) {
                        deleteKeyHandler();
                    }
                }
            } else {
                key.onclick = (function(keyElement, self) {
                    return ({target}) => {
                        for (let letterKeyHandler of self.letterKeyPressedEvent) {
                            letterKeyHandler(target);
                        }
                    }
                })(key, this);
            }

            this.keys[dataKey] = key;
        }

        let self = this;
        document.addEventListener('keyup', function(event) {
            if (self.enabled) {
                let key = event.code;

                if (key === 'Enter') {
                    for (let confirmKeyHandler of self.confirmKeyPressedEvent) {
                        confirmKeyHandler();
                    }
                } else if (key === 'Backspace') {
                    for (let deleteKeyHandler of self.deleteKeyPressedEvent) {
                        deleteKeyHandler();
                    }
                } else {
                    navigator.keyboard.getLayoutMap().then(keyMap => {
                        let req = keyMap.get(key);
                        let resp = (function(req) {
                            switch (req) {
                                case 'q': return 'lj';
                                case 'w': return 'nj';
                                case 'x': return 'dž';
                                case 'y': return 'z';
                                case '\\': case '#': return 'ž';
                                case '[': case 'ü': return 'š';
                                case ']': case '+': return 'đ';
                                case '\'': case 'ä': return 'ć';
                                case ';': case 'ö': return 'č';
                                default: return req;
                            }
                        })(req);

                        if (isLetter(resp)) {
                            let keyboardKey = self.keys[resp];
                            if (keyboardKey !== undefined) {
                                for (let letterKeyHandler of self.letterKeyPressedEvent) {
                                    letterKeyHandler(keyboardKey);
                                }
                            }
                        }
                    });
                }
            }
        });
    }

    updateKeyColor(key, fieldStatus) {
        Object.setPrototypeOf(fieldStatus, LetterStatus.prototype);
        let color = this.statusToColorConverter(fieldStatus);
        this.keys[reverse_to_digraph(key)].style = getStyleForColoring(color);
    }

    toggle(status) {
        this.enabled = status;
    }
}