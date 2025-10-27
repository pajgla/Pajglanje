import type { BrzalicaSaveStorage } from "../../save/save_storage/BrzalicaSaveStorage";
import type { BrzalicaStatsHolder } from "./BrzalicaStatsHolder";
import * as StatisticsHelpers from "../StatisticHelpers";
import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import type {TragalicaStatsHolder} from "./TragalicaStatsHolder";
import type {TragalicaSaveStorage} from "../../save/save_storage/TragalicaSaveStorage";
import {GlobalGameSettings} from "../../game/GlobalGameSettings";
import {GlobalViewSettings} from "../../siteView/GlobalViewSettings";

export class TragalicaStatisticsManager
{
    private m_StatsHolder: TragalicaStatsHolder = StatisticsHelpers.GetEmptyTragalicaStatsHolder();

    public Init()
    {
        GlobalEvents.AddListener(EventTypes.OnTragalicaGameOver, this.OnTragalicaGameOverCallback.bind(this));
    }

    public LoadDataFromSave(saveData: TragalicaSaveStorage)
    {
        if (saveData === null || saveData === undefined)
            throw new Error(`SaveData is null or undefined. Cannot load statistics.`);

        this.m_StatsHolder = saveData.stats;

        this.PopulateView();
    }

    private OnTragalicaGameOverCallback(score: number)
    {
        console.log("Tragalica game over");
        const statsHolder = this.m_StatsHolder;
        statsHolder.gamesPlayed++;
        
        const maxScore = GlobalGameSettings.K_TRAGALICA_CORRECT_LETTER_SCORE * GlobalGameSettings.K_TRAGALICA_WORD_LENGTH * GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS;
        if (maxScore === score)
        {
            statsHolder.perfectGames++;
        }

        statsHolder.totalScore += score;
        
        statsHolder.averageScore = statsHolder.totalScore / statsHolder.gamesPlayed;

        this.PopulateView();
    }

    public PopulateView()
    {
        GlobalEvents.Dispatch(EventTypes.PopulateTragalicaStatisticsView, this.m_StatsHolder);
    }
}