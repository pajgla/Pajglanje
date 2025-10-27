
export interface IMasterWordDisplay {
    Init(wordLength: number): void;
    SetMasterWord(word: string): void;
    GetMasterWord(): string;
}