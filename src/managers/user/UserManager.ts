import { GlobalGameSettings } from "../../game/GlobalGameSettings";
import { GetDefaultUserSaveData, type UserSaveData } from "./UserSaveData";
import * as HashHelpers from "../../helpers/HashHelpers";
import * as ServerCalls from "../../calls/ServerCalls";
import * as NotificationHelpers from "../../helpers/NotificationHelpers";
import * as AuthenticationHelpers from "./AuthenticationHelpers";
import { GlobalViewSettings } from "../../siteView/GlobalViewSettings";
import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";

export class UserManager
{
    private static sm_Instance: UserManager | null = null;

    private m_UserSaveData: UserSaveData | null = null;
    private m_IsUserLoggedIn: boolean = false;

    constructor()
    {
        if (UserManager.sm_Instance === null)
        {
            UserManager.sm_Instance = this;
        }
        else
        {
            throw new Error(`More than one instance of UserManager is created`);
        }
    }

    public static Get(): UserManager | null
    {
        return this.sm_Instance;
    }
    
    public async TryLogin(username: string, password: string): Promise<boolean>
    {
        let isLoggedIn: boolean = false;

        try
        {
            const hashedPassword = await HashHelpers.sha512(password);
            const result = await ServerCalls.LoginUser(username, hashedPassword);
            if (result.success)
            {
                NotificationHelpers.ShowCongratsNotification(GlobalViewSettings.formatMessage(GlobalViewSettings.K_LOGIN_SUCCESSFUL_MESSAGE, {username: username}));

                this.SaveUserLoginData(username, result.user_id, result.token);
                this.m_IsUserLoggedIn = true;
                
                window.location.reload();
            }
            else
            {
                NotificationHelpers.ShowErrorNotification(GlobalViewSettings.K_LOGIN_INFO_WRONG_MESSAGE, 5000);
            }

            isLoggedIn = result.success;
        }
        catch (error)
        {
            console.log(`Login failed: ${error}`)
            NotificationHelpers.ShowErrorNotification(GlobalViewSettings.K_LOGIN_FAILED_MESSAGE, 5000);
            isLoggedIn = false;
        }

        return isLoggedIn;
    }

    public async TryRegister(username: string, password: string): Promise<boolean>
    {
        let isRegistred: boolean = false;

        try
        {
            const hashedPassword = await HashHelpers.sha512(password);
            const result = await ServerCalls.RegisterUser(username, hashedPassword);
            isRegistred = result.success;
            if (result.success)
            {
                NotificationHelpers.ShowCongratsNotification(GlobalViewSettings.K_REGISTRATION_SUCCESSFUL_MESSAGE, 4000);
            }
            else
            {
                console.log(`Server error: ${result.reason}`);
                const uiErrorMessage = AuthenticationHelpers.GetUIMessageForRegistrationErrorMessage(result.reason);
                NotificationHelpers.ShowErrorNotification(uiErrorMessage, 4000);
            }
        }
        catch (error)
        {
            console.log(`Register failed with error: ${error}`);
            NotificationHelpers.ShowErrorNotification(GlobalViewSettings.K_REGISTRATION_FAILED_MESSAGE, 5000);
            isRegistred = false;
        }

        return isRegistred;
    }

    private SaveUserLoginData(username: string, userID: number, token: string)
    {
        console.log(`Saving user login data ...`);

        let userSaveData: UserSaveData = GetDefaultUserSaveData();
        userSaveData.username = username;
        userSaveData.userID = userID;
        userSaveData.token = token;

        this.m_UserSaveData = userSaveData;

        localStorage.setItem(GlobalGameSettings.K_USER_SAVE_KEY, JSON.stringify(userSaveData));
    }
    
    private SaveUserCheckString(checkString: string)
    {
        if (this.m_UserSaveData === null)
        {
            throw new Error(`User save data is null`);
        }
        
        const savedString = localStorage.getItem(GlobalGameSettings.K_USER_SAVE_KEY);
        if (savedString === null)
        {
            throw new Error(`User save data is null`);
        }
        
        let savedData = JSON.parse(savedString) as UserSaveData;
        savedData.checkString = checkString;
        
        localStorage.setItem(GlobalGameSettings.K_USER_SAVE_KEY, JSON.stringify(savedData));
    }

