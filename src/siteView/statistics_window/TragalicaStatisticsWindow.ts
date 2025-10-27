import { GlobalGameSettings } from "../../game/GlobalGameSettings";
import { StatisticsWindowViewBase } from "./StatisticsWindowViewBase";
import {GlobalEvents} from "../../core/EventBus";
import {EventTypes} from "../../Events/EventTypes";
import type {BrzalicaStatsHolder} from "../../statistics/brzalica/BrzalicaStatsHolder";
import type {TragalicaStatsHolder} from "../../statistics/tragalica/TragalicaStatsHolder";
import {GlobalViewSettings} from "../GlobalViewSettings";

export class TragalicaStatisticsWindow extends StatisticsWindowViewBase
{
    public override Init()
    {
        super.Init();

        GlobalEvents.AddListener(EventTypes.PopulateTragalicaStatisticsView, this.OnPopulateStatisticsViewRequested.bind(this));
    }

    protected StartNextGameTimer(): void {
        super.StartNextGameTimer_Internal(GlobalGameSettings.K_TRAGALICA_START_TIME, GlobalGameSettings.K_NEXT_TRAGALICA_IN_HOURS);
    }

    private OnPopulateStatisticsViewRequested(saveData: TragalicaStatsHolder)
    {
        if (!saveData)
        {
            throw new Error("Cannot populate statistics view with null save data");
        }

        let gamesPlayedElement = document.getElementById(GlobalViewSettings.K_GAMES_PLAYED_ELEMENT_ID);
        if (gamesPlayedElement === null)
        {
            throw new Error("Cannot find games played element");
        }
        
        gamesPlayedElement.textContent = saveData.gamesPlayed.toString();
        
        let perfectGames = document.getElementById(GlobalViewSettings.K_PERFECT_GAMES_ELEMENT_ID);
        if (perfectGames === null)
        {
            throw new Error("Cannot find perfect games element");
        }
        
        perfectGames.textContent = saveData.perfectGames.toLocaleString('en-us', {maximumFractionDigits: 1, minimumFractionDigits: 0});
        
        let averageScore = document.getElementById(GlobalViewSettings.K_AVERAGE_SCORE_ELEMENT_ID);
        if (averageScore === null)
        {
            throw new Error("Cannot find average score element");
        }
        
        averageScore.textContent = saveData.averageScore.toLocaleString('en-us', {maximumFractionDigits: 1, minimumFractionDigits: 0});
        
        let totalScore = document.getElementById(GlobalViewSettings.K_TOTAL_SCORE_ELEMENT_ID);
        if (totalScore === null)
        {
            throw new Error("Cannot find total score element");
        }
        
        totalScore.textContent = saveData.totalScore.toLocaleString('en-us', {maximumFractionDigits: 1, minimumFractionDigits: 0});
    }
}