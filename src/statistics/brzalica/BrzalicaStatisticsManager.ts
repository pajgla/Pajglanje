import type { BrzalicaSaveStorage } from "../../save/save_storage/BrzalicaSaveStorage";
import type { BrzalicaStatsHolder } from "./BrzalicaStatsHolder";
import * as StatisticsHelpers from "../StatisticHelpers";
import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";

export class BrzalicaStatisticsManager
{
    private m_StatsHolder: BrzalicaStatsHolder = StatisticsHelpers.GetEmptyBrzalicaStatsHolder();

    public Init()
    {
        GlobalEvents.AddListener(EventTypes.OnBrzalicaWordGuessed, this.OnBrzalicaWordGuessedCallback.bind(this));
        GlobalEvents.AddListener(EventTypes.OnBrzalicaGameOver, this.OnBrzalicaTimeOutCallback.bind(this));
    }

    public LoadDataFromSave(saveData: BrzalicaSaveStorage)
    {
        if (saveData === null || saveData === undefined)
            throw new Error(`SaveData is null or undefined. Cannot load statistics.`);

        this.m_StatsHolder = saveData.stats;

        this.PopulateView();
    }

    private OnBrzalicaWordGuessedCallback(attempts: number, solveTimeInSeconds: number)
    {
        const statsHolder = this.m_StatsHolder;
        statsHolder.totalAttempts += attempts;
        statsHolder.totalWordsGuessed++;
        statsHolder.averageAttemptsPerWord = statsHolder.totalAttempts / statsHolder.totalWordsGuessed;

        statsHolder.totalTimeTaken += solveTimeInSeconds;
        statsHolder.averageTimePerWord = statsHolder.totalTimeTaken / statsHolder.totalWordsGuessed;

        if (statsHolder.fastestSolve === null)
        {
            statsHolder.fastestSolve = solveTimeInSeconds;
        }
        else if (solveTimeInSeconds < statsHolder.fastestSolve)
        {
            statsHolder.fastestSolve = solveTimeInSeconds;
        }

        if (statsHolder.histogram)
        {
            statsHolder.histogram[attempts - 1] = (statsHolder.histogram[attempts - 1] ?? 0) + 1;
        }

        this.PopulateView();
    }

    private OnBrzalicaTimeOutCallback(wordsGuessed: number)
    {
        const statsHolder = this.m_StatsHolder;
        statsHolder.gamesPlayed++;
        statsHolder.averageGuessedWordsPerGame = statsHolder.totalWordsGuessed / statsHolder.gamesPlayed;
        
        if (statsHolder.bestGuessStreak === null)
        {
            statsHolder.bestGuessStreak = wordsGuessed; 
        }
        else if (wordsGuessed > statsHolder.bestGuessStreak)
        {
            statsHolder.bestGuessStreak = wordsGuessed;
        }

        this.PopulateView();
    }

    public PopulateView()
    {
        GlobalEvents.Dispatch(EventTypes.PopulateBrzalicaStatisticsView, this.m_StatsHolder);
    }
}