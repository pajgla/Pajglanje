import {SideMenuView} from "./side_menu/SideMenuView";
import {HelpWindowView} from "./help_window/HelpWindowView";
import {PajglanjeStatisticsWindowView} from "./statistics_window/PajglanjeStatisticsWindowView";
import {LoaderView} from "./loader/LoaderView";
import {TragalicaHeaderView} from "./header/TragalicaHeaderView";
import $ from 'jquery'
import 'jquery-modal'

const sideMenuView = new SideMenuView();
const helpWindowView = new HelpWindowView();
const statisticsWindowView = new PajglanjeStatisticsWindowView();
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