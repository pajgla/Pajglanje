import { EGameState } from "../game/enums/EGameState";
import { GlobalGameSettings } from "../game/GlobalGameSettings";
import { SerbianWordToCharArray } from "../helpers/WordHelpers";
import type { OLD_PajglaSaveStorage, OLD_PajglaStatisticsSaveStorage, PajglaSaveStorage } from "./save_storage/PajglaSaveStorage";
import { SaveBase } from "./SaveBase";
import { ResolveGameState, ResolveOldHistogram } from "./SaveFileResolvers";
import {GlobalEvents} from "../core/EventBus";
import {EventTypes} from "../Events/EventTypes";
import {UserManager} from "../managers/user/UserManager";

export class PajglanjeSave extends SaveBase<PajglaSaveStorage> {

    public override async Init()
    {
        const userManager = UserManager.Get();
        if (userManager === null)
        {
            throw new Error("User manager is null");
        }
        
        if (!userManager.GetIsUserLoggedIn())
        {
            GlobalEvents.AddListener(EventTypes.OnAutologinFinished, this.OnAutologinFinished.bind(this));
        }
        else
        {
            const userID = userManager.GetUserID();
            if (userID !== null)
            {
                const dataKey = `${userID}${GlobalGameSettings.K_PAJGLA_SAVEGAME_KEY}`;
                const serverSaveData = await userManager.LoadData(dataKey);
                if (serverSaveData !== "")
                {
                    //#TODO override local save
                    console.log("Server save data found");
                }
            }
        }
        
        if (this.HasV1SaveData())
        {
            //Load old save
            let oldSaveGameJSON = window.localStorage.getItem(GlobalGameSettings.K_OLD_PAJGLA_SAVEGAME_KEY);
            let parsedSaveGame = JSON.parse(oldSaveGameJSON!) as OLD_PajglaSaveStorage;
            if (parsedSaveGame === null || parsedSaveGame === undefined)
            {
                throw new Error("An error occured while reading old save");
            }

            //Change old save key
            window.localStorage.removeItem(GlobalGameSettings.K_OLD_PAJGLA_SAVEGAME_KEY);
            window.localStorage.setItem("OLD_" + GlobalGameSettings.K_OLD_PAJGLA_SAVEGAME_KEY, oldSaveGameJSON!);


            this.m_SaveGame.lastPajglaTime = parsedSaveGame.time;
            this.m_SaveGame.gameState = ResolveGameState(parsedSaveGame.status.name);
            for (let word of parsedSaveGame.guesses)
            {
                let parsedWord = SerbianWordToCharArray(word);
                this.m_SaveGame.wordSave.guesses.push(parsedWord);
            }
            
            //Load stats
            let oldStatisticsSaveJSON = window.localStorage.getItem(GlobalGameSettings.K_OLD_STATISTICS_SAVEGAME_KEY);
            if (oldStatisticsSaveJSON === null)
            {
                throw new Error("Cannot load old statistics save");
            }

            let parsedStatistics = JSON.parse(oldStatisticsSaveJSON) as OLD_PajglaStatisticsSaveStorage;
            if (!parsedStatistics)
            {
                throw new Error("Cannot parse old statistics save");
            }

            //Change old statistics key
            window.localStorage.removeItem(GlobalGameSettings.K_OLD_STATISTICS_SAVEGAME_KEY);
            window.localStorage.setItem("OLD_" + GlobalGameSettings.K_OLD_STATISTICS_SAVEGAME_KEY, oldStatisticsSaveJSON!);

            this.m_SaveGame.stats.gamesWon = parsedStatistics.won;
            this.m_SaveGame.stats.bestStreak = parsedStatistics.longestStreak;
            this.m_SaveGame.stats.currentStreak = parsedStatistics.currentStreak;
            this.m_SaveGame.stats.gamesPlayed = parsedStatistics.totalPlayed;
            this.m_SaveGame.stats.histogram = ResolveOldHistogram(parsedStatistics.histogram);

            this.TriggerSave(GlobalGameSettings.K_PAJGLA_SAVEGAME_KEY);
        }
        else
        {            
            let savedGameJSON = window.localStorage.getItem(GlobalGameSettings.K_PAJGLA_SAVEGAME_KEY);

            if (savedGameJSON === null || savedGameJSON === undefined)
            {
                //No local storage found
                return;
            }

            this.m_SaveGame = JSON.parse(savedGameJSON) as PajglaSaveStorage;
            if (this.m_SaveGame === null || this.m_SaveGame === undefined)
            {
                throw new Error("An error occured while loading local save game.");
            }

            if (this.m_SaveGameVersion !== this.m_SaveGameVersion)
            {
                //Resolve save game
            }
        }
    }
    
    private OnAutologinFinished(success: boolean)
    {
        if (success)
        {
            console.log("Autologin finished");
        }
    }

    private HasV1SaveData(): boolean
    {
        return window.localStorage.getItem(GlobalGameSettings.K_OLD_PAJGLA_SAVEGAME_KEY) !== null;
    }

    protected override GetEmptySaveGame(): PajglaSaveStorage {
        return {
            lastPajglaTime: 0,
            gameState: EGameState.InProgress,
            stats: {gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0, histogram: Array(GlobalGameSettings.K_PAJGLANJE_ATTEMPTS).fill(0)},
            wordSave: {guesses: []}
        }
    }
}