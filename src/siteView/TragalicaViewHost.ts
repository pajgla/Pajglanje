import {SideMenuView} from "./side_menu/SideMenuView";
import {HelpWindowView} from "./help_window/HelpWindowView";
import {PajglanjeStatisticsWindowView} from "./statistics_window/PajglanjeStatisticsWindowView";
import {PajglanjeHeaderView} from "./header/PajglanjeHeaderView";
import {LoaderView} from "./loader/LoaderView";

const sideMenuView = new SideMenuView();
const helpWindowView = new HelpWindowView();
const statisticsWindowView = new PajglanjeStatisticsWindowView();
const headerView = new PajglanjeHeaderView();
const loaderView = new LoaderView();
document.addEventListener("DOMContentLoaded", () => {
    loaderView.Init();
    statisticsWindowView.Init();
    //userView.Init();
    sideMenuView.Init();
    helpWindowView.Init();
    headerView.Init();

    //Site loaded
    loaderView.Stop();
})