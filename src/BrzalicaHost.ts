import { GlobalEvents } from "./core/EventBus";
import { EventTypes } from "./Events/EventTypes";
import { BrzalicaGame } from "./game/BrzalicaGame"
import type { IGame } from "./game/IGame"
import { BrzalicaViewHost } from "./siteView/BrzalicaViewHost";
import type { ViewHostBase } from "./siteView/ViewHostBase";
import * as NotificationHelpers from "./helpers/NotificationHelpers"
import { GlobalViewSettings } from "./siteView/GlobalViewSettings";

let gameInstance: IGame = new BrzalicaGame();
let brzalicaViewHost: ViewHostBase = new BrzalicaViewHost();

document.addEventListener('DOMContentLoaded', () => {
    try
    {
        brzalicaViewHost.Init();
        //Send loader event after view is initialized

        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);

        gameInstance.Init();
        gameInstance.StartGame();

        GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
    }
    catch(e)
    {
        console.error(e);
        NotificationHelpers.ShowErrorNotification(GlobalViewSettings.K_FATAL_GAME_ERROR_MESSAGE, 10000);
    }
});