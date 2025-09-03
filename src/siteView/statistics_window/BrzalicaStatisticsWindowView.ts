import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { GlobalGameSettings } from "../../game/GlobalGameSettings";
import type { BrzalicaStatsHolder } from "../../statistics/brzalica/BrzalicaStatsHolder";
import * as StatisticHelpers from "../../statistics/StatisticHelpers";
import { GlobalViewSettings } from "../GlobalViewSettings";
import { StatisticsWindowViewBase } from "./StatisticsWindowViewBase";

export class BrzalicaStatisticsWindowView extends StatisticsWindowViewBase
{
    constructor()
    {
        super();
    }

    public override Init()
    {
        super.Init();

        GlobalEvents.AddListener(EventTypes.PopulateBrzalicaStatisticsView, this.OnPopulateStatisticsViewRequested.bind(this));
    }

    private OnPopulateStatisticsViewRequested(saveData: BrzalicaStatsHolder)
    {
        let gamesPlayedElement = document.getElementById(GlobalViewSettings.K_GAMES_PLAYED_ELEMENT_ID);
        if (gamesPlayedElement === null)
        {
            throw new Error("Cannot find games played element");
        }

        gamesPlayedElement.textContent = saveData.gamesPlayed.toLocaleString('en-us', {maximumFractionDigits: 1, minimumFractionDigits: 0});

        let gamesWonElement = document.getElementById(GlobalViewSettings.K_GAMES_WON_ELEMENT_ID);
        if (gamesWonElement === null)
        {
            throw new Error("Cannot find games won element");
        }

        gamesWonElement.textContent = saveData.averageAttemptsPerWord.toLocaleString('en-us', {maximumFractionDigits: 1, minimumFractionDigits: 0});

        let gamesWonPercentageElement = document.getElementById(GlobalViewSettings.K_GAMES_WON_PERCENTAGE_ELEMENT_ID);
        if (gamesWonPercentageElement === null)
        {
            throw new Error("Cannot find games won percentage element");
        }

        gamesWonPercentageElement.textContent = saveData.totalWordsGuessed.toString();

        let currentWinStreakElement = document.getElementById(GlobalViewSettings.K_CURRENT_WINSTREAK_ELEMENT_ID);
        if (currentWinStreakElement === null)
        {
            throw new Error("Cannot find current winstreak element");
        }

        currentWinStreakElement.textContent = saveData.averageGuessedWordsPerGame.toLocaleString('en-us', {minimumFractionDigits: 0, maximumFractionDigits: 1});

        let bestWinStreakElement = document.getElementById(GlobalViewSettings.K_BEST_WINSTREAK_ELEMENT_ID);
        if (bestWinStreakElement === null)
        {
            throw new Error("Cannot find best winstreak element");
        }

        bestWinStreakElement.textContent = saveData.bestGuessStreak?.toString() ?? '/';
        
        let savedHistogram = saveData.histogram;
        for (let i = 0; i < GlobalGameSettings.K_PAJGLANJE_ATTEMPTS; ++i)
        {
            let graphElementID = StatisticHelpers.NumToGuessGraph(i + 1);
            let graphElement = document.getElementById(graphElementID);
            if (graphElement === null)
            {
                throw new Error("Cannot find graph element with id" + graphElementID);
            }

            let savedGuessCount = (savedHistogram[i] ?? 0);
            let graphWidth = saveData.totalWordsGuessed === 0 ? 0 : (savedGuessCount / saveData.totalWordsGuessed) * 100;
            let alignRight = true;
            if (graphWidth < GlobalViewSettings.K_MIN_STATISTICS_GRAPH_WIDTH)
            {
                graphWidth = GlobalViewSettings.K_MIN_STATISTICS_GRAPH_WIDTH;
                alignRight = false;
            }

            graphElement.style.width = `${graphWidth}%`;
            if (alignRight)
            {
                graphElement.classList.add('align-right');
            }

            let graphNumElementID = StatisticHelpers.NumToGuessNum(i + 1);
            let graphNumElement = document.getElementById(graphNumElementID);
            if (graphNumElement === null)
            {
                throw new Error("Cannot find graph num element with ID " + graphNumElementID);
            }

            graphNumElement!.textContent = savedGuessCount.toString();
        }
    }

    protected StartNextGameTimer(): void {
        super.StartNextGameTimer_Internal(GlobalGameSettings.K_BRZALICA_START_TIME, GlobalGameSettings.K_NEXT_BRZALICA_IN_HOURS);
    }
}