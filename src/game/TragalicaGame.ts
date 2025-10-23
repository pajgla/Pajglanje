import {GameBase} from "./GameBase";
import {EGameState} from "./enums/EGameState";
import type {IBoard} from "./services/board/IBoard";
import {Board} from "./services/board/Board";
import {GlobalGameSettings} from "./GlobalGameSettings";
import {GlobalEvents} from "../core/EventBus";
import {EventTypes} from "../Events/EventTypes";
import type {IMasterWordDisplay} from "./services/master word display/IMasterWordDisplay";
import {MasterWordDisplay} from "./services/master word display/MasterWordDisplay";
import type {ITragalicaWordService} from "./services/word_services/ITragalicaWordService";
import {TragalicaWordService} from "./services/word_services/TragalicaWordService";
import {GameTimeHelpers} from "../helpers/GameTimeHelpers";
import type {IDictionaryHolder} from "./services/dictionaries/IDictionary";
import {FiveWordLengthDictionaryHolder} from "./services/dictionaries/DictionaryHolder";
import {ConvertLetterStatusToColor} from "../helpers/ColorFunctions";
import {GuessAttemptData, GuessAttemptStatus} from "./services/word_services/AttemptStatuses";
import * as NotificationHelpers from "../helpers/NotificationHelpers";
import {GlobalViewSettings} from "../siteView/GlobalViewSettings";

export class TragalicaGame extends GameBase
{
    // create save manager here
    // create statistics manager here
    protected m_Board: IBoard = new Board(GlobalGameSettings.K_TRAGALICA_WORD_LENGTH, GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS);
    protected m_MasterWordDisplay: IMasterWordDisplay = new MasterWordDisplay();
    protected m_WordService: ITragalicaWordService = new TragalicaWordService();
    protected m_DictionaryHolder: IDictionaryHolder = new FiveWordLengthDictionaryHolder();
    protected m_Score: number = 0;
    
    public override Init(): void {
        super.Init();

        this.m_WordService.Init(this.m_DictionaryHolder, this.GetTragalicaTime(), GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS);
        this.m_MasterWordDisplay.Init(GlobalGameSettings.K_TRAGALICA_WORD_LENGTH);
        this.m_MasterWordDisplay.SetMasterWord(this.m_WordService.GetMasterWord());
        this.m_Board.CreateBoardElement();
    }
    

    protected override InitCallbacks(): void {
        super.InitCallbacks();

        GlobalEvents.AddListener(EventTypes.DeleteKeyPressedEvent, () => {
            this.m_Board.RetractLetter();
        });
    }

    private GetTragalicaTime(): number
    {
        let tragalicaStartDate = GlobalGameSettings.K_TRAGALICA_START_TIME;
        return GameTimeHelpers.GetGameTime(tragalicaStartDate, GlobalGameSettings.K_NEXT_TRAGALICA_IN_HOURS);
    }

    protected OnKeyPressed(key: string) {
        this.m_Board.FillNextLetter(key);
    }
    
    protected ChangeGameState(newState: EGameState, fromSave: boolean): void {
        if (newState === this.m_CurrentGameState)
            return;
        
        this.m_CurrentGameState = newState;
        
        switch (newState)
        {
            case EGameState.Won: {
                //Handle win state
                break;
            }
            case EGameState.Lost: {
                // Handle lose state
                break;
            }

            default: {
                throw new Error(`Unhandled game state type`);
            }
        }
    }

    protected OnAttemptSubmitted(): void {
        const attemptWord = this.m_Board.GetCurrentGuess();
        const attemptIndex = this.m_Board.GetCurrentAttemptPosition();
        const attemptData: GuessAttemptData = this.m_WordService.CheckWordAttempt(attemptWord, attemptIndex);

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
            this.m_Keyboard.SetEnabled(true);
        });
        
        //#TODO Save to savegame
        if (this.m_Board.GetCurrentAttemptPosition() == GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS - 1)
        {
            //We used last try
            this.ChangeGameState(EGameState.Lost, false);
            this.m_Keyboard.SetEnabled(false);
            this.m_Keyboard.ChangeLockState(true);
        }
        
        //Calculate score
        let score = 0;
        const hiddenWordAttemptData = this.m_WordService.CheckWordAttempt(this.m_WordService.GetHiddenWord(attemptIndex), attemptIndex);
        for (let i = 0; i < GlobalGameSettings.K_TRAGALICA_WORD_LENGTH; ++i)
        {
            const hiddenAttempt = hiddenWordAttemptData.letterStatuses[i]!.status;
            const userAttempt = attemptData.letterStatuses[i]!.status;
            if (hiddenAttempt === userAttempt)
            {
                this.m_Score += 10;
            }
        }
        
        console.log(`Score: ${this.m_Score}`);
    }

    StartGame(): void {
        this.PaintBoardIndicators();
    }
    
    private PaintBoardIndicators()
    {
        for (let i = 0; i < GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS; ++i)
        {
            let word = this.m_WordService.GetHiddenWord(i);
            let guessData = this.m_WordService.CheckWordAttempt(word, i);
            for (let letterIndex = 0; letterIndex < GlobalGameSettings.K_TRAGALICA_WORD_LENGTH; ++letterIndex)
            {
                
                this.m_Board.PaintLetterColorIndicator(i, letterIndex, ConvertLetterStatusToColor(guessData.letterStatuses[letterIndex]!.status));
            }
        }
    }
}