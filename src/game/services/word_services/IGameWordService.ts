import type { IDictionaryHolder } from "../dictionaries/IDictionary";
import type { GuessAttemptData } from "./AttemptStatuses";

export interface IGameWordService
{
    Init(dictionaryHolder: IDictionaryHolder): void;
    ChooseGuessWord(index: number): void;
    GetGuessWord(): string;
    CheckWordAttempt(attemptWord: string): GuessAttemptData;
    GetDailyWordsDictionaryLength(): number;
}