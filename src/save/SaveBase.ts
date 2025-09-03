import { GlobalGameSettings } from "../game/GlobalGameSettings";

export abstract class SaveBase<T> {
    protected m_SaveGameVersion = 1;
    protected m_SaveGame: T;

    constructor()
    {
        this.m_SaveGame = this.GetEmptySaveGame();
    }

    public GetSaveGame(): T {
        return this.m_SaveGame;
    }

    public OverwriteCachedSave(newSaveGame: T)
    {
        this.m_SaveGame = newSaveGame;
    }

    public TriggerSave(saveKey: string)
    {
        localStorage.setItem(saveKey, JSON.stringify(this.m_SaveGame));
    }

    protected abstract GetEmptySaveGame(): T;
    public abstract Init(): void;
}