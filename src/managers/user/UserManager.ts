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

    public async TryAutoLogin()
    {
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);

        let savedUserDataJSON = localStorage.getItem(GlobalGameSettings.K_USER_SAVE_KEY);
        if (savedUserDataJSON === null || savedUserDataJSON === undefined)
        {
            //No save file found
            GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
            return;
        }

        this.m_UserSaveData = JSON.parse(savedUserDataJSON) as UserSaveData;
        if (this.m_UserSaveData === null || this.m_UserSaveData === undefined)
        {
            GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
            throw new Error(`An error occured while trying to parse User Save Data`);
        }

        const token = this.m_UserSaveData.token;
        const result = await ServerCalls.CheckToken(this.m_UserSaveData.userID, token, 32);
        console.log(`Autologin: ${result.success}`);

        GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);

        if (result.success)
        {
            NotificationHelpers.ShowCongratsNotification(GlobalViewSettings.formatMessage(GlobalViewSettings.K_AUTOLOGIN_SUCCESSFUL_MESSAGE, {username: this.m_UserSaveData.username}));
            this.m_IsUserLoggedIn = true;
        }
    }

    public GetIsUserLoggedIn(): boolean
    {
        return this.m_IsUserLoggedIn;
    }

    public GetUserID(): number | null
    {
        if (!this.GetIsUserLoggedIn())
        {
            return null;
        }

        return this.m_UserSaveData?.userID ?? null;
    }

    public GetLoginToken(): string | null
    {
        if (!this.GetIsUserLoggedIn())
        {
            return null;
        }

        return this.m_UserSaveData?.token ?? null;
    }
}