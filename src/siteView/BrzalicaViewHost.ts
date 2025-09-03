import { BrzalicaHeaderView } from "./header/BrzalicaHeaderView";
import { HelpWindowView } from "./help_window/HelpWindowView";
import { LoaderView } from "./loader/LoaderView"
import { SideMenuView } from "./side_menu/SideMenuView";
import { BrzalicaStatisticsWindowView } from "./statistics_window/BrzalicaStatisticsWindowView";

const loaderView = new LoaderView();
const helpWindowView = new HelpWindowView();
const sideMenuView = new SideMenuView();
const headerView = new BrzalicaHeaderView();
const statisticsView = new BrzalicaStatisticsWindowView();

document.addEventListener('DOMContentLoaded', () => {
    loaderView.Init();
    helpWindowView.Init();
    sideMenuView.Init();
    headerView.Init();
    statisticsView.Init();

    loaderView.Stop();
})