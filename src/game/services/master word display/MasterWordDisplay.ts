import type {IMasterWordDisplay} from "./IMasterWordDisplay";
import {GlobalViewSettings} from "../../../siteView/GlobalViewSettings";
import * as WordHelpers from "../../../helpers/WordHelpers";

export class MasterWordDisplay implements IMasterWordDisplay {
    protected m_MasterWordSquareElements: HTMLElement[] = [];
    protected m_IsInitialized: boolean = false;
    protected m_MasterWord: string = "";
    
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
            this.m_MasterWordSquareElements.push(newSquare);
        }
        
        this.m_IsInitialized = true;
    }

    private CreateLetterSquareElement(): HTMLElement {
        let square: HTMLElement = document.createElement("div");
        square.classList.add("master-word-square");
        return square;
    }
    
    SetMasterWord(word: string) {
        if (!this.m_IsInitialized)
        {
            throw new Error("Master word display is not initialized");
        }
        
        if (this.m_MasterWordSquareElements.length === 0)
        {
            throw new Error("Master word square elements are not initialized");
        }
        
        if (!word || word.length === 0)
        {
            throw new Error("Master word is empty");
        }
        
        if (WordHelpers.SerbianWordLength(word) !== this.m_MasterWordSquareElements.length)
        {
            throw new Error(`Master word length does not match board length`);
        }
        
        let splitWord = WordHelpers.SerbianWordToCharArray(word);
        for (let i = 0; i < WordHelpers.SerbianWordLength(word); i++)
        {            
            this.m_MasterWordSquareElements[i]!.textContent = splitWord[i]!.toUpperCase();
        }
        
        this.m_MasterWord = word;
    }
    
    GetMasterWord(): string {
        return this.m_MasterWord;
    }
}