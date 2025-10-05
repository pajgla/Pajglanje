import { GlobalGameSettings } from "../game/GlobalGameSettings";
import {UserManager} from "../managers/user/UserManager";

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
        
        const userManager = UserManager.Get();
        if (userManager === null)
        {
            console.error("User manager is null");
            return;
        }
        
        //#TODO save to server
    }

    protected abstract GetEmptySaveGame(): T;
    public abstract Init(): Promise<void>;
}