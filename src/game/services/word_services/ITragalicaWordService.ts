import type {IDictionaryHolder} from "../dictionaries/IDictionary";
import type {GuessAttemptData} from "./AttemptStatuses";


export interface ITragalicaWordService 
{
    Init(dictionaryHolder: IDictionaryHolder, tragalicaTime: number, hiddenWords: number): void;
    GetHiddenWord(index: number): string;
    GetMasterWord(): string;
    CheckWordAttempt(attemptWord: string, index: number): GuessAttemptData;
}