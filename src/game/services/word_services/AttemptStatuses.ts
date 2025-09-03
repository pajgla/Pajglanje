import { GlobalGameSettings } from "../../GlobalGameSettings";

export enum GuessAttemptStatus {
    Correct,
    Incorrect,
    TooShort,
    NotInDictionary
}

export enum ELetterStatus {
    Correct,
    Present,
    Absent
}

export interface LetterStatusWrapper
{
    char: string;
    status: ELetterStatus;
}

export class GuessAttemptData {
    public guessAttemptStatus: GuessAttemptStatus = GuessAttemptStatus.Incorrect;
    public letterStatuses: LetterStatusWrapper[] = Array(GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH);
}