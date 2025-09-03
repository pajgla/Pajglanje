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