import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { GlobalGameSettings } from "../../game/GlobalGameSettings";
import { GlobalViewSettings } from "../GlobalViewSettings";
import * as AnimationHelpers from "../../animations/Animation";

export class BrzalicaHeaderView
{
    private m_BrzalicaTitle = GlobalGameSettings.K_BRZALICA_GAME_NAME.toUpperCase() + ' #';
    private m_BrzalicaTime: number = 0;
    private m_BrzalicaEndTime: Date = new Date();
    private m_TitleElement: HTMLElement | null = null;
    private m_InvervalID?: ReturnType<typeof setInterval>;
    private m_TimeLeftTimeoutID?: ReturnType<typeof setTimeout>;

    public Init()
    {
        this.CacheTitleElement();
        GlobalEvents.AddListener(EventTypes.OnBrzalicaLoaded, this.OnBrzalicaLoadedCallback.bind(this));
        GlobalEvents.AddListener(EventTypes.NewBrzalicaGameStartedEvent, this.OnGameStartedEventCallback.bind(this));
        GlobalEvents.AddListener(EventTypes.OnBrzalicaGameOver, this.OnGameOverCallback.bind(this));
    }

    private OnGameOverCallback()
    {
        clearInterval(this.m_InvervalID);
        clearTimeout(this.m_TimeLeftTimeoutID);
        this.ShowBrzalicaTitle(false);
    }

    private OnBrzalicaLoadedCallback(brzalicaTime: number)
    {
        if (!this.m_TitleElement)
            throw new Error("Title element is null");

        this.m_TitleElement.textContent += `#${brzalicaTime}`;
    }

    private CacheTitleElement()
    {
        this.m_TitleElement = document.getElementById(GlobalViewSettings.K_TITLE_ELEMENT_ID);
        if (!this.m_TitleElement)
        {
            throw new Error(`Cannot find title element with ID ${GlobalViewSettings.K_TITLE_ELEMENT_ID}`);
        }
    }

    private OnGameStartedEventCallback(brzalicaTime: number, endTime: Date)
    {
        this.m_BrzalicaTime = brzalicaTime;
        this.m_BrzalicaEndTime = endTime;
        this.ShowTimeLeft();
    }

    private UpdateTimer()
    {
        if (!this.m_TitleElement)
            throw new Error("Title element is null");

        this.UpdateTimerText();
        this.m_InvervalID = setInterval(this.UpdateTimerText.bind(this), 100);
    }

    private UpdateTimerText()
    {
        let dateDiff = new Date(this.m_BrzalicaEndTime).getTime() - new Date().getTime();
        let minutes = Math.floor(dateDiff / (1000 * 60) % 60);
        let seconds = Math.floor(dateDiff / 1000) % 60;

        if (minutes < 0)
        {
            minutes = 0;
        }
        if (seconds < 0)
        {
            seconds = 0;
        }

        let minutesString = minutes.toString();
        let secondsString = seconds.toString();

        if (minutes < 10)
        {
            minutesString = '0' + minutesString;
        }
        if (seconds < 10)
        {
            secondsString = '0' + secondsString;
        }

        this.m_TitleElement!.textContent = minutesString + ':' + secondsString;
    }

    private ShowBrzalicaTitle(continueAnimation: boolean = true)
    {
        if (!this.m_TitleElement)
            throw new Error("Title element is null");

        clearInterval(this.m_InvervalID);

        AnimationHelpers.Animation_FlipOutAndClear(this.m_TitleElement, 0.5).then(() => {
            this.m_TitleElement!.textContent = this.m_BrzalicaTitle + this.m_BrzalicaTime.toString();

            if (continueAnimation)
            {
                AnimationHelpers.Animation_FlipInAndClear(this.m_TitleElement!, 0.5).then(() => {
                    setTimeout(() => {
                        this.ShowTimeLeft();
                    }, 2000);
                });
            }
        })        
    }

    private ShowTimeLeft()
    {
        if (!this.m_TitleElement)
            throw new Error("Title element is null");

        AnimationHelpers.Animation_FlipOutAndClear(this.m_TitleElement, 0.5).then(() => {
            this.UpdateTimer();
            AnimationHelpers.Animation_FlipInAndClear(this.m_TitleElement!, 0.5).then(() => {
                this.m_TimeLeftTimeoutID = setTimeout(() => {
                    this.ShowBrzalicaTitle();
                }, 10000);
            })
        })
    }
}