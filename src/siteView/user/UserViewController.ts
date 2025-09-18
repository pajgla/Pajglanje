import { GlobalEvents } from "../../core/EventBus";
import { EventTypes } from "../../Events/EventTypes";
import { UserManager } from "../../managers/user/UserManager";
import { AuthenticationView } from "./AuthenticationView";
import { UserProfileView } from "./UserProfileView";

export class UserView
{
    private m_AuthenticationView: AuthenticationView | null = null;
    private m_UserProfileView: UserProfileView | null = null;

    public Init(): void
    {
        GlobalEvents.AddListener(EventTypes.OnAutologinFinished, this.OnAutologinFinishedCallback.bind(this));
    }

    private OnAutologinFinishedCallback(success: boolean)
    {
        if (success)
        {
            this.m_UserProfileView = new UserProfileView();
            this.m_UserProfileView!.Init();
        }
        else
        {
            this.m_AuthenticationView = new AuthenticationView();
            this.m_AuthenticationView.Init();
        }
    }
    
    // private SetupUserLoginPopup()
    // {

        
    //     this.m_UserProfilePopup = this.GetElementByIDAndCheck(GlobalUserSettings.K_USER_POPUP_OVERLAY_ID);
        


            
            

    //     this.m_UserProfilePopup?.addEventListener('click', (e: MouseEvent) => {
    //         if (e.target === this.m_UserProfilePopup)
    //         {
    //             this.CloseUserPopup();
    //         }
    //     });


        
    // }








}