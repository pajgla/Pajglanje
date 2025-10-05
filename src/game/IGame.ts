export interface IGame {
    Init(): Promise<void>;
    StartGame(): void;
}