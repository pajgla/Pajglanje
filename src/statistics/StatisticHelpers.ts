import { GlobalGameSettings } from "../game/GlobalGameSettings";
import type { BrzalicaStatsHolder } from "./brzalica/BrzalicaStatsHolder";

export function NumToGuessGraph(num: number)
{
    return NumToOrdinal(num) + "GuessGraph";
}

export function NumToGuessNum(num: number)
{
    return NumToOrdinal(num) + "GuessNum";
}

function NumToOrdinal(num: number)
{
    switch (num)
    {
        case 1: return "first";
        case 2: return "second";
        case 3: return "third";
        case 4: return "fourth";
        case 5: return "fifth"
        case 6: return "sixth";
        default:
            console.error("NumToOrdinal -> Wrong number provided (not 1-6). Provided: " + num);
            return null;
    }
}

export function GetEmptyBrzalicaStatsHolder(): BrzalicaStatsHolder
{
    return {
            gamesPlayed: 0,
            totalWordsGuessed: 0,
            averageAttemptsPerWord: 0,
            totalAttempts: 0,
            averageGuessedWordsPerGame: 0,
            averageTimePerWord: 0,
            totalTimeTaken: 0, 
            fastestSolve: null, 
            bestGuessStreak: null,
            histogram: Array(GlobalGameSettings.K_BRZALICA_ATTEMPTS).fill(0)
        };
}