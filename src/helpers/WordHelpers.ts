import {
    ELetterStatus,
    GuessAttemptData,
    GuessAttemptStatus,
    type LetterStatusWrapper
} from "../game/services/word_services/AttemptStatuses";

const diagraphs = ["nj", "lj", "dž"];

export function GetDiagraphs(formatToWorkingCase: boolean = true)
{
    return diagraphs.map( diagraph => ToWorkingCase(diagraph));
}

export function SerbianWordToCharArray(word: string): string[] {
    if (word === null)
    {
        throw new Error("Provided invalid word string.");
    }

    word = ToWorkingCase(word);
    let formattedDiagraphs = GetDiagraphs();

    let result: string[] = Array();
    for (let i = 0; i < word.length;)
    {
        if (i < word.length - 1)
        {
            const twoChar = word.slice(i, i + 2);
            if (formattedDiagraphs.includes(twoChar))
            {
                result.push(twoChar);
                i += 2;
                continue;
            }
        }

        result.push(word[i]!);
        ++i;
    }

    return result;
}

export function SerbianWordLength(word: string) :number
{
    if (word === null)
    {
        throw new Error("Provided null or undefined word");
    }

    let charArray: string[] = SerbianWordToCharArray(word);
    return charArray.length;
}

//Changes the word case to accepted case globally in the code. You should never work with a string
//before running this
export function ToWorkingCase(word: string) :string
{
    return word.toUpperCase();
}

export function CheckWordAttempt(correctWord: string, attemptWord: string, dictionary: string[]): GuessAttemptData
{
    const attemptWordLength = SerbianWordLength(attemptWord);
    const guessWordLength = SerbianWordLength(correctWord);
    
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

    attemptWord = ToWorkingCase(attemptWord);
    if (!dictionary.includes(attemptWord)) {
        result.guessAttemptStatus = GuessAttemptStatus.NotInDictionary;
        return result;
    }

    const attemptWordCharArray = SerbianWordToCharArray(attemptWord);
    const correctWordCharArray = SerbianWordToCharArray(ToWorkingCase(correctWord));
    let letterStatuses: LetterStatusWrapper[] = Array();
    let remainingCharsFreq: Record<string, number> = {};

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