import type { EGameState } from "../../game/enums/EGameState";
import type { PajglanjeStatsHolder } from "../../statistics/pajglanje/PajglanjeStatsHolder";
import type { WordSaveStorage } from "./WordSaveStorage";

export type PajglaSaveStorage = {
    lastPajglaTime: number;
    gameState: EGameState;
    wordSave: WordSaveStorage;
    stats: PajglanjeStatsHolder;
}

//This is the v1 save of pajglanje.com
export type OLD_PajglaSaveStorage = {
    status: any,
    time: any,
    correctWord: any,
    guesses: any,
    letters: any,
    replaying: any
}

//This is the v1 save of statistics for pajglanje.com
export type OLD_PajglaStatisticsSaveStorage = {
    won: any,
    lost: any,
    totalPlayed: any,
    experience: any,
    currentStreak: any,
    longestStreak: any,
    histogram: any
}