    public async TryAutoLogin()
    {
        let savedUserDataJSON = localStorage.getItem(GlobalGameSettings.K_USER_SAVE_KEY);
        if (savedUserDataJSON === null || savedUserDataJSON === undefined)
        {
            //No save file found
            GlobalEvents.Dispatch(EventTypes.OnAutologinFinished, false);
            return;
        }

        this.m_UserSaveData = JSON.parse(savedUserDataJSON) as UserSaveData;
        if (this.m_UserSaveData === null || this.m_UserSaveData === undefined)
        {
            throw new Error(`An error occured while trying to parse User Save Data`);
        }

        const token = this.m_UserSaveData.token;
        const result = await ServerCalls.CheckToken(this.m_UserSaveData.userID, token, 32);

        if (result.success)
        {
            NotificationHelpers.ShowInfoNotification(GlobalViewSettings.formatMessage(GlobalViewSettings.K_AUTOLOGIN_SUCCESSFUL_MESSAGE, {username: this.m_UserSaveData.username}), 4000);
            this.m_IsUserLoggedIn = true;
        }

        GlobalEvents.Dispatch(EventTypes.OnAutologinFinished, result.success);
    }
    
    public async StartGame(gameTime: number)
    {
        if (!this.GetIsUserLoggedIn())
        {
            console.error("User is not logged in but we tried starting a game");
            return;
        }

        console.log("OK logged in")
        
        const userID = this.GetUserID();
        if (userID === null)
        {
            console.error("User ID is null");
            return;
        }

        console.log("OK userid")
        
        const loginToken = this.GetLoginToken();
        if (loginToken === null)
        {
            console.error("Login token is null");
            return;
        }
        
        console.log("OK")
        
        const response = await ServerCalls.StartGame(userID!, new Date().getTime(), loginToken!, gameTime);
        if (!response.success)
        {
            GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);
            NotificationHelpers.ShowErrorNotification("Došlo je do greške sa serverom. Bićeš izlogovan kroz par sekundi. ", 5000);
            //Reload the page and log the user out
            
            setTimeout(() => {
                //this.Logout();
            }, 5000);
        }
        
        console.log("Server - game started");
        
        this.SaveUserCheckString(response.check);
        
        return response.success;
    }
    
    public async SaveGuess(guesses: string, gameTime: number)
    {
        if (!this.GetIsUserLoggedIn())
        {
            console.error("User is not logged in but we tried saving guesses to server");
            return;
        }
        
        const userID = this.GetUserID();
        if (userID === null)
        {
            console.error("User ID is null");
            return;
        }
        
        const token = this.GetLoginToken();
        if (token === null)
        {
            console.error("Login token is null");
            return;
        }
        
        const userCheckString = this.m_UserSaveData!.checkString;
        const timeStamp = new Date().getTime();
        const checkString = userCheckString + guesses + timeStamp;
        const hashedCheck = await HashHelpers.sha256(checkString);
        if (hashedCheck === userCheckString)
        {
            console.error("Invalid check string");
            return;
        }
        
        const response = await ServerCalls.SaveGame(userID, timeStamp, token, gameTime, guesses, hashedCheck);
        if (!response.success)
        {
            this.LogoutWithFatalErrorAndTimeout("Došlo je do greške sa serverom prilikom čuvanja podataka");
        }
        
        return response.success;
    }
    
    public async LoadData(key: string): Promise<string>
    {
        if (!this.GetIsUserLoggedIn())
        {
            console.error("Tried to load data but the user is not logged in");
            return "";
        }
        
        const response = await ServerCalls.LoadGame(key);
        if (!response.success)
        {
            console.error("Failed to load data");
            return "";
        }
        
        return response.value;
    }
    
    private LogoutWithFatalErrorAndTimeout(message: string)
    {
        
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);
        NotificationHelpers.ShowErrorNotification(message, 5000);
        setTimeout(() => {
            this.Logout();
        }, 5000);
    }
    
    public async SaveData(key: string, value: string)
    {}

    public GetIsUserLoggedIn(): boolean
    {
        console.log(`Is user logged in: ${this.m_IsUserLoggedIn}, user data: ${this.m_UserSaveData}`);
        return this.m_IsUserLoggedIn && this.m_UserSaveData != null;
    }

    public GetUserID(): number | null
    {
        if (!this.GetIsUserLoggedIn())
        {
            return null;
        }

        return this.m_UserSaveData?.userID ?? null;
    }

    public GetUsername(): string | null
    {
        if (!this.GetIsUserLoggedIn())
        {
            return null;
        }

        return this.m_UserSaveData?.username ?? null;
    }

    public GetLoginToken(): string | null
    {
        if (!this.GetIsUserLoggedIn())
        {
            return null;
        }

        return this.m_UserSaveData?.token ?? null;
    }

    public Logout()
    {
        window.localStorage.removeItem(GlobalGameSettings.K_USER_SAVE_KEY);
        window.location.reload();
    }
}