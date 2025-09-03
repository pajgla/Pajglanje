import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { GameTimeHelpers } from "../../helpers/GameTimeHelpers";
import { GlobalViewSettings } from "../GlobalViewSettings";

export abstract class StatisticsWindowViewBase
{
    public Init()
    {
        GlobalEvents.AddListener(EventTypes.CreateStatisticsFooterEvent, this.CreateStatisticsFooter.bind(this));
        GlobalEvents.AddListener(EventTypes.StartNextGameTimerEvent, this.StartNextGameTimer);
    }

    protected abstract StartNextGameTimer(): void;

    protected StartNextGameTimer_Internal(gameStartTime: Date, hoursBetweenGames: number)
    {
        const gameTime = GameTimeHelpers.GetGameTime(gameStartTime, hoursBetweenGames);
        const nextGameTime = gameTime + 1;
        let nextGameDate = new Date(gameStartTime);
        nextGameDate.setHours(nextGameDate.getHours() + hoursBetweenGames * nextGameTime);

        let timerElement = document.getElementById(GlobalViewSettings.K_TIMER_ELEMENT_ID);
        if (!timerElement)
        {
            throw new Error("Next game timer element is not initialized");
        }

        setInterval(() => {
            let currentDate = new Date();
            let dateDiff = nextGameDate.getTime() - currentDate.getTime();
            let hours = Math.floor(dateDiff / (1000 * 60 * 60));
            let minutes = Math.floor(dateDiff / (1000 * 60)) % 60;
            let seconds = Math.floor(dateDiff / 1000) % 60;

            if (hours < 0)
            {
                hours = 0;
            }
            if (minutes < 0)
            {
                minutes = 0;
            }
            if (seconds < 0)
            {
                seconds = 0;
            }

            let hoursString: string = hours.toString();
            let minutesString: string = minutes.toString();
            let secondsString: string = seconds.toString();

            if (hours < 10)
            {
                hoursString = '0' + hoursString;
            }
            if (minutes < 10)
            {
                minutesString = '0' + minutesString;
            }
            if (seconds < 10)
            {
                secondsString = '0' + secondsString;
            }

            timerElement.textContent = hoursString + ':' + minutesString + ':' + secondsString;
        }, 100)
    }

    protected CreateStatisticsFooter()
    {
        let footerElement = document.getElementById(GlobalViewSettings.K_STATISTICS_FOOTER_ELEMENT_ID);
        if (!footerElement)
        {
            throw new Error(`Cannot find footer element with ID ${footerElement}`);
        }

        //Check if we already created the footer
        let checkNextPajglaTimerElement = document.getElementById(GlobalViewSettings.K_TIMER_ELEMENT_ID);
        if (checkNextPajglaTimerElement !== null)
        {
            throw new Error("Footer already created.");
        }

        let coundownTimerElement = document.createElement("div");
        coundownTimerElement.classList.add('countdown');
        footerElement.appendChild(coundownTimerElement);

        let timerTitleElement = document.createElement('h4');
        timerTitleElement.textContent = GlobalViewSettings.K_TIMER_TITLE;
        coundownTimerElement.appendChild(timerTitleElement);

        let nextPajglaTimerElement = document.createElement('div');
        nextPajglaTimerElement.id = GlobalViewSettings.K_TIMER_ELEMENT_ID;
        coundownTimerElement.appendChild(nextPajglaTimerElement);

        let shareButtonHolderElement = document.createElement('div');
        shareButtonHolderElement.classList.add('share');
        footerElement.appendChild(shareButtonHolderElement);

        let shareButtonElement = document.createElement('button');
        shareButtonElement.id = GlobalViewSettings.K_SHARE_BUTTON_ID;
        shareButtonElement.textContent = GlobalViewSettings.K_SHARE_BUTTON_TEXT;
        shareButtonHolderElement.appendChild(shareButtonElement);
        shareButtonElement.addEventListener("click", () => {
            GlobalEvents.Dispatch(EventTypes.OnShareButtonClickedEvent);
        });

        GlobalEvents.Dispatch(EventTypes.StartNextGameTimerEvent);
    }
}