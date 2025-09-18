import { GlobalEvents } from '../../core/EventBus';
import { EventTypes } from '../../Events/EventTypes';
import * as HTMLHelpers from '../../helpers/HTMLHelpers'
import { UserManager } from '../../managers/user/UserManager';
import { GlobalViewSettings } from '../GlobalViewSettings';
import { GlobalUserSettings } from './GlobalUserSettings';
import * as NotificationHelpers from '../../helpers/NotificationHelpers';
import { authenticationOverlayHTMLData } from './AuthenticationOverlayHTMLData';

export class AuthenticationView
{
    private m_LoginUsernameInput : HTMLInputElement | null = null;
    private m_LoginPasswordInput : HTMLInputElement | null = null; 
    private m_RegistrationUsernameInput : HTMLInputElement | null = null;
    private m_RegistrationPasswordInput : HTMLInputElement | null = null;
    private m_Tabs: NodeListOf<Element> | null = null;
    private m_TabIndicator: HTMLElement | null = null;
    private m_LoginForm: HTMLElement | null = null;
    private m_RegistrationForm: HTMLElement | null = null;
    private m_OpenUserPopupButton : HTMLElement | null = null;
    private m_CloseUserPopupButton: HTMLElement | null = null;
    private m_UserPopupOverlay: HTMLElement | null = null;

    public Init()
    {
        //Has to be first since it populates the HTML
        this.m_UserPopupOverlay = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_POPUP_OVERLAY_ID);
        this.m_UserPopupOverlay!.innerHTML = authenticationOverlayHTMLData;

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

        this.m_LoginUsernameInput = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_LOGIN_USERNAME_ELEMENT_ID) as HTMLInputElement;
        this.m_LoginPasswordInput = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_LOGIN_PASSWORD_ELEMENT_ID) as HTMLInputElement;
        this.m_RegistrationUsernameInput = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_REGISTER_USERNAME_ELEMENT_ID) as HTMLInputElement;
        this.m_RegistrationPasswordInput = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_REGISTER_PASSWORD_ELEMENT_ID) as HTMLInputElement;
        this.m_OpenUserPopupButton = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_OPEN_USER_POPUP_BUTTON_ID);
        this.m_CloseUserPopupButton = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_CLOSE_USER_POPUP_BUTTON_ID);
        
        this.m_TabIndicator = HTMLHelpers.QuerySelectAndCheck(GlobalUserSettings.K_TAB_INDICATOR_CLASS_NAME);
        this.m_LoginForm = HTMLHelpers.QuerySelectAndCheck(GlobalUserSettings.K_LOGIN_FORM_CLASS_NAME);
        this.m_RegistrationForm = HTMLHelpers.QuerySelectAndCheck(GlobalUserSettings.K_REGISTER_FORM_CLASS_NAME);
        
        this.m_Tabs = HTMLHelpers.QuerySelectAllAndCheck(GlobalUserSettings.K_TAB_CLASS_NAME);

        loginBtn.addEventListener("click", () => {
            this.OnLoginButtonClicked();
        });

        registerBtn.addEventListener("click", () => {
            this.OnRegisterButtonClicked();
        });

        this.m_UserPopupOverlay?.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.m_UserPopupOverlay)
                {
                    this.CloseUserPopup();
                }
        });

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            const showClass = GlobalUserSettings.K_SHOW_POPUP_CLASS;
            if (e.key === 'Escape' && this.m_UserPopupOverlay?.classList.contains(showClass))
            {
                this.CloseUserPopup();
            }
        });

        this.m_Tabs?.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                if (tabName)
                {
                    this.SwitchTab(tabName);
                }
            })
        });

        this.m_CloseUserPopupButton?.addEventListener('click', this.CloseUserPopup.bind(this));
        this.m_OpenUserPopupButton?.addEventListener('click', this.OnOpenUserPopupButtonClicked.bind(this));

        window.addEventListener('resize', this.UpdateTabIndicator.bind(this));

        this.UpdateTabIndicator();
        this.SetupUsernameInput();
    }

    private OnOpenUserPopupButtonClicked()
    {
        const showClass = GlobalUserSettings.K_SHOW_POPUP_CLASS;
        this.m_UserPopupOverlay?.classList.add(showClass);
        GlobalEvents.Dispatch(EventTypes.RequestKeyboardStateChangeEvent, false);
    }

    private CloseUserPopup()
    {
        const showClass = GlobalUserSettings.K_SHOW_POPUP_CLASS;
        this.m_UserPopupOverlay?.classList.remove(showClass);
        GlobalEvents.Dispatch(EventTypes.RequestKeyboardStateChangeEvent, true);
    }

    private UpdateTabIndicator()
    {
        const activeTab: HTMLElement = document.querySelector(GlobalUserSettings.K_ACTIVE_TAB_CLASS) as HTMLElement;
        if (activeTab && this.m_TabIndicator)
        {
            const tabRect = activeTab.getBoundingClientRect();
            const tabParentRect = activeTab.parentElement!.getBoundingClientRect();
            this.m_TabIndicator.style.left = `${activeTab.offsetLeft}px`;
            this.m_TabIndicator.style.width = `${activeTab.offsetWidth}px`;
        }
    }

    private SetupUsernameInput()
    {
        if (!this.m_LoginUsernameInput)
        {
            throw new Error("Recieved null username input element.");
        }

        this.m_LoginUsernameInput.setAttribute("maxLength", GlobalUserSettings.K_MAX_USERNAME_LENGTH.toString());
    }

    private async OnLoginButtonClicked()
    {
        console.log(`Logging in ...`);
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);

        let username = this.GetInput(this.m_LoginUsernameInput);
        let password = this.GetInput(this.m_LoginPasswordInput);

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

        let username = this.GetInput(this.m_RegistrationUsernameInput);
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

        let password = this.GetInput(this.m_RegistrationPasswordInput);
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

    private SwitchTab(tabName: string)
    {
        this.m_Tabs?.forEach(tab => tab.classList.remove('active'));

        const newActiveTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (newActiveTab)
        {
            newActiveTab.classList.add(`active`);
            this.UpdateTabIndicator();

            //#TODO: move magic strings to GlobalUserConfig
            const showRegisterClassName = 'show-register';
            if (tabName == 'register')
            {
                this.m_LoginForm?.classList.add(showRegisterClassName);
                this.m_RegistrationForm?.classList.add(showRegisterClassName);
            }
            else
            {
                this.m_LoginForm?.classList.remove(showRegisterClassName);
                this.m_RegistrationForm?.classList.remove(showRegisterClassName);
            }
        }
    }
}