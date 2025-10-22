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

export class TragalicaGame extends GameBase
{
    // create save manager here
    // create statistics manager here
    protected m_Board: IBoard = new Board(GlobalGameSettings.K_TRAGALICA_WORD_LENGTH, GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS);
    protected m_MasterWordDisplay: IMasterWordDisplay = new MasterWordDisplay();
    protected m_WordService: ITragalicaWordService = new TragalicaWordService();
    protected m_DictionaryHolder: IDictionaryHolder = new FiveWordLengthDictionaryHolder();
    
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
    }

    StartGame(): void {
    }
    
}