import { GlobalEvents } from '../core/EventBus';
import { EventTypes } from '../Events/EventTypes';
import { GlobalGameSettings } from './GlobalGameSettings';
import * as WordHelpers from '../helpers/WordHelpers'
import * as NotificationHelpers from '../helpers/NotificationHelpers';
import { ELetterStatus, GuessAttemptData, GuessAttemptStatus } from './services/word_services/AttemptStatuses';
import { GlobalViewSettings } from '../siteView/GlobalViewSettings';
import { PajglanjeSave } from '../save/PajglanjeSave';
import { GameTimeHelpers } from '../helpers/GameTimeHelpers';
import type { PajglaSaveStorage } from '../save/save_storage/PajglaSaveStorage';
import { PajglanjeStatisticsManager } from '../statistics/pajglanje/PajglanjeStatisticsManager';
import { EGameState } from './enums/EGameState';
import { CopyToClipboard, LetterStateToShareSymbol } from '../helpers/ShareHelpers';
import { GameBase } from './GameBase';
import $ from 'jquery'
import 'jquery-modal'
import type {IBoard} from "./services/board/IBoard";
import {Board} from "./services/board/Board";
import type {IDictionaryHolder} from "./services/dictionaries/IDictionary";
import {FiveWordLengthDictionaryHolder} from "./services/dictionaries/DictionaryHolder";
import type {IGameWordService} from "./services/word_services/IGameWordService";
import {PajglanjeWordService} from "./services/word_services/PajglanjeWordService";

export class PajglanjeGame extends GameBase {
    protected m_Board: IBoard = new Board(GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH, GlobalGameSettings.K_PAJGLANJE_ATTEMPTS);
    private m_Save: PajglanjeSave = new PajglanjeSave();
    private m_StatisticsManager: PajglanjeStatisticsManager = new PajglanjeStatisticsManager();
    protected m_DictionaryHolder: IDictionaryHolder = new FiveWordLengthDictionaryHolder();
    protected m_WordService :IGameWordService = new PajglanjeWordService();

    public override Init(): void {
        super.Init();

        this.m_Board.CreateBoardElement();
        this.m_Save.Init();
        this.m_WordService.Init(this.m_DictionaryHolder);
    }

    protected override InitCallbacks(): void {
        super.InitCallbacks();

        GlobalEvents.AddListener(EventTypes.OnShareButtonClickedEvent, this.OnShareButtonClicked.bind(this));

        GlobalEvents.AddListener(EventTypes.DeleteKeyPressedEvent, () => {
            this.m_Board.RetractLetter();
        });
    }

    protected OnKeyPressed(key: string) {
        this.m_Board.FillNextLetter(key);
    }

    protected override ChangeGameState(newState: EGameState, fromSave: boolean = false)
    {
        if (newState === this.m_CurrentGameState)
            return;

        this.m_CurrentGameState = newState;

        //#TODO: Remove boilerplate
        switch (newState)
        {
            case EGameState.Won : {
                this.HandleStateChange(EGameState.Won, !fromSave);

                if (!fromSave)
                    this.m_StatisticsManager.OnGameWon(this.m_Board.GetCurrentAttemptPosition());

                this.ChangeSaveGameState(EGameState.Won);

                break;
            }
            case EGameState.Lost : {
                this.HandleStateChange(EGameState.Lost, !fromSave);

                if (!fromSave)
                    this.m_StatisticsManager.OnGameLost();

                this.ChangeSaveGameState(EGameState.Lost);

                break;
            }
            case EGameState.InProgress : {
                //Add if needed
                break;
            }

            default: {
                throw new Error(`Unhandled game state type`);
            }
        }
    }

    private ChangeSaveGameState(newState: EGameState)
    {
        let saveData = this.m_Save.GetSaveGame();
        saveData.gameState = newState;
        this.m_Save.OverwriteCachedSave(saveData);
        this.m_Save.TriggerSave(GlobalGameSettings.K_PAJGLA_SAVEGAME_KEY);
    }

