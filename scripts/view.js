
import { simpleAnimateFlipAndClear, simpleAnimateZoomInAndClear } from "./animation.js";
import { LetterStatus, reverse_to_digraph } from "./core_logic.js";
import { GameStatus } from "./gameplay.js";
import { copyToClipboard } from "./clipboard.js";

export function popup(message, duration = 3000) {
    return Toastify({ text: message, className: "toastify-center", duration: duration }).showToast();
}

export function getIdForField(guessAttempt, letterIndex) {
    return `guess_${guessAttempt}__letter_${letterIndex}`;
}

function getStyleForColoring(color) {
    return `background-color:${color};border-color:${color}`;
}

const RESULT_READY_TO_PASTE = "Kopirano i spremno za slanje!";
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
    constructor(options, statusToColorConverter = simpleStatusToColor, flipAnimation = simpleAnimateFlipAndClear, zoomAnimation = simpleAnimateZoomInAndClear) {
        this.options = options;
        this.statusToColorConverter = statusToColorConverter;
        this.flipAnimation = flipAnimation;
        this.zoomAnimation = zoomAnimation;

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
                square.setAttribute("data-value", 0);
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
        letterElement.setAttribute("data-value", fieldStatus.value);

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

            this.zoomAnimation(letterElement).then(() => {});
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

    commonLayoutsToSerbianLatin(req) {
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
                    let triggerKeyEvents = function(req) {
                        let resp = self.commonLayoutsToSerbianLatin(req);

                        if (isLetter(resp)) {
                            let keyboardKey = self.keys[resp];
                            if (keyboardKey !== undefined) {
                                for (let letterKeyHandler of self.letterKeyPressedEvent) {
                                    letterKeyHandler(keyboardKey);
                                }
                            }
                        }                        
                    };
                    if (navigator !== undefined && navigator.keyboard !== undefined) { 
                        navigator.keyboard.getLayoutMap().then(keyMap => {
                            let req = keyMap.get(key);
                            triggerKeyEvents(req);
                        });
                    } else {
                        triggerKeyEvents(event.key);
                    }
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

export class StatisticsWindow
{
    static statisticsPopupElementID = 'statisticsPopupLink';
    static gamesPlayedElementID = 'gamesPlayedStatistics';
    static gamesWonElementID = 'gamesWonStatistics';
    static currentWinStreakElementID = 'currentWinStreakStatistics';
    static bestWinStreakElementID = 'bestWinStreakStatistics';
    static gamesWonPercentageElementID = 'gamesWonPercentageStatistics'
    static currentGuessHistogramColor = 'rgb(83, 141, 78)';
    static minGraphWidth = 7;

    updateStatisticsWindow(stats)
    {
        if (stats === null)
        {
            console.assert(false, "Statistics not initialized");
            return;
        }

        let gamesPlayedElement = document.getElementById(StatisticsWindow.gamesPlayedElementID);
        gamesPlayedElement.textContent = stats.totalPlayed;
        
        let gamesWonElement = document.getElementById(StatisticsWindow.gamesWonElementID);
        gamesWonElement.textContent = stats.won;

        let gamesWonPercentage = stats.totalPlayed === 0 ? 0 : (stats.won / stats.totalPlayed) * 100;
        let gamesWonPercentageElement = document.getElementById(StatisticsWindow.gamesWonPercentageElementID);
        gamesWonPercentageElement.textContent = gamesWonPercentage + "%"

        let currentWinStreakElement = document.getElementById(StatisticsWindow.currentWinStreakElementID);
        currentWinStreakElement.textContent = stats.currentStreak;

        let bestWinStreakElement = document.getElementById(StatisticsWindow.bestWinStreakElementID);
        bestWinStreakElement.textContent = stats.longestStreak;

        let savedHistogramData = stats.histogram;
        if (typeof savedHistogramData !== 'undefined')
        {
            for (let i = 1; i <= Object.keys(savedHistogramData).length; ++i)
            {
                let graphElementID = this.numToGraphID(i);
                let graphElement = document.getElementById(graphElementID);
                let currentGuessCount = savedHistogramData[i];
                let graphWidth = stats.won === 0 ? 0 : (currentGuessCount / stats.won) * 100;
                let alignRight = true;
                if (graphWidth < StatisticsWindow.minGraphWidth)
                {
                    graphWidth = StatisticsWindow.minGraphWidth;
                    alignRight = false;
                }

                graphElement.style.width = `${graphWidth}%`;
                if (alignRight)
                {
                    graphElement.classList.add('align-right');
                }

                let graphNumElementID = this.numToGraphNumID(i);
                let graphNumElement = document.getElementById(graphNumElementID);
                graphNumElement.textContent = currentGuessCount;
            }
        }
    }

    numToGraphID(num)
    {
        return this.numToPositionWord(num) + "GuessGraph";
    }

    numToGraphNumID(num)
    {
        return this.numToPositionWord(num) + "GuessNum";
    }

    numToPositionWord(num)
    {
        let word = "";
        switch (num)
        {
            case 1:
                word = "first";
                break;
            case 2:
                word = "second";
                break;
            case 3:
                word = "third";
                break;
            case 4:
                word = "fourth";
                break;
            case 5:
                word = "fifth"
                break;
            case 6:
                word = "sixth";
                break;
            default:
                console.error("numToHistogramElementID -> Wrong num provided");
                return;
        }

        return word;
    }

    showStatisticsWindow(state)
    {
        let currentPajglaTime = state.time;

        this.createStatisticsFooter(state);
        this.startNextPajglaTimer(currentPajglaTime);
        this.isGameWon = state.status === GameStatus.Solved;

        this.paintGuessHistogram(state);

        $('#statisticsPopup').modal({
            fadeDuration: 100
        });
    }

    paintGuessHistogram(state)
    {
        //Do not paint if we didn't guess the word
        if (!this.isGameWon)
        {
            return;
        }

        let currentGuess = state.guesses.length;
        let graphElementID = this.numToGraphID(currentGuess);
        let graphElementToPaint = document.getElementById(graphElementID);
        graphElementToPaint.style.backgroundColor = StatisticsWindow.currentGuessHistogramColor;
    }

    createStatisticsFooter(state)
    {
        let footerElement = document.getElementById('footer');

        let countdownElement = document.createElement("div");
        countdownElement.classList.add('countdown');
        footerElement.appendChild(countdownElement);

        let timerTitle = document.createElement('h4');
        timerTitle.textContent = "Sledeće pajglanje";
        countdownElement.appendChild(timerTitle);

        let nextPajglaTimerElement = document.createElement('div');
        nextPajglaTimerElement.id = "nextPajglaTimer";
        nextPajglaTimerElement.textContent = '03:49:13';
        countdownElement.appendChild(nextPajglaTimerElement);

        let shareElement = document.createElement('div');
        shareElement.classList.add('share');
        footerElement.appendChild(shareElement);

        let shareButton = document.createElement('button');
        shareButton.id = 'shareButton';
        shareButton.textContent = "PODELI";
        shareElement.appendChild(shareButton);
        shareButton.addEventListener("click", () => this.onShareButtonClicked(state), false);
    }

    startNextPajglaTimer(currentPajglaTime)
    {
        let nextPajglaTime = ++currentPajglaTime;
        let nextPajglaDate = new Date('2/6/2022');
        nextPajglaDate.setHours(8 * nextPajglaTime);

        let timerElement = document.getElementById('nextPajglaTimer');
        setInterval(() => {
            let currentDate = Date.now();
            let dateDiff = nextPajglaDate - currentDate;
            let hours = Math.floor(dateDiff / (1000 * 60 * 60));
            let minutes = Math.floor(dateDiff / (1000 * 60)) % 60;
            let seconds = Math.floor(dateDiff / 1000) % 60;
            if (hours < 10)
                hours = '0' + hours;
            if (minutes < 10)
                minutes = '0' + minutes;
            if (seconds < 10)
                seconds = '0' + seconds;
            timerElement.textContent = hours + ":" + minutes + ":" + seconds;
        }, 100);
    }

    onShareButtonClicked(state)
    {
        const squareVisuals = [ '⬛', '🟨', '🟩' ];

        let stringToCopy = `PAJGLANJE #${state.time} ${state.guesses.length}/6\n\n`;
        for (let i = 0; i < state.guesses.length; ++i)
        {
            let row = [];
            for (let j = 0; j < state.guesses[i].length; ++j)
            {
                let id = getIdForField(i, j);
                let value = document.getElementById(id).getAttribute("data-value");
                row.push(squareVisuals[value]);
            }
            stringToCopy += row.join('') + "\n";
        }

        copyToClipboard(stringToCopy);
        popup(RESULT_READY_TO_PASTE, 5000);
    }
}
