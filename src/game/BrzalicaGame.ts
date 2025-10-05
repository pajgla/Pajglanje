import { GlobalEvents } from "../core/EventBus";
import { EventTypes } from "../Events/EventTypes";
import { GameTimeHelpers } from "../helpers/GameTimeHelpers";
import { UniqueRandom } from "../helpers/UniqueRandom";
import { EGameState } from "./enums/EGameState";
import { GameBase } from "./GameBase";
import { GlobalGameSettings } from "./GlobalGameSettings";
import { GuessAttemptData, GuessAttemptStatus } from "./services/word_services/AttemptStatuses";
import * as NotificationHelpers from '../helpers/NotificationHelpers';
import { GlobalViewSettings } from "../siteView/GlobalViewSettings";
import { BrzalicaSave } from "../save/BrzalicaSave";
import { BrzalicaTimer } from "./services/timer/BrzalicaTimer";
import * as WordHelpers from '../helpers/WordHelpers'
import type { BrzalicaSaveStorage } from "../save/save_storage/BrzalicaSaveStorage";
import { BrzalicaStatisticsManager } from "../statistics/brzalica/BrzalicaStatisticsManager";
import { CopyToClipboard } from "../helpers/ShareHelpers";

export class BrzalicaGame extends GameBase {
    private m_Save: BrzalicaSave = new BrzalicaSave();
    private m_UniqueGenerator: UniqueRandom;
    private m_GuessDicLength: number = 0;
    private m_Timer: BrzalicaTimer = new BrzalicaTimer();
    private m_CurrentWordID: number = -1;
    private m_WordSolvingStartDate: Date = new Date();
    private m_Stats: BrzalicaStatisticsManager = new BrzalicaStatisticsManager();
    private m_GuessedWords: number = 0;

    constructor()
    {
        super();
        this.m_UniqueGenerator = new UniqueRandom(); //Just to remove CError
    }

    public override async Init(): Promise<void> {
        await super.Init();
        await this.m_Save.Init();
        this.m_Stats.Init();
    }

    protected override InitCallbacks(): void {
        super.InitCallbacks();

        GlobalEvents.AddListener(EventTypes.OnShareButtonClickedEvent, this.OnShareButtonClicked.bind(this));
    }

    private GetBrzalicaTime(): number
    {
        const brzalicaStartTime = GlobalGameSettings.K_BRZALICA_START_TIME;
        return GameTimeHelpers.GetGameTime(brzalicaStartTime, GlobalGameSettings.K_NEXT_BRZALICA_IN_HOURS) + 1; //so we don't start with 0
    }

    private InitNewBrzalicaSave()
    {
        const brzalicaTime = this.GetBrzalicaTime();
        let saveGame = this.m_Save.GetSaveGame();
        saveGame.lastBrzalicaTime = brzalicaTime;
        saveGame.gameState = EGameState.Waiting;
        saveGame.wordSave.guesses = [] as string[][];
        saveGame.currentNumberOfGuesses = 0;
        this.m_Save.OverwriteCachedSave(saveGame);
        this.m_Save.TriggerSave(GlobalGameSettings.K_BRZALICA_SAVEGAME_KEY);
    }

    private PopulateGuessesFromSave(saveData: BrzalicaSaveStorage)
    {
        let guesses = saveData.wordSave.guesses;
        for (let guess of guesses)
        {
            const attemptedWord: string = guess.join('');
            let attemptData: GuessAttemptData = this.m_WordService.CheckWordAttempt(attemptedWord);
            for (let char of guess)
            {
                this.m_Board.FillNextLetter(char);
            }

            this.m_Board.ColorAttemptWord(attemptData.letterStatuses, false);
            this.m_Keyboard.ColorKeys(attemptData.letterStatuses, true);
            this.m_Board.NextGuess();
        }
    }

    StartGame(): void {
        const brzalicaTime = this.GetBrzalicaTime();
        console.log("Brzalica time: " + brzalicaTime);
        this.InitUniqueGenerator(brzalicaTime);

        this.m_GuessDicLength = this.m_WordService.GetDailyWordsDictionaryLength();

        let saveGame = this.m_Save.GetSaveGame();
        const isNewGame = saveGame.lastBrzalicaTime != brzalicaTime;
        if (isNewGame)
        {
            console.log("Overwriting old save");
            this.InitNewBrzalicaSave();
            this.m_CurrentGameState = EGameState.Waiting;
        }
        else
        {
            console.log("Loading last save");
            if (saveGame.gameState != EGameState.Waiting)
            {
                this.RestoreFromSave(saveGame);
            }
            else
            {
                this.m_CurrentGameState = EGameState.Waiting;
            }
        }

        this.m_Stats.LoadDataFromSave(saveGame);
        this.ChangePageTitle(GlobalGameSettings.K_BRZALICA_GAME_NAME, brzalicaTime);
        GlobalEvents.Dispatch(EventTypes.OnBrzalicaLoaded, brzalicaTime);
    }

