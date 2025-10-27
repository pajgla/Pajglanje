import {SideMenuView} from "./side_menu/SideMenuView";
import {HelpWindowView} from "./help_window/HelpWindowView";
import {LoaderView} from "./loader/LoaderView";
import {TragalicaHeaderView} from "./header/TragalicaHeaderView";
import $ from 'jquery'
import 'jquery-modal'
import {TragalicaStatisticsWindow} from "./statistics_window/TragalicaStatisticsWindow";

const sideMenuView = new SideMenuView();
const helpWindowView = new HelpWindowView();
const statisticsWindowView = new TragalicaStatisticsWindow();
const headerView = new TragalicaHeaderView();
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