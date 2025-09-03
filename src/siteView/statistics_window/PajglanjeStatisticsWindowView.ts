import { GlobalGameSettings } from "../../game/GlobalGameSettings";
import { StatisticsWindowViewBase } from "./StatisticsWindowViewBase";

export class PajglanjeStatisticsWindowView extends StatisticsWindowViewBase
{
    constructor() {
        super();
    }
    
    protected StartNextGameTimer(): void {
        super.StartNextGameTimer_Internal(GlobalGameSettings.K_PAJGLANJE_START_TIME, GlobalGameSettings.K_NEXT_PAJGLA_IN_HOURS)
    }
}