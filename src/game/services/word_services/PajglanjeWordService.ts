import type { IGameWordService } from "./IGameWordService";
import { GuessAttemptData, GuessAttemptStatus, ELetterStatus, type LetterStatusWrapper } from "./AttemptStatuses";
import * as WordHelpers from '../../../helpers/WordHelpers'
import type { IDictionaryHolder } from "../dictionaries/IDictionary";
import { ShowErrorNotification } from "../../../helpers/NotificationHelpers";
import { GlobalGameSettings } from "../../GlobalGameSettings";

export class PajglanjeWordService implements IGameWordService {
    private m_GuessWord: string = "";
    private m_DailyWordsDictionary :string[] = [];
    private m_Dictionary: string[] = [];

    public Init(dictionaryHolder: IDictionaryHolder): void{
        //Too slow?
        this.m_Dictionary = dictionaryHolder.GetGuessWordsDictionary().map((word :string) => WordHelpers.ToWorkingCase(word));
        this.m_DailyWordsDictionary = dictionaryHolder.GetDailyWordsDictionary().map((word) => WordHelpers.ToWorkingCase(word));
    }

    public GetDailyWordsDictionaryLength(): number {
        return this.m_DailyWordsDictionary.length;
    }

    public ChooseGuessWord(pajglaTime: number): void {
        if (this.m_DailyWordsDictionary === null || this.m_DailyWordsDictionary === undefined)
        {
            ShowErrorNotification("Došlo je do greške. Nema pajglanja :(", 10000);
            throw new Error("Dictionaries are not initialized. Cannot choose guess word.");
        }

        this.m_GuessWord = this.m_DailyWordsDictionary[pajglaTime]!;

        this.CheckGuessWord();
    }

    private CheckGuessWord()
    {
        if (this.m_GuessWord === null || this.m_GuessWord === undefined)
        {
            throw new Error(`Guess word is null or undefined.`);
        }

        //Check guess word length
        const guessWordLength = WordHelpers.SerbianWordLength(this.m_GuessWord);
        if (guessWordLength != GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH)
        {
            ShowErrorNotification("Došlo je do greške. Nema pajglanja :(", 10000);
            throw new Error(`Guess word is of invalid length. Length: ${guessWordLength}, Expected length: ${GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH}`);
        }

        //check if the guess word is in the dictionary. If not, add it and continue like nothing ever happened
        if (!this.m_Dictionary.includes(this.m_GuessWord))
        {
            //We can push the guess word to the dictionary, but show the console error anyway
            console.error("Guess word is not in the dictionary. Guess word will be pushed to the dictionary anyway.");
            this.m_Dictionary.push(this.m_GuessWord);
        }
    }

    public GetGuessWord(): string {
        return this.m_GuessWord;
    }

    public CheckWordAttempt(attemptWord: string): GuessAttemptData {
        const attemptWordLength = WordHelpers.SerbianWordLength(attemptWord);
        const guessWordLength = WordHelpers.SerbianWordLength(this.GetGuessWord());
        if (attemptWordLength > guessWordLength)
        {
            throw new Error(`Attempt word is longer than guess word. How did this happen? Attempt: ${attemptWord}, guess word ${this.m_GuessWord}`);
        }
        
        let result: GuessAttemptData = new GuessAttemptData();
        if (attemptWordLength < guessWordLength)
        {
            result.guessAttemptStatus = GuessAttemptStatus.TooShort;
            return result;
        }

        attemptWord = WordHelpers.ToWorkingCase(attemptWord);
        if (!this.m_Dictionary.includes(attemptWord)) {
            result.guessAttemptStatus = GuessAttemptStatus.NotInDictionary;
            return result;
        }

        const attemptWordCharArray = WordHelpers.SerbianWordToCharArray(attemptWord);
        const correctWordCharArray = WordHelpers.SerbianWordToCharArray(WordHelpers.ToWorkingCase(this.GetGuessWord()));
        let letterStatuses: LetterStatusWrapper[] = Array();
        let remainingCharsFreq: Record<string, number> = {};

        result.guessAttemptStatus = GuessAttemptStatus.Incorrect;

        let allCorrect: boolean = true;
        for (let i = 0; i < attemptWordCharArray.length; ++i)
        {
            const attemptChar = attemptWordCharArray[i];
            const correctChar = correctWordCharArray[i];

            if (!attemptChar || !correctChar)
            {
                throw new Error("One of the characters is null or undefined");
            }

            if (attemptChar == correctChar)
            {
                letterStatuses.push({char: attemptChar!, status: ELetterStatus.Correct});
            }
            else
            {
                letterStatuses.push({char: attemptChar!, status: ELetterStatus.Absent}); //Just for now
                remainingCharsFreq[correctChar] = (remainingCharsFreq[correctChar] ?? 0) + 1; //count letters
                allCorrect = false;
            }
        }

        if (allCorrect)
        {
            result.letterStatuses = letterStatuses;
            result.guessAttemptStatus = GuessAttemptStatus.Correct;
            return result;
        }

        for (let i = 0; i < attemptWordCharArray.length; ++i)
        {
            if (letterStatuses[i]!.status === ELetterStatus.Absent)
            {
                const char = attemptWordCharArray[i];
                if ((remainingCharsFreq[char!] ?? 0) > 0)
                {
                    letterStatuses[i]!.status = ELetterStatus.Present;
                    remainingCharsFreq[char!]!--;
                }
            }
        }

        result.letterStatuses = letterStatuses;

        return result;
    }
}