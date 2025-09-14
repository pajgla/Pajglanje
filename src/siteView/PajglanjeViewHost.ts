import { UserView } from "./user/UserView";
import { SideMenuView } from "./side_menu/SideMenuView";
import { HelpWindowView } from "./help_window/HelpWindowView";
import { PajglanjeStatisticsWindowView } from "./statistics_window/PajglanjeStatisticsWindowView";
import { PajglanjeHeaderView } from "./header/PajglanjeHeaderView";
import { LoaderView } from "./loader/LoaderView";
import $ from 'jquery'
import 'jquery-modal'

//const userView = new UserView();
const sideMenuView = new SideMenuView();
const helpWindowView = new HelpWindowView();
const statisticsWindowView = new PajglanjeStatisticsWindowView();
const headerView = new PajglanjeHeaderView();
const loaderView = new LoaderView();
const userView = new UserView();

document.addEventListener("DOMContentLoaded", () => {
    statisticsWindowView.Init();
    userView.Init();
    sideMenuView.Init();
    helpWindowView.Init();
    headerView.Init();
    loaderView.Init();

    //Site loaded
    loaderView.Stop();
});

