import { GlobalViewSettings } from "../GlobalViewSettings";
import * as NotificationHelpers from "../../helpers/NotificationHelpers";
import { GlobalUserSettings } from "./GlobalUserSettings";
import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { UserManager } from "../../managers/user/UserManager";

export class UserView
{
    private m_Login_username_input : HTMLInputElement | null = null;
    private m_Login_password_input : HTMLInputElement | null = null; 
    private m_Register_username_input : HTMLInputElement | null = null;
    private m_Register_password_input : HTMLInputElement | null = null;

    public Init(): void
    {        
        const loginBtn = document.getElementById("login-btn");
        if (!loginBtn)
        {
            throw new Error("Cannot find login button!");
        }

        const registerBtn = document.getElementById("register-btn");
        if (!registerBtn)
        {
            throw new Error("Cannot find register button!");
        }

        loginBtn.addEventListener("click", () => {
            this.OnLoginButtonClicked();
        });

        registerBtn.addEventListener("click", () => {
            this.OnRegisterButtonClicked();
        });

        this.m_Login_username_input = document.getElementById(GlobalUserSettings.K_LOGIN_USERNAME_ELEMENT_ID) as HTMLInputElement;
        if (!this.m_Login_username_input)
        {
            throw new Error("Cannot find login username input!");
        }

        this.m_Login_password_input = document.getElementById(GlobalUserSettings.K_LOGIN_PASSWORD_ELEMENT_ID) as HTMLInputElement;
        if (!this.m_Login_password_input)
        {
            throw new Error("Cannot find login password input.");
        }

        this.m_Register_username_input = document.getElementById(GlobalUserSettings.K_REGISTER_USERNAME_ELEMENT_ID) as HTMLInputElement;
        if (!this.m_Register_username_input)
        {
            throw new Error(`Cannot find register username input with ID ${GlobalUserSettings.K_REGISTER_USERNAME_ELEMENT_ID}`);
        }

        this.m_Register_password_input = document.getElementById(GlobalUserSettings.K_REGISTER_PASSWORD_ELEMENT_ID) as HTMLInputElement;
        if (!this.m_Register_password_input)
            throw new Error(`Cannot find register password input with ID ${GlobalUserSettings.K_REGISTER_PASSWORD_ELEMENT_ID}`);

        this.SetupUsernameInput();
    }

    private SetupUsernameInput()
    {
        if (!this.m_Login_username_input)
        {
            throw new Error("Recieved null username input element.");
        }

        this.m_Login_username_input.setAttribute("maxLength", GlobalUserSettings.K_MAX_USERNAME_LENGTH.toString());
    }

    private async OnLoginButtonClicked()
    {
        console.log(`Logging in ...`);
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);

        let username = this.GetInput(this.m_Login_username_input);
        let password = this.GetInput(this.m_Login_password_input);

        if (username === undefined || username === null || password === undefined || password === null)
        {
            throw new Error(`Username or password is null or undefined.`);
        }

        let usernameCheckResult = this.ValidateUsername(username);
        if (!usernameCheckResult.valid)
        {
            NotificationHelpers.ShowErrorNotification(usernameCheckResult.error!, 5000);
        }

        let passwordCheckResult = this.ValidatePassword(password);
        if (!passwordCheckResult.valid)
        {
            NotificationHelpers.ShowErrorNotification(passwordCheckResult.error!, 5000);
        }

        const userManager: UserManager | null = UserManager.Get();
        if (userManager === null)
        {
            throw new Error(`UserManager is null`);
        }

        await userManager.TryLogin(username, password);

        GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
    }

    private async OnRegisterButtonClicked()
    {
        console.log(`Registering ...`);
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);

        let username = this.GetInput(this.m_Register_username_input);
        if (username === undefined || username === null)
        {
            throw new Error("Username is invalid");
        }

        let usernameCheck = this.ValidateUsername(username);
        if (!usernameCheck.valid)
        {
            NotificationHelpers.ShowErrorNotification(usernameCheck.error!, 5000);
            return;
        }

        let password = this.GetInput(this.m_Register_password_input);
        if (password === undefined || password === null)
        {
            throw new Error("Password is null or undefined");
        }

        let passwordCheck = this.ValidatePassword(password);
        if (!passwordCheck.valid)
        {
            NotificationHelpers.ShowErrorNotification(passwordCheck.error!, 5000);
            return;
        }

        const userManager: UserManager | null = UserManager.Get();
        if (userManager === null)
        {
            throw new Error(`User manager is null`);
        }

        await userManager.TryRegister(username, password);
        GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
    }

    private ValidateUsername(username: string | undefined): {valid: boolean, error?: string}
    {
        if (username === null || username === undefined)
        {
            throw new Error("Username cannot be undefined.");
        }

        if (username.length < GlobalUserSettings.K_MIN_USERNAME_LENGHT)
        {
            return {valid: false, error: GlobalViewSettings.K_SHORT_USERNAME_LENGTH_ERROR};
        }

        if (username.length > GlobalUserSettings.K_MAX_USERNAME_LENGTH)
        {
            return {valid: false, error: GlobalViewSettings.K_LONG_USERNAME_LENGHT_ERROR};
        }

        const allowedPattern = /^[A-Za-z0-9 ]*$/;
        if (!allowedPattern.test(username))
        {
            return {valid: false, error: GlobalViewSettings.K_INVALID_USERNAME_ERROR};
        }
        
        return {valid: true};
    }

    private GetInput(element: HTMLInputElement | null)
    {
        return element?.value.trim();
    }

    private ValidatePassword(password: string | undefined): {valid: boolean, error?: string} {
        if (!password)
        {
            throw new Error("Password cannot be undefined!");
        }

        if (password.length < GlobalUserSettings.K_MIN_PASSWORD_LENGTH)
        {
            return {valid: false, error: GlobalViewSettings.K_SHORT_PASSWORD_ERROR};
        }

        return {valid: true};
    }
}