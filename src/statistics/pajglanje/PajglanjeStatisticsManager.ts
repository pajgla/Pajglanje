import { EGameState } from "../../game/enums/EGameState";
import { GlobalGameSettings } from "../../game/GlobalGameSettings";
import type { PajglaSaveStorage } from "../../save/save_storage/PajglaSaveStorage";
import { GlobalViewSettings } from "../../siteView/GlobalViewSettings";
import type { PajglanjeStatsHolder } from "./PajglanjeStatsHolder";
import * as StatisticHelpers from "../StatisticHelpers";

export class PajglanjeStatisticsManager
{
    private m_Stats: PajglanjeStatsHolder = {gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0, histogram: Array(GlobalGameSettings.K_PAJGLANJE_ATTEMPTS).fill(0)};
    private m_CurrentAttemptPosition: number = -1;

    public LoadDataFromSave(saveData: PajglaSaveStorage)
    {
        if (saveData === null || saveData === undefined)
        {
            throw new Error("Provided null or undefined save data");
        }

        this.m_Stats = saveData.stats;

        if (saveData.gameState === EGameState.Won)
        {
            //If we have guesses saved, fetch last guess attempt position and that graph in histogram
            let i = 0;
            for (let charList of saveData.wordSave?.guesses)
            {
                if (charList === null || charList === undefined || charList.length === 0)
                {
                    break;
                }

                i++;
            }        

            this.m_CurrentAttemptPosition = i;
        }
    }

    public OnGameWon(attemptCount: number)
    {
        this.m_Stats.gamesWon++;
        this.m_Stats.gamesPlayed++;
        this.m_Stats.currentStreak++;
        this.m_Stats.bestStreak = Math.max(this.m_Stats.bestStreak, this.m_Stats.currentStreak);
        this.m_Stats.histogram[attemptCount]!++;
        this.m_CurrentAttemptPosition = attemptCount + 1;

        this.PaintHistogram();
    }

    public OnGameLost()
    {
        this.m_Stats.gamesPlayed++;
        this.m_Stats.currentStreak = 0;

        this.PaintHistogram();
    }

    public PaintHistogram()
    {
        let gamesPlayedElement = document.getElementById(GlobalViewSettings.K_GAMES_PLAYED_ELEMENT_ID);
        if (gamesPlayedElement === null)
        {
            throw new Error("Cannot find games played element");
        }

        gamesPlayedElement.textContent = this.m_Stats.gamesPlayed.toString();

        let gamesWonElement = document.getElementById(GlobalViewSettings.K_GAMES_WON_ELEMENT_ID);
        if (gamesWonElement === null)
        {
            throw new Error("Cannot find games won element");
        }

        gamesWonElement.textContent = this.m_Stats.gamesWon.toString();

        const gamesWonPercentage = this.m_Stats.gamesPlayed === 0 ? 0 : (this.m_Stats.gamesWon / this.m_Stats.gamesPlayed) * 100;
        let gamesWonPercentageElement = document.getElementById(GlobalViewSettings.K_GAMES_WON_PERCENTAGE_ELEMENT_ID);
        if (gamesWonPercentageElement === null)
        {
            throw new Error("Cannot find games won percentage element");
        }

        gamesWonPercentageElement.textContent = Math.round(gamesWonPercentage).toString() + '%';

        let currentWinStreakElement = document.getElementById(GlobalViewSettings.K_CURRENT_WINSTREAK_ELEMENT_ID);
        if (currentWinStreakElement === null)
        {
            throw new Error("Cannot find current winstreak element");
        }

        currentWinStreakElement.textContent = this.m_Stats.currentStreak.toString();

        let bestWinStreakElement = document.getElementById(GlobalViewSettings.K_BEST_WINSTREAK_ELEMENT_ID);
        if (bestWinStreakElement === null)
        {
            throw new Error("Cannot find best winstreak element");
        }

        bestWinStreakElement.textContent = this.m_Stats.bestStreak.toString();

        let savedHistogram = this.m_Stats.histogram;
        for (let i = 0; i < GlobalGameSettings.K_PAJGLANJE_ATTEMPTS; ++i)
        {
            let graphElementID = StatisticHelpers.NumToGuessGraph(i + 1);
            let graphElement = document.getElementById(graphElementID);
            if (graphElement === null)
            {
                throw new Error("Cannot find graph element with id" + graphElementID);
            }

            let savedGuessCount = (savedHistogram[i] ?? 0);
            let graphWidth = this.m_Stats.gamesWon === 0 ? 0 : (savedGuessCount / this.m_Stats.gamesWon) * 100;
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

            if (this.m_CurrentAttemptPosition >= 0 && i === this.m_CurrentAttemptPosition - 1)
            {
                graphElement.style.background = GlobalViewSettings.K_CURRENT_GUESS_GRAPH_COLOR;
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
}