import { GlobalUserSettings } from "./GlobalUserSettings"

const userProfileHTMLData = `
  <div class="popup" id="popup-data">
    <div class="form-container">
      <div id="${GlobalUserSettings.K_USERNAME_DISPLAY_ID}"></div>
      <div id="user-actions-holder">
        <div id="user-actions">
          <button id="${GlobalUserSettings.K_LOGOUT_BUTTON_ID}" class="user-action-button user-action-logout">Odjavi se</button>
        </div>
      </div>
    </div>
  </div>
`

export {userProfileHTMLData};