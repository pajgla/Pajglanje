import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { GlobalViewSettings } from "../GlobalViewSettings";

export class LoaderView
{
    private m_LoaderElement : HTMLElement | null = null;

    public Init()
    {
        this.m_LoaderElement = document.getElementById(GlobalViewSettings.K_LOADER_ELEMENT_ID);
        if (!this.m_LoaderElement)
        {
            throw new Error(`Cannot find loader element with ID ${GlobalViewSettings.K_LOADER_ELEMENT_ID}`);
        }

        this.m_LoaderElement.classList.add(GlobalViewSettings.K_LOADER_HIDDEN_CLASS_NAME);

        GlobalEvents.AddListener(EventTypes.StartLoaderEvent, this.Start.bind(this));
        GlobalEvents.AddListener(EventTypes.StopLoaderEvent, this.Stop.bind(this));
    }

    public Start()
    {
        this.m_LoaderElement?.classList.remove(GlobalViewSettings.K_LOADER_HIDDEN_CLASS_NAME);
    }

    public Stop()
    {
        this.m_LoaderElement?.classList.add(GlobalViewSettings.K_LOADER_HIDDEN_CLASS_NAME);
    }
}