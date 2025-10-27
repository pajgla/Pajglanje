import { EGameState } from "../game/enums/EGameState";
import { GlobalGameSettings } from "../game/GlobalGameSettings";
import { SaveBase } from "./SaveBase";
import type {TragalicaSaveStorage} from "./save_storage/TragalicaSaveStorage";
import {GetEmptyTragalicaStatsHolder} from "../statistics/StatisticHelpers";

export class TragalicaSave extends SaveBase<TragalicaSaveStorage> {

    public override Init()
    {
        let savedGameJSON = window.localStorage.getItem(GlobalGameSettings.K_TRAGALICA_SAVEGAME_KEY);

        if (savedGameJSON === null || savedGameJSON === undefined)
        {
            //No local storage found
            return;
        }

        this.m_SaveGame = JSON.parse(savedGameJSON) as TragalicaSaveStorage;
        if (this.m_SaveGame === null || this.m_SaveGame === undefined)
        {
            throw new Error("An error occured while loading local save game.");
        }

        if (this.m_SaveGameVersion !== this.m_SaveGameVersion)
        {
            //Resolve save game
        }
    }

    public override TriggerSave(saveKey: string = GlobalGameSettings.K_TRAGALICA_SAVEGAME_KEY): void {
        super.TriggerSave(saveKey);
    }

    protected override GetEmptySaveGame(): TragalicaSaveStorage {
        return {
            lastTragalicaTime: 0,
            gameState: EGameState.InProgress,
            wordSave: {guesses: []},
            stats: GetEmptyTragalicaStatsHolder(),
            score: 0
        }
    }
}