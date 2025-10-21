import type {IMasterWordDisplay} from "./IMasterWordDisplay";
import {GlobalViewSettings} from "../../../siteView/GlobalViewSettings";

export class MasterWordDisplay implements IMasterWordDisplay {
    Init(wordLength: number): void {
        let boardElement = document.getElementById(GlobalViewSettings.K_BOARD_ELEMENT_ID);
        if (!boardElement)
        {
            throw new Error(`Cannot find board element with ID ${GlobalViewSettings.K_BOARD_ELEMENT_ID}`);
        }
        
        for (let i = 0; i < wordLength; i++)
        {
            let newSquare = this.CreateLetterSquareElement();
            boardElement.appendChild(newSquare);
        }
    }

    private CreateLetterSquareElement(): HTMLElement {
        let square: HTMLElement = document.createElement("div");
        square.classList.add("master-word-square");
        return square;
    }    
}