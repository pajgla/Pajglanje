export function QuerySelectAndCheck(classID: string): HTMLElement | null
{
    const element = document.querySelector(classID);
    if (!element)
    {
        throw new Error(`Cannot find element with class ID ${classID}`);
    }

    return element as HTMLElement;
}

export function QuerySelectAllAndCheck(classID: string): NodeListOf<Element> | null
{
    const elements = document.querySelectorAll(classID);
    if (!elements || elements.length === 0)
    {
        throw new Error(`Cannot find elements with class ID ${classID}`);
    }

    return elements;
}

export function GetElementByIDAndCheck(ID: string): HTMLElement | null
{
    const element = document.getElementById(ID);
    if (!element)
    {
        throw new Error(`Cannot find element with ID ${ID}`);
    }

    return element;
}