import {GameBase} from "./GameBase";
import {EGameState} from "./enums/EGameState";
import type {IBoard} from "./services/board/IBoard";
import {Board} from "./services/board/Board";
import {GlobalGameSettings} from "./GlobalGameSettings";
import {GlobalEvents} from "../core/EventBus";
import {EventTypes} from "../Events/EventTypes";
import type {IMasterWordDisplay} from "./services/master word display/IMasterWordDisplay";
import {MasterWordDisplay} from "./services/master word display/MasterWordDisplay";

export class TragalicaGame extends GameBase
{
    // create save manager here
    // create statistics manager here
    protected m_Board: IBoard = new Board(GlobalGameSettings.K_TRAGALICA_WORD_LENGTH, GlobalGameSettings.K_TRAGALICA_ATTEMPTS);
    protected m_MasterWordDisplay: IMasterWordDisplay = new MasterWordDisplay();
    
    public override Init(): void {
        super.Init();
        
        this.m_MasterWordDisplay.Init(GlobalGameSettings.K_TRAGALICA_WORD_LENGTH);
        this.m_Board.CreateBoardElement();
    }

    protected override InitCallbacks(): void {
        super.InitCallbacks();

        GlobalEvents.AddListener(EventTypes.DeleteKeyPressedEvent, () => {
            this.m_Board.RetractLetter();
        });
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