    private RestoreFromSave(saveGame: BrzalicaSaveStorage) {
        if (saveGame.gameState === EGameState.Waiting)
        {
            this.m_CurrentGameState = EGameState.Waiting;
            return;
        }

        this.m_CurrentWordID = saveGame.currentWordID;
        this.FindLastGuessWordID();

        this.m_WordSolvingStartDate = saveGame.wordSolvingStartDate;

        this.PopulateGuessesFromSave(saveGame);
        
        this.ChangeGameState(saveGame.gameState, true);

        //Only start timer is game is still in progress
        if (saveGame.gameState === EGameState.InProgress)
        {
            this.StartBrzalicaTimers(saveGame.startDate);
        }
    }

    private OnTimerExpired()
    {
        this.ChangeGameState(EGameState.Lost, false);

        //Trigger save after statistics change
        this.m_Save.TriggerSave();
    }

    private InitUniqueGenerator(gameTime: number)
    {
        const gameSeed = gameTime.toString();
        this.m_UniqueGenerator = new UniqueRandom(gameSeed);
    }

    private FindLastGuessWordID()
    {
        if (this.m_GuessDicLength <= 0)
        {
            throw new Error("Dic length not initialized");
        }

        let foundID = -1;
        //We have to find the word we stopped at last time. We will search through 500 seeded random numbers. Doubt that anyone
        //Can solve 500 words in brzalica game length so ...
        for (let i = 0; i < 500; ++i)
        {
            let id = this.m_UniqueGenerator.GetUnique(this.m_GuessDicLength);
            this.m_GuessedWords++;
            if (id === this.m_CurrentWordID)
            {
                foundID = id;
                break;
            }
        }

        if (foundID < 0)
        {
            throw new Error(`Couldn't find last guess word. We tried 500 times. Something went horribly wrong.`);
        }

        this.m_GuessedWords -= 1; //Because the last word we found is not guessed word
        this.m_WordService.ChooseGuessWord(foundID);
    }

    private StartBrzalicaTimers(startDate: Date)
    {
        const endDate = new Date(startDate).setSeconds(
            new Date(startDate).getSeconds() + GlobalGameSettings.K_BRZALICA_DURATION
        );
        const remainingTime = (new Date(endDate).getTime() - new Date().getTime()) / 1000;
        if (remainingTime > 0)
        {
            this.m_Timer.Start(remainingTime, this.OnTimerExpired.bind(this));
        }
        else
        {
            this.OnTimerExpired();
        }

        const brzalicaTime = this.GetBrzalicaTime();
        GlobalEvents.Dispatch(EventTypes.NewBrzalicaGameStartedEvent, brzalicaTime, endDate);
    }

    private ChooseNextGuessWordAndSave()
    {
        if (this.m_GuessDicLength <= 0)
        {
            throw new Error("Dic length not initialized");
        }

        let nextWordID = this.m_UniqueGenerator.GetUnique(this.m_GuessDicLength);
        this.m_WordService.ChooseGuessWord(nextWordID);

        this.m_WordSolvingStartDate = new Date();

        let saveData = this.m_Save.GetSaveGame();
        saveData.currentWordID = nextWordID;
        saveData.wordSolvingStartDate = new Date();
        this.m_Save.OverwriteCachedSave(saveData);
        this.m_Save.TriggerSave(GlobalGameSettings.K_BRZALICA_SAVEGAME_KEY);
    }

    protected ChangeGameState(newState: EGameState, fromSave: boolean): void {
        if (newState === this.m_CurrentGameState)
            return;

        let saveGame = this.m_Save.GetSaveGame();
        
        switch (newState)
        {
            case EGameState.InProgress:
                if (!fromSave)
                {
                    this.StartBrzalicaTimers(new Date());
                    this.ChooseNextGuessWordAndSave();
                    this.m_WordSolvingStartDate = new Date();
                    saveGame.startDate = new Date();
                    saveGame.wordSolvingStartDate = new Date();
                }
                break;
            case EGameState.Lost:
                this.OnGameLost();

                if (!fromSave)
                {
                    GlobalEvents.Dispatch(EventTypes.OnBrzalicaGameOver, this.m_GuessedWords);
                }
                break;
        }

        this.m_CurrentGameState = newState;

        
        saveGame.gameState = newState;
        this.m_Save.OverwriteCachedSave(saveGame);
        this.m_Save.TriggerSave();
    }

    private OnGameLost()
    {
        this.m_Keyboard.SetEnabled(false);
        this.m_Keyboard.ChangeLockState(true);
        this.m_Timer.StopTimer();

        if (this.m_Board.GetCurrentAttemptPosition() > GlobalGameSettings.K_BRZALICA_ATTEMPTS - 1)
        {
            NotificationHelpers.ShowErrorNotification(`${GlobalViewSettings.K_BRZALICA_FAILED} ${this.m_WordService.GetGuessWord()}`);
        }
        else
        {
            NotificationHelpers.ShowErrorNotification(`${GlobalViewSettings.K_TIME_OUT_MESSAGE} ${this.m_WordService.GetGuessWord()}`);
        }
        
        let statisticsWindowDelay = 1000;
        setTimeout( async () => {
            this.OpenStatisticsWindow();
        }, statisticsWindowDelay);

        GlobalEvents.Dispatch(EventTypes.CreateStatisticsFooterEvent);
    }

