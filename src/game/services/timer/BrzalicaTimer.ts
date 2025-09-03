type TimerCallback = () => void;

export class BrzalicaTimer
{
    private m_EndTime: Date = new Date();
    private m_Callback?: TimerCallback | undefined;
    private m_IntervalID?: ReturnType<typeof setInterval>;

    public Start(durationInSeconds: number, callback?: TimerCallback)
    {
        this.m_Callback = callback;
        
        let currentTime = new Date();
        let endTime = currentTime;
        endTime.setSeconds(endTime.getSeconds() + durationInSeconds);
        this.m_EndTime = endTime;

        this.m_IntervalID = setInterval(this.UpdateTimer.bind(this), 100);
    }

    private UpdateTimer()
    {
        const secondsLeft = this.GetSecondsLeft();
        if (secondsLeft <= 0)
        {
            this.StopTimer_Internal();
        }
    }

    private StopTimer_Internal()
    {
        clearInterval(this.m_IntervalID);

        if (this.m_Callback !== undefined)
            this.m_Callback();
    }

    public StopTimer()
    {
        clearInterval(this.m_IntervalID);
    }

    public GetSecondsLeft(): number
    {
        const currentTime = new Date();
        return this.m_EndTime.getTime() - currentTime.getTime();
    }
}