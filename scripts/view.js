
import { delay, simpleAnimateFlipAndClear, simpleAnimateFlipOutAndClear, simpleAnimateZoomInAndClear } from "./animation.js";
import { LetterStatus, reverse_to_digraph } from "./core_logic.js";
import { GameStatus } from "./gameplay.js";
import { copyToClipboard } from "./clipboard.js";
import { formatTime } from "./utils.js";

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
    constructor(options, statusToColorConverter = simpleStatusToColor, flipAnimation = simpleAnimateFlipAndClear, zoomAnimation = simpleAnimateZoomInAndClear, flipOutAnimation = simpleAnimateFlipOutAndClear) {
        this.options = options;
        this.statusToColorConverter = statusToColorConverter;
        this.flipAnimation = flipAnimation;
        this.zoomAnimation = zoomAnimation;
        this.flipOutAnimation = flipOutAnimation;
        this.isRushHourTimerShown = false;
        this.currentPosition = [ 0, 0 ];
        this.rushHourTimerTimeout;
        this.rushHourEndTime = new Date();
        this.isRushHourStarted = false;
    }

    onConnect() {
        let boardElement = document.getElementById("board");
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
        let windowScreenWidth = window.screen.width;
        let windowScreenHeight = window.screen.height;

        let boardElement = document.getElementById("board");
        let height = getComputedStyle(boardElement).height;
        boardElement.style = `width:${height}`;

        if (windowScreenHeight <= 600) {
            boardElement.classList.remove("BigFontSize");
            boardElement.classList.add("SmallFontSize");
        } else {
            boardElement.classList.remove("SmallFontSize");
            boardElement.classList.add("BigFontSize");
        }

        let headerElement = document.getElementById("centralHeaderSpace");
        if (windowScreenWidth <= 450) {
            headerElement.style.fontSize = "25px";
            headerElement.style.marginTop = "1.5vh";
        } else {
            headerElement.style.fontSize = "36px";
            headerElement.style.marginTop = null;
        }
        
        let statisticsElements = document.getElementsByClassName('statistics');
        for (let i = 0; i < statisticsElements.length; ++i)
        {
            let currentStatisticsElement = statisticsElements[i];
            if (windowScreenWidth <= 450)
            {
                currentStatisticsElement.style.fontSize = "27px";
            }
            else
            {
                currentStatisticsElement.style.fontSize = "36px";
            }
        }

        let statisticsContainerElements = document.getElementsByClassName('statistics-container');
        for (let i = 0; i < statisticsElements.length; ++i)
        {
            let currentStatisticsContainerElement = statisticsContainerElements[i];
            if (windowScreenWidth <= 450)
            {
                currentStatisticsContainerElement.style.paddingRight = "5px";
            }
            else
            {
                currentStatisticsContainerElement.style.paddingRight = "0px";
            }
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

    clearBoard()
    {
        for (let guessAttempt = 5; guessAttempt >= 0; --guessAttempt)
        {
            for (let letterIndex = 5; letterIndex >= 0; --letterIndex)
            {
                delay(() => {
                    let id = getIdForField(guessAttempt, letterIndex);
                    let letterElement = document.getElementById(id);
                    if (letterElement.textContent !== '')
                    {
                    }
                    this.flipAnimation(letterElement, 0.6).then(() => {});
                    letterElement.textContent = '';
                    letterElement.setAttribute("data-key", '');
                    letterElement.style.backgroundColor = '';
                    letterElement.style.borderColor = '';
                },  letterIndex * 0.08);
            }
        }

        this.currentPosition = [0,0];
    }

    startRushHourTimer(start)
    {
        if (start === undefined)
        {
            console.log("Start time is undefined. Initializing to current time");
            start = new Date();
        }
        else
        {
            start = new Date(Date.parse(start));
        }

        if (this.isRushHourStarted)
        {
            return;
        }

        this.rushHourEndTime.setMinutes(start.getMinutes() + this.options.rushHourDuration);

        this.rushHourTimerTimeout = setInterval(() => {
            this.updateRushHourTimer();
        }, 100);
        
        this.showRushHourTimer();

        this.isRushHourStarted = true;
    }

    updateRushHourTimer()
    {
        let centralHeaderElement = document.getElementById("centralHeaderSpace");
        let rushHourTimeRemaining = this.rushHourEndTime - new Date();
        if (this.isRushHourTimerShown === true)
        {
            centralHeaderElement.textContent = formatTime(Math.floor(rushHourTimeRemaining / (1000 * 60 * 60)), Math.floor((rushHourTimeRemaining / (1000 * 60)) % 60), Math.floor((rushHourTimeRemaining / 1000) % 60));
        }

        if (rushHourTimeRemaining <= 0)
        {
            this.stopRushHourTimer();
        }
    }

    showRushHourTimer()
    {
        let centralHeaderElement = document.getElementById("centralHeaderSpace");
        this.isRushHourTimerShown = true;         
        this.flipAnimation(centralHeaderElement, 0.8).then(() => {
            delay(() => {
                this.flipOutAnimation(centralHeaderElement, 0.8).then(() => {
                    this.showPajglaLogo();
                });
            }, 10);
        });
    }

    showPajglaLogo()
    {
        let centralHeaderElement = document.getElementById("centralHeaderSpace");
        this.isRushHourTimerShown = false;
        centralHeaderElement.textContent = "PAJGLANJE";
        this.flipAnimation(centralHeaderElement, 0.8).then(() => {
            delay(() => {
                this.flipOutAnimation(centralHeaderElement, 0.8).then(() => {
                    this.showRushHourTimer();
                });
            }, 3);
        });   
    }

    stopRushHourTimer()
    {
        clearInterval(this.rushHourTimerTimeout);
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
        let element = this.keys[reverse_to_digraph(key)];
        let color = this.statusToColorConverter(fieldStatus);
        element.setAttribute("data-value", fieldStatus.value);
        element.style = getStyleForColoring(color);
    }

    getValueForKey(key) {
        let element = this.keys[reverse_to_digraph(key)];
        let value = element.getAttribute("data-value");
        if (value === null || value === "") value = -1;
        return value;
    }

    toggle(status) {
        this.enabled = status;
    }

    clearKeyColors()
    {
        for (let key in this.keys)
        {
            let element = this.keys[reverse_to_digraph(key)];
            element.style.backgroundColor = '';
            element.removeAttribute("data-value");
        }
    }
}

// not exported, because not needed outside view
const RatingHelper = {
    numToOrdinal: (num) =>
    {
        switch (num)
        {
            case 1: return "first";
            case 2: return "second";
            case 3: return "third";
            case 4: return "fourth";
            case 5: return "fifth"
            case 6: return "sixth";
            default:
                console.error("RatingHelper.numToOrdinal -> Wrong number provided (not 1-6). Provided: " + num);
                return null;
        }
    },
    numToGuessGraph: (num) => RatingHelper.numToOrdinal(num) + "GuessGraph",
    numToGuessNum: (num) => RatingHelper.numToOrdinal(num) + "GuessNum",
}

export class StatisticsWindow {
    static statisticsPopupElementID = 'statisticsPopupLink';
    static gamesPlayedElementID = 'gamesPlayedStatistics';
    static gamesWonElementID = 'gamesWonStatistics';
    static currentWinStreakElementID = 'currentWinStreakStatistics';
    static bestWinStreakElementID = 'bestWinStreakStatistics';
    static gamesWonPercentageElementID = 'gamesWonPercentageStatistics'
    static currentGuessHistogramColor = DEFAULT_LETTER_COLOR_GREEN;
    static minGraphWidth = 7;

    constructor(options) {
        this.options = options;
    }

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
        gamesWonPercentageElement.textContent = Math.round(gamesWonPercentage) + "%"

        let currentWinStreakElement = document.getElementById(StatisticsWindow.currentWinStreakElementID);
        currentWinStreakElement.textContent = stats.currentStreak;

        let bestWinStreakElement = document.getElementById(StatisticsWindow.bestWinStreakElementID);
        bestWinStreakElement.textContent = stats.longestStreak;

        let savedHistogramData = stats.histogram;
        if (typeof savedHistogramData !== 'undefined')
        {
            for (let i = 1; i <= Object.keys(savedHistogramData).length; ++i)
            {
                let graphElementID = RatingHelper.numToGuessGraph(i);
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

                let graphNumElementID = RatingHelper.numToGuessNum(i);
                let graphNumElement = document.getElementById(graphNumElementID);
                graphNumElement.textContent = currentGuessCount;
            }
        }
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
        let graphElementID = RatingHelper.numToGuessGraph(currentGuess);
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
            if (hours < 0)
                hours = 0;
            if (minutes < 0)
                minuts = 0;
            if (seconds < 0)
                seconds = 0;

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

        let stringToCopy = `PAJGLANJE #${state.time} ${state.guesses.length}/${this.options.wordLength}\n\n`;
        for (let i = 0; i < state.guesses.length; ++i)
        {
            let row = [];
            // reading from options to not have to do the mathematics of solving the real number of letters
            // in the presence of digraphs (lj, nj, dž, ...)
            for (let j = 0; j < this.options.wordLength; ++j)
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

export class HelpWindow
{
    constructor(flipAnimation = simpleAnimateFlipAndClear)
    {
        this.flipAnimation = flipAnimation;
    }

    initHelpWindow()
    {
        let helpButtonElement = document.getElementById('helpWindowImg');
        helpButtonElement.onclick = () => {
            let greenLetterElement = document.getElementById('paintGreenExample');
            let yellowLetterElement = document.getElementById('paintYellowExample');
            let grayLetterElement = document.getElementById('paintGrayExample');
            delay(() => {
                this.flipAnimation(greenLetterElement).then(() => {});
                this.flipAnimation(yellowLetterElement).then(() => {});
                this.flipAnimation(grayLetterElement).then(() => {});
                greenLetterElement.style.backgroundColor = DEFAULT_LETTER_COLOR_GREEN;
                yellowLetterElement.style.backgroundColor = DEFAULT_LETTER_COLOR_YELLOW;
                grayLetterElement.style.backgroundColor = DEFAULT_LETTER_COLOR_GRAY;
            }, 0.4)
        };
    }
}
