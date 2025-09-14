import { GlobalUserSettings } from "./user/GlobalUserSettings";

export class GlobalViewSettings
{
    public static formatMessage(message: string, values: Record<string, string>): string
    {
        return message.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');    
    }

    //Word guessing
    public static readonly K_SHORT_WORD_INFO = "Uneta reč je prekratka";
    public static readonly K_WORD_NOT_FOUND = "Uneta reč ne postoji u našoj bazi";
    public static readonly K_WORD_GUESSED = "ISPAJGLANO!";
    public static readonly K_GAME_LOST = "Reč je bila: ";

    public static readonly K_SHORT_USERNAME_LENGTH_ERROR = `Korisničko ime mora da sadrži bar ${GlobalUserSettings.K_MIN_USERNAME_LENGHT} karaktera`;
    public static readonly K_LONG_USERNAME_LENGHT_ERROR = `Korisničko ime mora da sadrži manje od ${GlobalUserSettings.K_MAX_USERNAME_LENGTH} karaktera`;
    public static readonly K_INVALID_USERNAME_ERROR = "Korisničko ime mora da sadrži samo slova i brojeve";
    public static readonly K_SHORT_PASSWORD_ERROR = `Šifra mora da sadrži najmanje ${GlobalUserSettings.K_MIN_PASSWORD_LENGTH} karaktera`;

    //UI
    public static readonly K_LETTER_FLIP_DELAY = 200;
    public static readonly K_KEYBOARD_COLOR_DELAY = 250;
    public static readonly K_DEFAULT_TOASTIFY_DURATION: number = 2000;

    //Statistics
    public static readonly K_STATISTICS_POPUP_ELEMENT_ID = 'statisticsPopupLink';
    public static readonly K_GAMES_PLAYED_ELEMENT_ID = 'gamesPlayedStatistics';
    public static readonly K_GAMES_WON_ELEMENT_ID = 'gamesWonStatistics';
    public static readonly K_CURRENT_WINSTREAK_ELEMENT_ID = 'currentWinStreakStatistics';
    public static readonly K_BEST_WINSTREAK_ELEMENT_ID = 'bestWinStreakStatistics';
    public static readonly K_GAMES_WON_PERCENTAGE_ELEMENT_ID = 'gamesWonPercentageStatistics';
    public static readonly K_MIN_STATISTICS_GRAPH_WIDTH = 7;
    public static readonly K_CURRENT_GUESS_GRAPH_COLOR = "rgb(83, 141, 78)";
    public static readonly K_STATISTICS_FOOTER_ELEMENT_ID = "footer";
    public static readonly K_TIMER_TITLE = "Sledeće pajglanje za";
    public static readonly K_TIMER_ELEMENT_ID = "nextPajglaTimer";
    public static readonly K_SHARE_BUTTON_ID = "shareButton";
    public static readonly K_SHARE_BUTTON_TEXT = "Podeli";

    //Other
    public static readonly K_TITLE_ELEMENT_ID = "centralHeaderSpace";
    public static readonly K_PAJGLA_TITLE = "PAJGLANJE";

    //Help window
    public static readonly K_HELP_WINDOW_BUTTON_ELEMENT_ID = "helpWindowImg";
    public static readonly K_HELP_WINDOW_CORRECT_LETTER_CLASS = "paintCorrectExample";
    public static readonly K_HELP_WINDOW_PRESENT_LETTER_CLASS = "paintPresentExample";
    public static readonly K_HELP_WINDOW_ABSENT_LETTER_CLASS = "paintAbsentExample";

    //Side menu
    public static readonly K_SIDE_MENU_BUTTON_ELEMENT_ID = "openSideMenuButton";
    public static readonly K_SIDE_MENU_CLOSE_BUTTON_ELEMENT_ID = "closeSideMenuButton";
    public static readonly K_SIDE_MENU_ELEMENT_ID = "sideMenu";

    //Share
    public static readonly K_CORRECT_TILE_SHARE_VISUAL = '🟩';
    public static readonly K_PRESENT_TILE_SHARE_VISUAL = '🟨';
    public static readonly K_ABSENT_TILE_SHARE_VISUAL = '⬛';
    public static readonly K_COPY_SUCCESSFUL_MESSAGE = "Kopirano i spremno za slanje!";

    //Loader
    public static readonly K_LOADER_ELEMENT_ID = "loader";
    public static readonly K_LOADER_HIDDEN_CLASS_NAME = "loader-hidden";

    //Brzalica
    public static readonly K_BOARD_CLEAR_DELAY = 500;
    public static readonly K_TIME_OUT_MESSAGE = `Vreme je isteklo! Reč je bila: `;
    public static readonly K_BRZALICA_FAILED = `Neispajglano. Reč je bila: `;

    //Authentication messages
    public static readonly K_LOGIN_FAILED_MESSAGE = 'Došlo je do greške prilikom prijavljivanja';
    public static readonly K_LOGIN_INFO_WRONG_MESSAGE = 'Prijava je neuspešna - proveri korisničko ime i lozinku';
    public static readonly K_REGISTRATION_FAILED_MESSAGE = 'Došlo je do greške prilikom registracije';
    public static readonly K_REGISTRATION_SUCCESSFUL_MESSAGE = 'Registracija uspešna!';
    public static readonly K_LOGIN_SUCCESSFUL_MESSAGE = `Prijava za '{username}' je uspešna`;
    public static readonly K_AUTOLOGIN_SUCCESSFUL_MESSAGE = `Prijavljeni ste kao {username}`;
    public static readonly K_USERNAME_TAKEN = `Korisničko ime je zauzeto`;
}