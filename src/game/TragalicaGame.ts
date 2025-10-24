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
import {TragalicaSave} from "../save/TragalicaSave";
import * as WordHelpers from '../helpers/WordHelpers';
import type {TragalicaSaveStorage} from "../save/save_storage/TragalicaSaveStorage";

export class TragalicaGame extends GameBase
{
    // create save manager here
    // create statistics manager here
    protected m_Board: IBoard = new Board(GlobalGameSettings.K_TRAGALICA_WORD_LENGTH, GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS);
    protected m_MasterWordDisplay: IMasterWordDisplay = new MasterWordDisplay();
    protected m_WordService: ITragalicaWordService = new TragalicaWordService();
    protected m_DictionaryHolder: IDictionaryHolder = new FiveWordLengthDictionaryHolder();
    protected m_SaveGame: TragalicaSave = new TragalicaSave();
    
    protected m_Score: number = 0;
    
    public override Init(): void {
        super.Init();

        this.m_WordService.Init(this.m_DictionaryHolder, this.GetTragalicaTime(), GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS);
        this.m_MasterWordDisplay.Init(GlobalGameSettings.K_TRAGALICA_WORD_LENGTH);
        this.m_MasterWordDisplay.SetMasterWord(this.m_WordService.GetMasterWord());
        this.m_Board.CreateBoardElement();
        this.m_SaveGame.Init();
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
    
    protected override ChangeGameState(newState: EGameState, fromSave: boolean = false): void {
        if (newState === this.m_CurrentGameState)
            return;

        this.m_CurrentGameState = newState;

        switch (newState)
        {
            case EGameState.Won: {
                //Handle win state
                this.ChangeSaveGameState(EGameState.Won);
                this.m_Keyboard.SetEnabled(false);
                this.m_Keyboard.ChangeLockState(true);
                break;
            }
            case EGameState.Lost: {
                // Handle lose state
                this.ChangeSaveGameState(EGameState.Lost);
                this.m_Keyboard.SetEnabled(false);
                this.m_Keyboard.ChangeLockState(true);
                break;
            }

            default: {
                throw new Error(`Unhandled game state type`);
            }
        }
    }

    private ChangeSaveGameState(newState: EGameState): void {
        let saveData = this.m_SaveGame.GetSaveGame();
        saveData.gameState = newState;
        this.m_SaveGame.OverwriteCachedSave(saveData);
        this.m_SaveGame.TriggerSave(GlobalGameSettings.K_TRAGALICA_SAVEGAME_KEY);
    }

    private CalculateAndApplyScore(attemptIndex: number, attemptData: GuessAttemptData, shouldAnimate: boolean): number {
        const hiddenWordAttemptData = this.m_WordService.CheckWordAttempt(
            this.m_WordService.GetHiddenWord(attemptIndex), 
            attemptIndex
        );
        let scores: number[] = [];
        let totalScore = 0;

        const correctScore = GlobalGameSettings.K_TRAGALICA_CORRECT_LETTER_SCORE;
        const incorrectScore = GlobalGameSettings.K_TRAGALICA_INCORRECT_LETTER_SCORE;

        for (let i = 0; i < GlobalGameSettings.K_TRAGALICA_WORD_LENGTH; ++i)
        {
            const hiddenAttempt = hiddenWordAttemptData.letterStatuses[i]!.status;
            const userAttempt = attemptData.letterStatuses[i]!.status;
            const score = hiddenAttempt == userAttempt ? correctScore : incorrectScore;
            scores.push(score);
            totalScore += score;
        }

        this.m_Board.SetLetterScores(scores, shouldAnimate);
        return totalScore;
    }

    protected override OnAttemptSubmitted(): void {
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

        // Calculate and apply score
        const attemptScore = this.CalculateAndApplyScore(attemptIndex, attemptData, true);
        this.m_Score += attemptScore;

        // Save attempt word and score
        let saveData = this.m_SaveGame.GetSaveGame();
        saveData.wordSave.guesses.push(WordHelpers.SerbianWordToCharArray(attemptWord));
        saveData.wordSave.score = this.m_Score;
        this.m_SaveGame.OverwriteCachedSave(saveData);
        this.m_SaveGame.TriggerSave(GlobalGameSettings.K_TRAGALICA_SAVEGAME_KEY);

        console.log(`Score: ${this.m_Score}`);

        // Check if game is over
        if (this.m_Board.GetCurrentAttemptPosition() == GlobalGameSettings.K_TRAGALICA_HIDDEN_WORDS - 1)
        {
            //We used last try
            this.ChangeGameState(EGameState.Lost, false);
        }
    }

    public StartGame(): void {
        const tragalicaTime = this.GetTragalicaTime();
        this.ChangePageTitle(GlobalGameSettings.K_TRAGALICA_GAME_NAME, tragalicaTime);

        let saveData: TragalicaSaveStorage = this.m_SaveGame.GetSaveGame();
        if (saveData.lastTragalicaTime !== tragalicaTime)
        {
            // New game - reset save data
            saveData.wordSave.guesses = [] as string[][];
            saveData.wordSave.score = 0;
            saveData.lastTragalicaTime = tragalicaTime;
            saveData.gameState = EGameState.InProgress;
            this.m_SaveGame.OverwriteCachedSave(saveData);
            this.m_SaveGame.TriggerSave(GlobalGameSettings.K_TRAGALICA_SAVEGAME_KEY);
            this.m_Score = 0;
        }
        else
        {
            // Load existing game
            let guesses = saveData.wordSave.guesses;
            this.m_Score = saveData.wordSave.score || 0;

            for (let guessIndex = 0; guessIndex < guesses.length; guessIndex++)
            {
                const guess = guesses[guessIndex]!;
                const attemptedWord: string = guess.join('');
                let attemptData: GuessAttemptData = this.m_WordService.CheckWordAttempt(attemptedWord, guessIndex);

                // Fill the board with saved letters
                for (let char of guess)
                {
                    this.m_Board.FillNextLetter(char);
                }

                // Color the attempt without animation
                this.m_Board.ColorAttemptWord(attemptData.letterStatuses, false);

                // Calculate and display scores without animation
                this.CalculateAndApplyScore(guessIndex, attemptData, false);

                this.m_Board.NextGuess();
            }

            // Restore game state
            this.ChangeGameState(saveData.gameState, true);
        }

        this.PaintBoardIndicators();

        GlobalEvents.Dispatch(EventTypes.NewTragalicaGameStartedEvent, tragalicaTime);
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