import { UserView } from "./user/UserViewController";
import { SideMenuView } from "./side_menu/SideMenuView";
import { HelpWindowView } from "./help_window/HelpWindowView";
import { PajglanjeStatisticsWindowView } from "./statistics_window/PajglanjeStatisticsWindowView";
import { PajglanjeHeaderView } from "./header/PajglanjeHeaderView";
import { LoaderView } from "./loader/LoaderView";
import * as NotificationHelepers from "../helpers/NotificationHelpers";
import 'jquery-modal'
import { ViewHostBase } from "./ViewHostBase";

export class PajglanjeViewHost extends ViewHostBase
{
    private m_SideMenuView = new SideMenuView();
    private m_HelpWindowView = new HelpWindowView();
    private m_StatisticsWindowView = new PajglanjeStatisticsWindowView();
    private m_HeaderView = new PajglanjeHeaderView();
    private m_LoaderView = new LoaderView();
    private m_UserView = new UserView();

    public override Init(): void {
        this.m_LoaderView.Init();
        this.m_StatisticsWindowView.Init();
        this.m_UserView.Init();
        this.m_SideMenuView.Init();
        this.m_HelpWindowView.Init();
        this.m_HeaderView.Init();
    }
}