import type { IKeyboard } from "./IKeyboard";

import { GlobalEvents } from "../../../core/EventBus";
import { EventTypes } from "../../../Events/EventTypes";
import type { ELetterStatus, LetterStatusWrapper } from "../../../game/services/word_services/AttemptStatuses";
import * as WordHelpers from "../../../helpers/WordHelpers";
import { GetStyleForKeyboardButton } from "../../../helpers/ColorFunctions"
import { GlobalViewSettings } from "../../../siteView/GlobalViewSettings";

export class Keyboard implements IKeyboard {
    private m_LetterKeyButtonQuerySelector: string;
    private m_ConfirmKeyTitle: string;
    private m_DeleteKeyTitle: string;
    private m_IsEnabled: boolean = true;
    private m_IsLocked: boolean = false;
    private m_KeyMap: Map<string, HTMLButtonElement> = new Map();

    constructor(keyButtonQuerySelector: string = ".keyboard-row button", confirmKeyTitle = "enter", deleteKeyTitle = "del") {
        this.m_LetterKeyButtonQuerySelector = keyButtonQuerySelector;
        this.m_ConfirmKeyTitle = confirmKeyTitle;
        this.m_DeleteKeyTitle = deleteKeyTitle;
    }

    public CommonLayoutsToSerbianLatin(key: string): string
    {
        switch (key.toLowerCase())
            {
                case "q": return "lj";
                case "w": return "nj";
                case "x": return "dž";
                case "y": return "z";
                case "\\": case '#': return "ž";
                case '[': case 'ü': return 'š';
                case ']': case '+': return 'đ';
                case '\'': case 'ä': return 'ć';
                case ';': case 'ö': return 'č';
                default: return key;
            }
    }

    public SetEnabled(enabled: boolean): void {
        if (this.m_IsLocked)
            return;

        this.m_IsEnabled = enabled;
    }

    private TriggerKeyboardEvent(eventType: EventTypes, ...args: any[]): void {
        if (this.m_IsEnabled) {
            GlobalEvents.Dispatch(eventType, ...args);
        }
    }

    public Init()
    {
        GlobalEvents.AddListener(EventTypes.RequestKeyboardStateChangeEvent, this.OnKeyboardStateChangeRequested.bind(this));

        for (let key of document.querySelectorAll(this.m_LetterKeyButtonQuerySelector))
        {
            if (!(key instanceof HTMLButtonElement)) {
                throw new Error("Keyboard key is not an HTMLButtonElement");
            }

            let dataKey = (key as HTMLButtonElement).getAttribute("data-key");
            if (!dataKey)
            {
                throw new Error(`Cannot find data-key attribute for key ${key}`);
            }

            if (dataKey === this.m_ConfirmKeyTitle)
            {
                key.onclick = (target) => {
                    this.TriggerKeyboardEvent(EventTypes.ConfirmKeyPressedEvent);
                }
            }
            else if (dataKey === this.m_DeleteKeyTitle)
            {
                key.onclick = (target) => {
                    this.TriggerKeyboardEvent(EventTypes.DeleteKeyPressedEvent);
                }
            }
            else
            {
                key.onclick = (target) => {
                    let letter = (target.target as HTMLButtonElement).getAttribute("data-key");
                    if (letter) {
                        this.TriggerKeyboardEvent(EventTypes.LetterKeyPressedEvent, this.CommonLayoutsToSerbianLatin(letter));
                    }
                }
            }
            this.m_KeyMap.set(WordHelpers.ToWorkingCase(dataKey), key as HTMLButtonElement);
        }

        let self = this;
        document.addEventListener("keyup", function(event) {
            if (self.m_IsEnabled) {
                let key = event.code;

                if (key === 'Enter') {
                    self.TriggerKeyboardEvent(EventTypes.ConfirmKeyPressedEvent);
                }
                else if (key === 'Backspace') {
                    self.TriggerKeyboardEvent(EventTypes.DeleteKeyPressedEvent);
                }
                else {
                    let serbianLetter = WordHelpers.ToWorkingCase(self.CommonLayoutsToSerbianLatin(event.key.toLowerCase()));
                    if (!self.IsLetterKey(serbianLetter)) {
                        return;
                    }

                    self.TriggerKeyboardEvent(EventTypes.LetterKeyPressedEvent, serbianLetter);
                }
            }
        })
    }

    private IsLetterKey(key: string): boolean
    {
        return this.m_KeyMap.has(key);
    }

    public async ColorKeys(letterStatuses: LetterStatusWrapper[], instant: boolean = false): Promise<void> {

        const flipDelay = instant ? 0 : GlobalViewSettings.K_KEYBOARD_COLOR_DELAY;
        const totalTime = flipDelay * letterStatuses.length;

        for (let i = 0; i < letterStatuses.length; ++i)
        {
            let letter = letterStatuses[i]?.char ?? null;
            if (letter === null || letter === undefined)
            {
                throw new Error("letter is null");
            }

            const letterStatus = letterStatuses[i]?.status ?? null;
            if (letterStatus === null || letterStatus === undefined)
            {
                throw new Error(`Letter status is null.`);
            }

            letter = WordHelpers.ToWorkingCase(letter);
            if (!this.m_KeyMap.has(letter))
            {
                console.error(`Cannot find letter ${letter} in key map`);
            }

            const keyElement = this.m_KeyMap.get(letter);
            setTimeout(async () => {
                this.UpdateKeyColor(keyElement! as HTMLElement, letterStatus);
            }, flipDelay * i);
        }

        await new Promise(resolve => setTimeout(resolve, totalTime));
    }

    public ClearAllColoring(): void {
        for (let [key, htmlElement] of this.m_KeyMap)
        {
            htmlElement.removeAttribute("data-value");
            htmlElement.style.background = '';
            htmlElement.style.backgroundImage = '';
            htmlElement.style.borderColor = '';
            htmlElement.classList.add('unused');
        }
    }

    private UpdateKeyColor(keyElement: HTMLElement, letterStatus: ELetterStatus, animate: boolean = true): void
    {
        let currentColor = Number.parseInt(keyElement.getAttribute("data-value") ?? "2");
        if (currentColor < letterStatus)
        {
            return;
        }

        keyElement.setAttribute("data-value", letterStatus.toString());
        keyElement.style = GetStyleForKeyboardButton(letterStatus);
        keyElement.classList.remove("unused");
    }

    private OnKeyboardStateChangeRequested(newState: boolean, lock: boolean = false): void {
        this.SetEnabled(newState);
        this.ChangeLockState(lock);
    }

    private ChangeLockState(newState: boolean)
    {
        this.m_IsLocked = newState;
    }
}