    protected override OnAttemptSubmitted()
    {
        const attemptWord = this.m_Board.GetCurrentGuess();
        const attemptData: GuessAttemptData = this.m_WordService.CheckWordAttempt(attemptWord);
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
        });

        this.m_Keyboard.ColorKeys(letterStatuses, false).then(() => {
            this.m_Keyboard.SetEnabled(true);
        });

        //Save attempt word
        let saveData = this.m_Save.GetSaveGame();
        saveData.wordSave.guesses.push(WordHelpers.SerbianWordToCharArray(attemptWord));
        this.m_Save.OverwriteCachedSave(saveData);
        this.m_Save.TriggerSave(GlobalGameSettings.K_PAJGLA_SAVEGAME_KEY);

        if (attemptData.guessAttemptStatus == GuessAttemptStatus.Correct)
        {
            this.ChangeGameState(EGameState.Won, false);
        }
        else if (this.m_Board.GetCurrentAttemptPosition() == GlobalGameSettings.K_PAJGLANJE_ATTEMPTS - 1)
        {
            //We used last try
            this.ChangeGameState(EGameState.Lost, false);
        }
    }

    private GetPajglaTime(): number
    {
        let pajglaStartTime = GlobalGameSettings.K_PAJGLANJE_START_TIME;
        return GameTimeHelpers.GetGameTime(pajglaStartTime, GlobalGameSettings.K_NEXT_PAJGLA_IN_HOURS);
    }

    public StartGame(): void {

        const pajglaTime = this.GetPajglaTime();
        this.ChangePageTitle(GlobalGameSettings.K_PAJGLANJE_GAME_NAME, pajglaTime);

        this.m_WordService.ChooseGuessWord(pajglaTime);

        let saveData: PajglaSaveStorage = this.m_Save.GetSaveGame();
        if (saveData.lastPajglaTime !== pajglaTime)
        {
            //Remove guesses
            saveData.wordSave.guesses = [] as string[][];
            saveData.lastPajglaTime = pajglaTime;
            saveData.gameState = EGameState.InProgress;
            this.m_Save.OverwriteCachedSave(saveData);
            this.m_Save.TriggerSave(GlobalGameSettings.K_PAJGLA_SAVEGAME_KEY);
        }
        else
        {
            let guesses = saveData.wordSave.guesses;
            for (let guess of guesses)
            {
                const attemtedWord: string = guess.join('');
                let attemptData: GuessAttemptData = this.m_WordService.CheckWordAttempt(attemtedWord);
                for (let char of guess)
                {
                    this.m_Board.FillNextLetter(char);
                }

                this.m_Board.ColorAttemptWord(attemptData.letterStatuses, false);
                this.m_Keyboard.ColorKeys(attemptData.letterStatuses, true);
                this.m_Board.NextGuess();
            }

            this.ChangeGameState(saveData.gameState, true);
        }

        this.m_StatisticsManager.LoadDataFromSave(this.m_Save.GetSaveGame());
        this.m_StatisticsManager.PaintHistogram();

        GlobalEvents.Dispatch(EventTypes.NewPajglaGameStartedEvent, pajglaTime);
    }

    private HandleStateChange(newState: EGameState, shouldDelay: boolean = true): void {
        let delay = shouldDelay ? GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH * GlobalViewSettings.K_LETTER_FLIP_DELAY : 0;
        setTimeout(async ()  => {
            if (newState === EGameState.Won)
            {
                if (this.GetPajglaTime() === 100)
                {
                    NotificationHelpers.ShowCongratsNotification(GlobalViewSettings.K_SPECIAL_WORD_GUESSED_MESSAGE, 4000);
                }
                else
                {
                    NotificationHelpers.ShowCongratsNotification(GlobalViewSettings.K_WORD_GUESSED_MESSAGE, 3000);
                }
            }
            else if (newState === EGameState.Lost)
                NotificationHelpers.ShowErrorNotification(GlobalViewSettings.K_GAME_LOST + this.m_WordService.GetGuessWord(), 3000);
        }, delay);

        //If we didn't call delay means we opened the page with a guessed word, but we still want a small delay
        let statisticsWindowDelay = shouldDelay ? delay : 500;
        setTimeout(async () => {
            this.OpenStatisticsWindow();
        }, statisticsWindowDelay);

        //Lock the keyboard
        this.m_Keyboard.SetEnabled(false);
        this.m_Keyboard.ChangeLockState(true);

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

    private OnShareButtonClicked()
    {
        const pajglaStartTime = GlobalGameSettings.K_PAJGLANJE_START_TIME;
        const pajglaTime = GameTimeHelpers.GetGameTime(pajglaStartTime, GlobalGameSettings.K_NEXT_PAJGLA_IN_HOURS);

        let attemptPosition = this.m_CurrentGameState === EGameState.Lost ? 'x' : this.m_Board.GetCurrentAttemptPosition();
        let stringToCopy = `${GlobalViewSettings.K_PAJGLA_TITLE} #${pajglaTime} - ${attemptPosition}/${GlobalGameSettings.K_PAJGLANJE_ATTEMPTS}\nhttps://pajglanje.com\n\n`;
        for (let i = 0; i < this.m_Board.GetCurrentAttemptPosition(); ++i)
        {
            let row = [];

            for (let j = 0; j < GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH; ++j)
            {
                let id = this.m_Board.GetIDForField(i, j);
                let squareElement = document.getElementById(id);
                if (!squareElement)
                {
                    throw new Error(`Board square element not found with ID ${id}`);
                }

                let value = squareElement.getAttribute('data-value');
                if (value === null)
                {
                    throw new Error("Board square element has invalid data-value attribute");
                }

                row.push(LetterStateToShareSymbol(parseInt(value) as ELetterStatus));
            }
            stringToCopy += row.join('') + "\n";
        }

        CopyToClipboard(stringToCopy);
    }
}