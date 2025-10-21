import {GameBase} from "./GameBase";
import type {EGameState} from "./enums/EGameState";

export class TragalicaGame extends GameBase
{
    protected ChangeGameState(newState: EGameState, fromSave: boolean): void {
    }

    protected OnAttemptSubmitted(): void {
    }

    StartGame(): void {
    }
    
}