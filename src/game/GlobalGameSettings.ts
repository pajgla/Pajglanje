export class GlobalGameSettings {
    //Pajglanje settings
    public static readonly K_PAJGLANJE_GAME_NAME: string = "Pajglanje";
    public static readonly K_PAJGLANJE_START_TIME: Date = new Date('2025-08-11T00:00:00');
    public static readonly K_PAJGLANJE_WORD_LENGTH: number = 5;
    public static readonly K_PAJGLANJE_ATTEMPTS: number = 6;
    public static readonly K_NEXT_PAJGLA_IN_HOURS = 8; //1-24

    //Brzalica settings
    public static readonly K_BRZALICA_GAME_NAME = "Brzalica";
    public static readonly K_BRZALICA_START_TIME: Date = new Date('2025-09-07T02:00:00');
    public static readonly K_BRZALICA_WORD_LENGTH = 5;
    public static readonly K_BRZALICA_ATTEMPTS = 6;
    public static readonly K_NEXT_BRZALICA_IN_HOURS = 12; // 1-24
    public static readonly K_BRZALICA_DURATION = 900;
    
    //Tragalica settings
    public static readonly K_TRAGALICA_GAME_NAME = "Tragalica";
    public static readonly K_TRAGALICA_START_TIME: Date = new Date('2025-10-22T00:00:00');
    public static readonly K_TRAGALICA_WORD_LENGTH = 5;
    public static readonly K_TRAGALICA_HIDDEN_WORDS = 5;
    public static readonly K_NEXT_TRAGALICA_IN_HOURS = 24;

    //Save Game
    public static readonly K_PAJGLA_SAVEGAME_KEY = "pajgla_save_game";
    public static readonly K_BRZALICA_SAVEGAME_KEY = "brzalica_save_game";

    //This is for the old save game version
    public static readonly K_OLD_PAJGLA_SAVEGAME_KEY = "pajgla_saved_game";
    public static readonly K_OLD_STATISTICS_SAVEGAME_KEY = "pajgla_statistics";

    //User
    public static readonly K_USER_SAVE_KEY = "user_save_data";
}