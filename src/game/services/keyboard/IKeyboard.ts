import type { LetterStatusWrapper } from "../../../game/services/word_services/AttemptStatuses";

export interface IKeyboard {
    Init(): void;
    SetEnabled(enabled: boolean): void;
    ChangeLockState(newState: boolean): void;
    ColorKeys(letterStatuses: LetterStatusWrapper[], instant: boolean): Promise<void>;
    ClearAllColoring(): void;
}