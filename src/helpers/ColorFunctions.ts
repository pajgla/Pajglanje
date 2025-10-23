import { ELetterStatus } from "../game/services/word_services/AttemptStatuses";

const DEFAULT_CORRECT_LETTER_COLOR = "rgba(70, 133, 64, 1)"
const DEFAULT_PRESENT_LETTER_COLOR = "linear-gradient(135deg, rgba(214, 186, 70, 0.9) 0%, rgba(220, 180, 90, 0.8) 100%)";
const DEFAULT_ABSENT_LETTER_COLOR = "linear-gradient(#111214, #111214)";
const DEFAULT_ERROR_LETTER_COLOR = "linear-gradient(135deg, rgba(220, 70, 90, 0.9) 0%, rgba(240, 90, 110, 0.8) 100%)";

export function ConvertLetterStatusToColor(status: ELetterStatus): string 
{
    switch (status)
    {
        case ELetterStatus.Correct:
            return DEFAULT_CORRECT_LETTER_COLOR;
        case ELetterStatus.Present:
            return DEFAULT_PRESENT_LETTER_COLOR;
        case ELetterStatus.Absent:
            return DEFAULT_ABSENT_LETTER_COLOR;
        default:
            throw new Error(`Unknown letter status: ${status}`);
            return DEFAULT_ERROR_LETTER_COLOR; // Fallback color for errors
    }
}

export function GetStyleForLetterStatus(status: ELetterStatus): string
{
    return `background: ${ConvertLetterStatusToColor(status)}; border-color: ${ConvertLetterStatusToColor(status)};`;
}

export function GetStyleForKeyboardButton(status: ELetterStatus): string
{
    if (status === ELetterStatus.Absent)
    {
        return `background-color: transparent;`
    }
    else
    {
        return `background: ${ConvertLetterStatusToColor(status)}; border-color: ${ConvertLetterStatusToColor(status)};`;
    }
}