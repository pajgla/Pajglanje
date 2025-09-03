import { EGameState } from "../game/enums/EGameState";
import { GlobalGameSettings } from "../game/GlobalGameSettings";
import type { BrzalicaSaveStorage } from "./save_storage/BrzalicaSaveStorage";
import { SaveBase } from "./SaveBase";
import * as StatisticsHelpers from "../statistics/StatisticHelpers";

export class BrzalicaSave extends SaveBase<BrzalicaSaveStorage> {

    public override Init(): void {
        let savedGameJSON = window.localStorage.getItem(GlobalGameSettings.K_BRZALICA_SAVEGAME_KEY);

        if (savedGameJSON === null || savedGameJSON === undefined)
        {
            //No local storage found
            return;
        }

        this.m_SaveGame = JSON.parse(savedGameJSON) as BrzalicaSaveStorage;
        if (this.m_SaveGame === null || this.m_SaveGame === undefined)
        {
            throw new Error("An error occured while loading local save game.");
        }
    }

    public override TriggerSave(saveKey: string = GlobalGameSettings.K_BRZALICA_SAVEGAME_KEY): void {
        super.TriggerSave(saveKey);
    }

    protected GetEmptySaveGame(): BrzalicaSaveStorage {
        return {
            lastBrzalicaTime: -1,
            gameState: EGameState.Waiting,
            startDate: new Date(),
            wordSolvingStartDate: new Date(),
            wordSave: {guesses: []},
            currentWordID: -1,
            stats: StatisticsHelpers.GetEmptyBrzalicaStatsHolder(),
            currentNumberOfGuesses: 0,
        }
    }
}