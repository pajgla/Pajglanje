import Toastify from 'toastify-js';
import { GlobalViewSettings } from "../siteView/GlobalViewSettings";

export function ShowInfoNotification(text: string, duration: number = GlobalViewSettings.K_DEFAULT_TOASTIFY_DURATION)
{
    Toastify({
        text: text,
        duration: duration,
        className: "toastify-info"
    }).showToast();
}

export function ShowCongratsNotification(text: string, duration: number = GlobalViewSettings.K_DEFAULT_TOASTIFY_DURATION)
{
    Toastify({
        text: text,
        duration: duration,
        className: "toastify-congrats"
    }).showToast();
}

export function ShowErrorNotification(text: string, duration: number = GlobalViewSettings.K_DEFAULT_TOASTIFY_DURATION)
{
    Toastify({
        text: text,
        duration: duration,
        className: "toastify-error"
    }).showToast();
}