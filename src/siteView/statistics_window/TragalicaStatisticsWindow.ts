import { GlobalGameSettings } from "../../game/GlobalGameSettings";
import { StatisticsWindowViewBase } from "./StatisticsWindowViewBase";

export class TragalicaStatisticsWindow extends StatisticsWindowViewBase
{
    constructor() {
        super();
    }

    protected StartNextGameTimer(): void {
        super.StartNextGameTimer_Internal(GlobalGameSettings.K_TRAGALICA_START_TIME, GlobalGameSettings.K_NEXT_TRAGALICA_IN_HOURS);
    }
}