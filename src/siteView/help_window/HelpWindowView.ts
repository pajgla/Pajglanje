import { GlobalViewSettings } from "../GlobalViewSettings";
import * as AnimationsModule from "../../animations/Animation";
import { ELetterStatus } from "../../game/services/board/LetterStatus";
import { GetStyleForLetterStatus } from "../../helpers/ColorFunctions";

export class HelpWindowView
{
    public Init()
    {
        this.InitHelpWindow();
    }

    private InitHelpWindow()
    {
        let helpButtonElement = document.getElementById(GlobalViewSettings.K_HELP_WINDOW_BUTTON_ELEMENT_ID);
        if (!helpButtonElement)
        {
            throw new Error("Cannot find help button element with ID " + GlobalViewSettings.K_HELP_WINDOW_BUTTON_ELEMENT_ID);
        }

        helpButtonElement.onclick = () => {
            let correctExampleElements = document.getElementsByClassName(GlobalViewSettings.K_HELP_WINDOW_CORRECT_LETTER_CLASS) as HTMLCollectionOf<HTMLElement>;
            let presentExampleElements = document.getElementsByClassName(GlobalViewSettings.K_HELP_WINDOW_PRESENT_LETTER_CLASS) as HTMLCollectionOf<HTMLElement>;
            let absentExampleElements = document.getElementsByClassName(GlobalViewSettings.K_HELP_WINDOW_ABSENT_LETTER_CLASS) as HTMLCollectionOf<HTMLElement>;

            setTimeout(() => {
                this.AnimateExampleElements(correctExampleElements, ELetterStatus.Correct);
                this.AnimateExampleElements(presentExampleElements, ELetterStatus.Present);
                this.AnimateExampleElements(absentExampleElements, ELetterStatus.Absent);
            }, GlobalViewSettings.K_LETTER_FLIP_DELAY);
        }
    }

    private AnimateExampleElements(elements: HTMLCollectionOf<HTMLElement>, letterStatus: ELetterStatus)
    {
        for (let element of elements)
        {
            AnimationsModule.Animation_FlipInAndClear(element);
            element.style = GetStyleForLetterStatus(letterStatus);
        }
    }
}