import { GlobalEvents } from "../src/core/EventBus";
import { EventTypes } from "../src/Events/EventTypes";

document.addEventListener("DOMContentLoaded", () => {
    const tabs: NodeListOf<Element> = document.querySelectorAll('.tab');
    const indicator: HTMLElement | null = document.querySelector('.tab-indicator');
    const loginForm: HTMLElement | null = document.querySelector('.form.login');
    const registerForm: HTMLElement | null = document.querySelector('.form.register');
    const openPopupBtn: HTMLElement | null = document.getElementById('userPopupLink');
    const closePopupBtn: HTMLElement | null = document.getElementById('closePopup');
    const popupOverlay: HTMLElement | null = document.getElementById('popupOverlay');
    const profileOverlay: HTMLElement | null = document.getElementById('userProfilePopup');

    function showPopup(): void {
        
        if (popupOverlay) {
            popupOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            GlobalEvents.Dispatch(EventTypes.RequestKeyboardStateChangeEvent, false);
        }
    }

    function hidePopup(): void {
        if (popupOverlay) {
            GlobalEvents.Dispatch(EventTypes.RequestKeyboardStateChangeEvent, true);
            popupOverlay.classList.remove('show');
            document.body.style.overflow = 'auto';

            document.querySelectorAll<HTMLInputElement>('input').forEach(input => {
                input.value = '';
            });

            setTimeout(() => {
                switchTab('login');
            }, 300);
        }
    }

    if (openPopupBtn) {
        openPopupBtn.addEventListener('click', showPopup);
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', hidePopup);
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e: MouseEvent) => {
            if (e.target === popupOverlay) {
                hidePopup();
            }
        });
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && popupOverlay?.classList.contains('show')) {
            hidePopup();
        }
    });

    function updateIndicator(): void {
        const activeTab: Element | null = document.querySelector('.tab.active');
        if (activeTab && indicator) {
            const tabRect: DOMRect = activeTab.getBoundingClientRect();
            const tabsRect: DOMRect = activeTab.parentElement!.getBoundingClientRect();

            indicator.style.left = `${activeTab.offsetLeft}px`;
            indicator.style.width = `${activeTab.offsetWidth}px`;
        }
    }

    function switchTab(tabName: string): void {
        tabs.forEach(tab => tab.classList.remove('active'));
        const newActiveTab: Element | null = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (newActiveTab) {
            newActiveTab.classList.add('active');
            
            updateIndicator();
            
            if (tabName === 'register') {
                loginForm?.classList.add('show-register');
                registerForm?.classList.add('show-register');
            } else {
                loginForm?.classList.remove('show-register');
                registerForm?.classList.remove('show-register');
            }
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName: string | null = tab.getAttribute('data-tab');
            if (tabName) switchTab(tabName);
        });
    });

    updateIndicator();

    window.addEventListener('resize', updateIndicator);
});