export class GlobalUserSettings
{
    public static readonly K_MIN_USERNAME_LENGHT: number = 3;
    public static readonly K_MAX_USERNAME_LENGTH: number = 16;
    public static readonly K_MIN_PASSWORD_LENGTH: number = 5;

    //Elements
    public static readonly K_LOGIN_USERNAME_ELEMENT_ID = "login-username";
    public static readonly K_LOGIN_PASSWORD_ELEMENT_ID = "login-password";
    public static readonly K_REGISTER_USERNAME_ELEMENT_ID = "register-username";
    public static readonly K_REGISTER_PASSWORD_ELEMENT_ID = "register-password";
    public static readonly K_TAB_CLASS_NAME = ".tab";
    public static readonly K_TAB_INDICATOR_CLASS_NAME = ".tab-indicator";
    public static readonly K_LOGIN_FORM_CLASS_NAME = ".form.login";
    public static readonly K_REGISTER_FORM_CLASS_NAME = ".form.register";
    public static readonly K_OPEN_USER_POPUP_BUTTON_ID = "userPopupLink";
    public static readonly K_CLOSE_USER_POPUP_BUTTON_ID = "closePopup";
    public static readonly K_POPUP_OVERLAY_ID = "userPopupOverlay";
    public static readonly K_SHOW_POPUP_CLASS = "show";
    public static readonly K_ACTIVE_TAB_CLASS = ".tab.active";
    public static readonly K_USERNAME_DISPLAY_ID = "username-display";
    public static readonly K_LOGOUT_BUTTON_ID = "user-actions-logout";
}