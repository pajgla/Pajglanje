import { GlobalViewSettings } from "../../siteView/GlobalViewSettings";

export function GetUIMessageForRegistrationErrorMessage(error: string): string
{
    switch (error)
    {
        case "User already exists":
            return GlobalViewSettings.K_USERNAME_TAKEN;

        default:
            return GlobalViewSettings.K_REGISTRATION_FAILED_MESSAGE;
    }
}