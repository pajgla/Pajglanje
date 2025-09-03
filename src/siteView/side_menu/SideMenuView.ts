import { GlobalViewSettings } from "../GlobalViewSettings";

export class SideMenuView
{
    public Init()
    {
        this.InitSideMenu();
    }

    private InitSideMenu()
    {
        let sideMenuButtonElement = document.getElementById(GlobalViewSettings.K_SIDE_MENU_BUTTON_ELEMENT_ID);
        if (!sideMenuButtonElement)
        {
            throw new Error(`Side menu button not found with ID ${GlobalViewSettings.K_SIDE_MENU_BUTTON_ELEMENT_ID}`);
        }

        sideMenuButtonElement.addEventListener('click', event => {
            this.OpenSideMenu();
        });

        let closeSideMenuButtonElement = document.getElementById(GlobalViewSettings.K_SIDE_MENU_CLOSE_BUTTON_ELEMENT_ID);
        if (!closeSideMenuButtonElement)
        {
            throw new Error(`Close side menu button not found with ID ${GlobalViewSettings.K_SIDE_MENU_CLOSE_BUTTON_ELEMENT_ID}`);
        }

        closeSideMenuButtonElement.addEventListener('click', event => {
            this.CloseSideMenu();
        });
    }

    private OpenSideMenu()
    {
        let sideMenuElement = document.getElementById(GlobalViewSettings.K_SIDE_MENU_ELEMENT_ID);
        if (!sideMenuElement)
            throw new Error("Cannot find side menu element");

        sideMenuElement.style.width = '250px';
    }

    private CloseSideMenu()
    {
        let sideMenuElement = document.getElementById(GlobalViewSettings.K_SIDE_MENU_ELEMENT_ID);
        if (!sideMenuElement)
            throw new Error("Cannot find side menu element");

        sideMenuElement.style.width = '0';
    }
}