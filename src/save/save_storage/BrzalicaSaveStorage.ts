import type { EGameState } from "../../game/enums/EGameState";
import type { BrzalicaStatsHolder } from "../../statistics/brzalica/BrzalicaStatsHolder";
import type { WordSaveStorage } from "./WordSaveStorage";

export type BrzalicaSaveStorage = {
    lastBrzalicaTime: number;
    gameState: EGameState;
    wordSave: WordSaveStorage;
    startDate: Date;
    wordSolvingStartDate: Date;
    currentWordID: number;
    stats: BrzalicaStatsHolder;
    currentNumberOfGuesses: number;
}