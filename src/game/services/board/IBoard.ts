import type { LetterStatusWrapper } from "../word_services/AttemptStatuses";

export interface IBoard {
    CreateBoardElement(): void;
    NextGuess(): void;
    RetractLetter(): void;
    FillNextLetter(letter: string): void;
    GetCurrentGuess(): string;
    ColorAttemptWord(letterStatuses: LetterStatusWrapper[], delay: boolean): Promise<void>;
    GetCurrentAttemptPosition(): number;
    GetIDForField(guessAttempt: number, letterIndex: number): string;
    ClearBoard(): void;
    PaintLetterColorIndicator(guessAttempt: number, letterIndex: number, color: string): void;
    GetLetterHTMLElement(guessAttempt: number, letterIndex: number): HTMLElement;
    SetLetterScores(scores: number[], delay: boolean): Promise<void>;
}