    private OpenStatisticsWindow()
    {
        let statisticsLinkElement = document.getElementById(GlobalViewSettings.K_STATISTICS_POPUP_ELEMENT_ID);
        if (!statisticsLinkElement)
        {
            console.error(`Cannot find statistics element with id ${statisticsLinkElement}`);
        }
        else
        {
            ($('#statisticsPopup') as any).modal({
                fadeDuration: 100
            });
        }
    }

    private OnWordGuessed()
    {
        const solvingTime = (new Date().getTime() - new Date(this.m_WordSolvingStartDate).getTime()) / 1000; // in seconds
        GlobalEvents.Dispatch(EventTypes.OnBrzalicaWordGuessed, this.m_Board.GetCurrentAttemptPosition(), solvingTime);
        
        this.m_Board.ClearBoard();
        this.ChooseNextGuessWordAndSave();
        this.m_Keyboard.ClearAllColoring();
        this.m_WordSolvingStartDate = new Date();
        this.m_GuessedWords++;
        
        const saveData = this.m_Save.GetSaveGame();
        saveData.wordSave.guesses = [];
        saveData.wordSolvingStartDate = new Date();
        this.m_Save.OverwriteCachedSave(saveData);
        this.m_Save.TriggerSave();
        
        const wordGuessedFormattedMessage = GlobalViewSettings.formatMessage(GlobalViewSettings.K_BRZALICA_WORD_GUESSED_MESSAGE, {guessed_words: this.m_GuessedWords.toString()});
        NotificationHelpers.ShowCongratsNotification(wordGuessedFormattedMessage, 2000);
    }

    //Callbacks
    protected override OnKeyPressed(key: string) {
        this.m_Board.FillNextLetter(key);
    }

    protected override OnAttemptSubmitted() {

        this.ChangeGameState(EGameState.InProgress, false);

        const attemptWord = this.m_Board.GetCurrentGuess();
        const attemptData = this.m_WordService.CheckWordAttempt(attemptWord);

        if (attemptData.guessAttemptStatus === GuessAttemptStatus.TooShort)
        {
            NotificationHelpers.ShowInfoNotification(GlobalViewSettings.K_SHORT_WORD_INFO);
            return;
        }
        
        if (attemptData.guessAttemptStatus == GuessAttemptStatus.NotInDictionary)
        {
            NotificationHelpers.ShowErrorNotification(GlobalViewSettings.K_WORD_NOT_FOUND, 3000);
            return;
        }

        this.m_Keyboard.SetEnabled(false);
        const letterStatuses = attemptData.letterStatuses;
        this.m_Board.ColorAttemptWord(letterStatuses, true).then(() => {
            this.m_Board.NextGuess();

            if (attemptData.guessAttemptStatus == GuessAttemptStatus.Correct)
            {
                setTimeout(() => {
                    this.OnWordGuessed();
                }, GlobalViewSettings.K_BOARD_CLEAR_DELAY);
            }
        });

        this.m_Keyboard.ColorKeys(letterStatuses, false).then(() => {
            this.m_Keyboard.SetEnabled(true);
        });

        let saveData = this.m_Save.GetSaveGame();
        saveData.wordSave.guesses.push(WordHelpers.SerbianWordToCharArray(attemptWord));
        saveData.currentNumberOfGuesses++;
        this.m_Save.OverwriteCachedSave(saveData);
        this.m_Save.TriggerSave(GlobalGameSettings.K_BRZALICA_SAVEGAME_KEY);
        if (attemptData.guessAttemptStatus != GuessAttemptStatus.Correct && this.m_Board.GetCurrentAttemptPosition() == GlobalGameSettings.K_PAJGLANJE_ATTEMPTS - 1)
        {
            //We used last try
            this.ChangeGameState(EGameState.Lost, false);
        }
    }

    private OnShareButtonClicked()
    {
        const brzalicaTime = this.GetBrzalicaTime();

        let stringToCopy = `${GlobalGameSettings.K_BRZALICA_GAME_NAME} #${brzalicaTime}\n`;
        stringToCopy += `https://pajglanje.com/brzalica\n\n`

        let durationMinutes = Math.floor(GlobalGameSettings.K_BRZALICA_DURATION / 60);
        let durationSeconds = GlobalGameSettings.K_BRZALICA_DURATION % 60;
        //stringToCopy += `⏰ ${durationMinutes.toLocaleString('en-us', {minimumIntegerDigits: 2, maximumFractionDigits: 0})}:${durationSeconds.toLocaleString('en-us', {minimumIntegerDigits: 2, maximumFractionDigits: 0})}\n`;
        stringToCopy += `🟩 ${this.m_GuessedWords} reči ispajglano\n`;
        stringToCopy += `🟨 ${this.m_Save.GetSaveGame().currentNumberOfGuesses} pokušaja\n`;

        CopyToClipboard(stringToCopy);
    }
}