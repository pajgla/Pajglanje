import type { IDictionaryHolder } from "./IDictionary";

import { DICT_DAILY_WORDS } from "./dict_daily_words_5";
import { DICT_GUESS_WORDS } from "./dict_guess_words_5";

export class FiveWordLengthDictionaryHolder implements IDictionaryHolder {
    public GetDailyWordsDictionary(): string[] {
        return DICT_DAILY_WORDS;
    }

    public GetGuessWordsDictionary(): string[] {
        return DICT_GUESS_WORDS;
    }
}