import { ELetterStatus } from "../game/services/board/LetterStatus";
import { GlobalViewSettings } from "../siteView/GlobalViewSettings";
import * as NotificationHelpers from '../helpers/NotificationHelpers';

export function LetterStateToShareSymbol(letterState: ELetterStatus): string
{
    switch (letterState)
    {
        case ELetterStatus.Correct:
            return GlobalViewSettings.K_CORRECT_TILE_SHARE_VISUAL;
        case ELetterStatus.Present:
            return GlobalViewSettings.K_PRESENT_TILE_SHARE_VISUAL;
        case ELetterStatus.Absent:
            return GlobalViewSettings.K_ABSENT_TILE_SHARE_VISUAL;
        default:
            throw new Error("Unhandled letter status");
    }
}

export function ScoreToShareSymbol(score: number): string
{
    if (score <= 0)
    {
        return GlobalViewSettings.K_NEGATIVE_SCORE_SHARE_VISUAL;
    }
    else
    {
        return GlobalViewSettings.K_POSITIVE_SCORE_SHARE_VISUAL;
    }
}

export function CopyToClipboard(message: string)
{
    navigator.clipboard.writeText(message).then(() => {
        NotificationHelpers.ShowInfoNotification(GlobalViewSettings.K_COPY_SUCCESSFUL_MESSAGE);
    }).catch(err => {
        NotificationHelpers.ShowErrorNotification("Došlo je do greške prilikom kopiranja");
    })
}