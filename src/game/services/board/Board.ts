import { GetStyleForLetterStatus } from "../../../helpers/ColorFunctions"
import * as AnimationsModule from "../../../animations/Animation";
import type { IBoard } from "./IBoard";
import { GlobalGameSettings } from "../../GlobalGameSettings";
import type { ELetterStatus, LetterStatusWrapper } from "../word_services/AttemptStatuses";
import { GlobalViewSettings } from "../../../siteView/GlobalViewSettings";

export class Board implements IBoard {
    private wordLength: number = 5;
    private maxGuesses: number = 6;
    private currentLetterPosition: [number, number] = [0, 0];

    constructor(wordLength: number, maxGuesses: number)
    {
        this.wordLength = wordLength;
        this.maxGuesses = maxGuesses;
    }

    public GetCurrentAttemptPosition(): number {
        return this.currentLetterPosition[0];
    }

    public CreateBoardElement(): void {
        let boardElement: HTMLElement | null = document.getElementById(GlobalViewSettings.K_BOARD_ELEMENT_ID);
        if (!boardElement) {
            throw new Error("Board element not found");
        }

        for (let guessAttempt = 0; guessAttempt < this.maxGuesses; guessAttempt++)
        {
            for (let letterIndex = 0; letterIndex < this.wordLength; letterIndex++)
            {
                let square: HTMLElement = this.CreateLetterSquareElement(guessAttempt, letterIndex);
                boardElement.appendChild(square);
            }
        }

        //Set board parent style
        boardElement.style.setProperty("grid-template-columns", `repeat(${this.wordLength}, minmax(20px, 80px))`);
    }

    private CreateLetterSquareElement(guessAttempt: number, letterIndex: number): HTMLElement {
        let square: HTMLElement = document.createElement("div");
        square.classList.add("square");
        square.classList.add("animate__animated");
        square.classList.add("has-indicator");
        square.setAttribute("id", this.GetIDForField(guessAttempt, letterIndex));
        square.setAttribute("data-key", '');
        square.setAttribute("data-value", "");
        
        //Add points display
        let scoreDisplay: HTMLElement = document.createElement("span");
        scoreDisplay.classList.add("score-display");
        square.appendChild(scoreDisplay);
        
        return square
    }

    public GetIDForField(guessAttempt: number, letterIndex: number): string {
        return `guess_${guessAttempt}_letter_${letterIndex}`;
    }

    public OnResize(): void {
        let windowScreenHeight: number = window.screen.height;

        let boardElement: HTMLElement | null = document.querySelector(".board");
        if (!boardElement) {
            throw new Error("Board element not found");
        }

        let height: string = getComputedStyle(boardElement).height;
        boardElement.style = `width: ${height}`;

        if (windowScreenHeight <= 600)
        {
            boardElement.classList.remove("BigFontSize");
            boardElement.classList.add("SmallFontSize");
        }
        else
        {
            boardElement.classList.remove("SmallFontSize");
            boardElement.classList.add("BigFontSize");
        }
    }

    public GetCurrentGuess(): string {
        let [guessAttempt, letterIndex] = this.currentLetterPosition;
        let guess: string = "";
        for (let i = 0; i < letterIndex; ++i)
        {
            const letterElement = this.GetLetterHTMLElement(guessAttempt, i);
            let dataKey = letterElement.getAttribute("data-key");
            guess += dataKey;
        }

        return guess.trim();
    }

    public NextGuess(): void {
        let [guessAttempt, _] = this.currentLetterPosition;
        if (guessAttempt < this.maxGuesses)
        {
            this.currentLetterPosition = [guessAttempt + 1, 0];
        }
    }

    public UpdateFieldLetter(guessAttempt: number, letterIndex: number, letter: string): void {
        let letterElement = this.GetLetterHTMLElement(guessAttempt, letterIndex);
        let textNode = Array.from(letterElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) {
            textNode.textContent = `${letter}`.toUpperCase();
        }
        else
        {
            letterElement.insertBefore(document.createTextNode(`${letter}`.toUpperCase()), letterElement.firstChild);
        }
        
        letterElement.setAttribute("data-key", letter);
    }

    public UpdateFieldColor(guessAttempt: number, letterIndex: number, letterStatus: ELetterStatus, animated: boolean = true): void {
        const letterElement = this.GetLetterHTMLElement(guessAttempt, letterIndex);
        const indicatorStyle = letterElement.style.getPropertyValue("--indicator-color");
        letterElement.style.cssText = GetStyleForLetterStatus(letterStatus);
        letterElement.style.setProperty("--indicator-color", indicatorStyle);
        letterElement.setAttribute('data-value', letterStatus.toString());
        if (animated) {
            this.AnimateLetter(letterElement);
        }
    }
    
    public UpdateScoreColor(guessAttempt: number, letterIndex: number, score: number): void
    {
        const letterElement = this.GetLetterHTMLElement(guessAttempt, letterIndex);
        const scoreDisplay = letterElement.querySelector(".score-display") as HTMLElement;
        if (!scoreDisplay) {
            throw new Error("Score display not found");
        }
        
        if (score >= 0)
        {
            //Nothing for now ..
        }
        else
        {
            scoreDisplay.style.color = GlobalGameSettings.K_TRAGALICA_NEGATIVE_SCORE_COLOR;
        }
    }

