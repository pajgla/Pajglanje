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
    protected m_Board: IBoard = new Board(GlobalGameSettings.K_PAJGLANJE_WORD_LENGTH, GlobalGameSettings.K_PAJGLANJE_ATTEMPTS);
    protected m_Keyboard: IKeyboard = new Keyboard();
    protected m_DictionaryHolder: IDictionaryHolder = new FiveWordLengthDictionaryHolder();
    protected m_WordService :IGameWordService = new PajglanjeWordService();
    protected m_CurrentGameState: EGameState = EGameState.InProgress;

    public Init(): Promise<void> {
        this.m_Board.CreateBoardElement();
        this.m_Keyboard.Init();
        this.m_WordService.Init(this.m_DictionaryHolder);

        this.InitCallbacks();
        return Promise.resolve();
    }

    protected InitCallbacks()
    {
        GlobalEvents.AddListener(EventTypes.LetterKeyPressedEvent, (key: string) => {
            this.OnKeyPressed(key);
        });

        GlobalEvents.AddListener(EventTypes.ConfirmKeyPressedEvent, () => {
            this.OnAttemptSubmitted();
        });

        GlobalEvents.AddListener(EventTypes.DeleteKeyPressedEvent, () => {
            this.m_Board.RetractLetter();
        });
    }

    protected OnKeyPressed(key: string) {
        this.m_Board.FillNextLetter(key);
    }

    protected ChangePageTitle(gameName: string, gameTime: number)
    {
        const newTitle = `${gameName} #${gameTime}`;
        document.title = newTitle;
    }

    protected abstract ChangeGameState(newState: EGameState, fromSave: boolean): void;
    protected abstract OnAttemptSubmitted(): void;
    

    public abstract StartGame(): void;
}