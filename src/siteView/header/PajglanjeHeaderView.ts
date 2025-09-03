import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { GlobalViewSettings } from "../GlobalViewSettings";

export class PajglanjeHeaderView
{
    public Init()
    {
        GlobalEvents.AddListener(EventTypes.NewPajglaGameStartedEvent, this.UpdatePajglaTitle.bind(this));
    }

    private UpdatePajglaTitle(pajglaTime: number)
    {
        let titleElement = document.getElementById(GlobalViewSettings.K_TITLE_ELEMENT_ID);
        if (!titleElement)
        {
            throw new Error(`Cannot find title element with ID ${GlobalViewSettings.K_TITLE_ELEMENT_ID}`);
        }

        titleElement.textContent = GlobalViewSettings.K_PAJGLA_TITLE + " #" + pajglaTime.toString();
    }
}