    public GetLetterHTMLElement(guessAttempt: number, letterIndex: number): HTMLElement
    {
        const letterID = this.GetIDForField(guessAttempt, letterIndex);
        let letterHTMLElement = document.getElementById(letterID);
        if (!letterHTMLElement)
        {
            throw new Error(`Letter element for guess attempt ${guessAttempt} and index ${letterIndex} not found`);
        }

        return letterHTMLElement;
    }

    public FillNextLetter(letter: string): void {
        let [guessAttempt, letterIndex] = this.currentLetterPosition;
        if (letterIndex < this.wordLength)
        {
            let id = this.GetIDForField(guessAttempt, letterIndex);
            let letterElement = document.getElementById(id);
            if (!letterElement) {
                throw new Error(`Letter element with ID ${id} not found`);
            }

            this.UpdateFieldLetter(guessAttempt, letterIndex, letter);
            this.currentLetterPosition = [guessAttempt, letterIndex + 1];
            AnimationsModule.Animation_BounceAndClear(letterElement).then(() => {});
        }
    }

    public RetractLetter(): void {
        let [ guessAttempt, letterIndex ] = this.currentLetterPosition;
        if (letterIndex > 0)
        {
            let id = this.GetIDForField(guessAttempt, letterIndex - 1);
            let letterElement = document.getElementById(id);
            if (!letterElement) {
                throw new Error(`Letter element with ID ${id} not found`);
            }

            let textNode = Array.from(letterElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (textNode) {
                textNode.textContent = "";
            }
            letterElement.setAttribute("data-key", '');
            this.currentLetterPosition = [guessAttempt, letterIndex - 1];
            AnimationsModule.Animation_BounceAndClear(letterElement).then(() => {});
        }
    }

    public ClearBoard(): void {
        for (let guessAttempt = this.maxGuesses - 1; guessAttempt >= 0; --guessAttempt)
        {
            for (let letterIndex = this.wordLength - 1; letterIndex >= 0; --letterIndex)
            {
                const delay = guessAttempt * 150 + letterIndex * 50;
                setTimeout(() => {
                    let letterElement = this.GetLetterHTMLElement(guessAttempt, letterIndex);
                    letterElement.textContent = "";
                    letterElement.setAttribute("data-key", '');
                    letterElement.style.backgroundColor = "";
                    letterElement.style.borderColor = "";
                    letterElement.style.background = '';
                    AnimationsModule.Animation_FlipInAndClear(letterElement);
                }, delay);
            }
        }

        this.currentLetterPosition = [0, 0];
    }

    public async ColorAttemptWord(letterStatuses: LetterStatusWrapper[], delay: boolean = true): Promise<void>
    {
        if (letterStatuses.length != GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH)
        {
            throw new Error("Letter statuses length is not correct");
        }

        const flipDelay = delay ? GlobalViewSettings.K_LETTER_FLIP_DELAY : 0;
        let totalDuration = GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH * flipDelay;

        const guessAttempt = this.currentLetterPosition[0];
        for (let i = 0; i < GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH; ++i)
        {
            setTimeout(async () => {
                    let letterElement = this.GetLetterHTMLElement(guessAttempt, i);
                    this.UpdateFieldColor(guessAttempt, i, letterStatuses[i]!.status!, true);
                    
            }, flipDelay * i);            
        }

        await new Promise(resolve => setTimeout(resolve, totalDuration));
    }
    
    public async SetLetterScores(scores: number[], delay: boolean = true): Promise<void>
    {
        if (scores.length != GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH)
        {
            throw new Error("Scores length is not correct");
        }
        
        const flipDelay = delay ? GlobalViewSettings.K_LETTER_FLIP_DELAY : 0;
        const totalDuration = GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH * flipDelay;
        
        const guessAttempt = this.currentLetterPosition[0];
        for (let i = 0; i < GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH; ++i) {
            let letterElement = this.GetLetterHTMLElement(guessAttempt, i);
            let scoreDisplay = letterElement.querySelector(".score-display") as HTMLElement;
            if (!scoreDisplay) {
                throw new Error("Score display not found");
            }

            const sign = scores[i]! >= 0 ? "+" : "";
            const score = scores[i]!;
            setTimeout(async () => {
                scoreDisplay.textContent = `${sign}${score}`;
                this.UpdateScoreColor(guessAttempt, i, score, true);
            }, flipDelay * i);
        }

        await new Promise(resolve => setTimeout(resolve, totalDuration));
    }

    private AnimateLetter(letterElement: HTMLElement)
    {
        AnimationsModule.Animation_FlipInAndClear(letterElement).then(() => {});
    }
    
    public PaintLetterColorIndicator(guessAttempt: number, letterIndex: number, color: string): void {
        let letterElement = this.GetLetterHTMLElement(guessAttempt, letterIndex);
        letterElement.style.setProperty(`--indicator-color`, color);
    }
}
