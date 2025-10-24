import type { EGameState } from "../../game/enums/EGameState";
import type { PajglanjeStatsHolder } from "../../statistics/pajglanje/PajglanjeStatsHolder";
import type { WordSaveStorage } from "./WordSaveStorage";

export type TragalicaSaveStorage = {
    lastTragalicaTime: number;
    gameState: EGameState;
    wordSave: WordSaveStorage;
}