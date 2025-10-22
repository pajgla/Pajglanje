import type {ITragalicaWordService} from "./ITragalicaWordService";
import type {GuessAttemptData} from "./AttemptStatuses";
import type {IDictionaryHolder} from "../dictionaries/IDictionary";
import * as WordHelpers from "../../../helpers/WordHelpers";
import {UniqueRandom} from "../../../helpers/UniqueRandom";

export class TragalicaWordService implements ITragalicaWordService
{
    private m_DictionaryHolder: IDictionaryHolder | null = null;
    private m_HiddenWords: string[] = [];
    private m_Randomizer: UniqueRandom | null = null;
    private m_MasterWord: string = "";
    
    Init(dictionaryHolder: IDictionaryHolder, tragalicaTime: number, hiddenWords: number): void {
        if (!dictionaryHolder)
        {
            throw new Error("Provided null dictionary holder for Tragalica Initialization");
        }
        
        this.m_DictionaryHolder = dictionaryHolder;

        this.ChooseMasterWord(tragalicaTime);
        
        //We can use tragalica time as a seed and also as a used index, so we don't master for as a hidden word
        const masterWordIndex = this.m_DictionaryHolder.GetGuessWordsDictionary().indexOf(this.m_MasterWord);
        //Even if masterWordIndex is -1, we can still continue since we are 100% sure we won't have all green rows
        
        this.m_Randomizer = new UniqueRandom(tragalicaTime.toString(), [masterWordIndex]);
        
        this.ChooseHiddenWords(hiddenWords);
        
        console.log(`Tragalica Word Service Initialized with master word: ${this.m_MasterWord} and hidden words: ${this.m_HiddenWords.join(",")}`)
    }

    ChooseMasterWord(tragalicaTime: number): void
    {
        if (!this.m_DictionaryHolder)
        {
            throw new Error("Dictionary holder is not initialized");
        }
        
        let dailyWordsArray = this.m_DictionaryHolder.GetDailyWordsDictionary();
        if (tragalicaTime >= dailyWordsArray.length)
        {
            throw new Error("Tragalica time is out of bounds");
        }
        
        this.m_MasterWord = dailyWordsArray[tragalicaTime]!;
    }
    
    CheckWordAttempt(attemptWord: string, index: number): GuessAttemptData {
        if (!this.m_DictionaryHolder)
        {
            throw new Error("Dictionary holder is not initialized");
        }
        if (index >= this.m_HiddenWords.length)
        {
            throw new Error("Index is out of bounds");
        }
        
        return WordHelpers.CheckWordAttempt(this.m_HiddenWords[index]!, attemptWord, this.m_DictionaryHolder.GetGuessWordsDictionary());
    }

    ChooseHiddenWords(amount: number): void {
        if (!this.m_Randomizer)
        {
            throw new Error("Randomizer is not initialized");
        }
        
        if (!this.m_DictionaryHolder)
        {
            throw new Error("Dictionary holder is not initialized");
        }
        
        const maxIndex = this.m_DictionaryHolder.GetGuessWordsDictionary().length - 1;
        for (let i = 0; i < amount; i++)
        {
            const randomIndex = this.m_Randomizer.GetUnique(maxIndex);
            let chosenWord = this.m_DictionaryHolder.GetGuessWordsDictionary()[randomIndex]!;
            this.m_HiddenWords.push(chosenWord);
        }
    }

    GetHiddenWord(index: number): string {
        if (index >= this.m_HiddenWords.length)
        {
            throw new Error("Index is out of bounds");
        }
        
        return this.m_HiddenWords[index]!;
    }
    
    GetMasterWord(): string {
        return this.m_MasterWord;
    }
}