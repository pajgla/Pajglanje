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
    //#TODO !IMPORTANT! - This won't work for a game mode where we have different word length than pajglanje
    public letterStatuses: LetterStatusWrapper[] = Array(GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH);
}