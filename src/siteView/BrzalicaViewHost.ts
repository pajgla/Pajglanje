import { BrzalicaHeaderView } from "./header/BrzalicaHeaderView";
import { HelpWindowView } from "./help_window/HelpWindowView";
import { LoaderView } from "./loader/LoaderView"
import { SideMenuView } from "./side_menu/SideMenuView";
import { BrzalicaStatisticsWindowView } from "./statistics_window/BrzalicaStatisticsWindowView";
import { ViewHostBase } from "./ViewHostBase";

export class BrzalicaViewHost extends ViewHostBase
{
    private m_LoaderView = new LoaderView();
    private m_HelpWindowView = new HelpWindowView();
    private m_SideMenuView = new SideMenuView();
    private m_HeaderView = new BrzalicaHeaderView();
    private m_StatisticsView = new BrzalicaStatisticsWindowView();

    public override Init(): void {
        this.m_LoaderView.Init();
        this.m_HelpWindowView.Init();
        this.m_SideMenuView.Init();
        this.m_HeaderView.Init();
        this.m_StatisticsView.Init();
    }
}