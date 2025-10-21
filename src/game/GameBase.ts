import { Board } from "./services/board/Board";
import type { IBoard } from "./services/board/IBoard";
import { GlobalEvents } from "../core/EventBus";
import { FiveWordLengthDictionaryHolder } from "./services/dictionaries/DictionaryHolder";
import type { IDictionaryHolder } from "./services/dictionaries/IDictionary";
import { EventTypes } from "../Events/EventTypes";
import type { IKeyboard } from "./services/keyboard/IKeyboard";
import { Keyboard } from "./services/keyboard/Keyboard";
import { EGameState } from "./enums/EGameState";
import { GlobalGameSettings } from "./GlobalGameSettings";
import type { IGame } from "./IGame";
import type { IGameWordService } from "./services/word_services/IGameWordService";
import { PajglanjeWordService } from "./services/word_services/PajglanjeWordService";

export abstract class GameBase implements IGame {
    protected m_Keyboard: IKeyboard = new Keyboard();
    
    protected m_CurrentGameState: EGameState = EGameState.InProgress;

    public Init(): void {
        this.m_Keyboard.Init();

        this.InitCallbacks();
    }

    protected InitCallbacks()
    {
        GlobalEvents.AddListener(EventTypes.LetterKeyPressedEvent, (key: string) => {
            this.OnKeyPressed(key);
        });

        GlobalEvents.AddListener(EventTypes.ConfirmKeyPressedEvent, () => {
            this.OnAttemptSubmitted();
        });
    }

    protected ChangePageTitle(gameName: string, gameTime: number)
    {
        const newTitle = `${gameName} #${gameTime}`;
        document.title = newTitle;
    }

    protected abstract ChangeGameState(newState: EGameState, fromSave: boolean): void;
    protected abstract OnKeyPressed(key: string): void;
    protected abstract OnAttemptSubmitted(): void;
    

    public abstract StartGame(): void;
}