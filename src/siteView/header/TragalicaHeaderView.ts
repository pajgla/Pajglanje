import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { GlobalViewSettings } from "../GlobalViewSettings";

export class TragalicaHeaderView
{
    public Init()
    {
        GlobalEvents.AddListener(EventTypes.NewTragalicaGameStartedEvent, this.UpdateTragalicaTitle.bind(this));
    }

    private UpdateTragalicaTitle(tragalicaTime: number)
    {
        let titleElement = document.getElementById(GlobalViewSettings.K_TITLE_ELEMENT_ID);
        if (!titleElement)
        {
            throw new Error(`Cannot find title element with ID ${GlobalViewSettings.K_TITLE_ELEMENT_ID}`);
        }

        titleElement.textContent = GlobalViewSettings.K_TRAGALICA_TITLE + " #" + tragalicaTime.toString();
    }
}