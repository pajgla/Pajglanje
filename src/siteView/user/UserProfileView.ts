import { GlobalEvents } from '../../core/EventBus';
import { EventTypes } from '../../Events/EventTypes';
import * as HTMLHelpers from '../../helpers/HTMLHelpers';
import { GlobalUserSettings } from './GlobalUserSettings';
import { userProfileHTMLData } from './UserProfileHTMLData';

export class UserProfileView
{
    private m_OpenUserPopupButton : HTMLElement | null = null;
    private m_CloseUserPopupButton: HTMLElement | null = null;
    private m_UserPopupOverlay: HTMLElement | null = null;

    public Init()
    {
        //Has to be first since it populates the HTML
        this.m_UserPopupOverlay = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_POPUP_OVERLAY_ID);
        this.m_UserPopupOverlay!.innerHTML = userProfileHTMLData;

        this.m_OpenUserPopupButton = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_OPEN_USER_POPUP_BUTTON_ID);
        this.m_CloseUserPopupButton = HTMLHelpers.GetElementByIDAndCheck(GlobalUserSettings.K_CLOSE_USER_POPUP_BUTTON_ID);

        this.m_CloseUserPopupButton?.addEventListener('click', this.CloseUserPopup.bind(this));
        this.m_OpenUserPopupButton?.addEventListener('click', this.OnOpenUserPopupButtonClicked.bind(this));

        this.m_UserPopupOverlay?.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.m_UserPopupOverlay)
                {
                    this.CloseUserPopup();
                }
        });

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            const showClass = GlobalUserSettings.K_SHOW_POPUP_CLASS;
            if (e.key === 'Escape' && this.m_UserPopupOverlay?.classList.contains(showClass))
            {
                this.CloseUserPopup();
            }
        });
    }

    private CloseUserPopup()
    {

    }

    private OnOpenUserPopupButtonClicked()
    {
        const showClass = GlobalUserSettings.K_SHOW_POPUP_CLASS;
        this.m_UserPopupOverlay?.classList.add(showClass);
        GlobalEvents.Dispatch(EventTypes.RequestKeyboardStateChangeEvent, false);
    }
}