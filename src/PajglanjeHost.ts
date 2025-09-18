import { PajglanjeGame } from './game/PajglanjeGame';
import type { IGame } from './game/IGame';
import { UserManager } from './managers/user/UserManager';
import type { ViewHostBase } from './siteView/ViewHostBase';
import { PajglanjeViewHost } from './siteView/PajglanjeViewHost';
import * as NotificationHelpers from './helpers/NotificationHelpers'
import { GlobalViewSettings } from './siteView/GlobalViewSettings';
import { GlobalEvents } from './core/EventBus';
import { EventTypes } from './Events/EventTypes';

let gameInstance: IGame = new PajglanjeGame();
let userManager: UserManager = new UserManager();
let pajglanjeView: ViewHostBase = new PajglanjeViewHost();

document.addEventListener("DOMContentLoaded", async () => {
    try
    {
        pajglanjeView.Init();
        //Send loader event after view/ui is initialized
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);
        await userManager.TryAutoLogin();
        
        gameInstance.Init();
        gameInstance.StartGame();

        GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
    }
    catch(e)
    {
        console.error(e);
        NotificationHelpers.ShowErrorNotification(GlobalViewSettings.K_FATAL_GAME_ERROR_MESSAGE, 10000);

        //Send event if an error occured in view init
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);
    }
});