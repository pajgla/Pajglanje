import { AnimationType } from "./AnimationType";

function AnimateElementAndClean(
    element: HTMLElement,
    animation: AnimationType,
    duration: number = 1,
    prefix: string = "animate__"
): Promise<"Animation ended">
{
    return new Promise((resolve, reject) => {
        const fullAnimationName = `${prefix}${animation}`;
        element.classList.add(`${prefix}animated`, fullAnimationName);
        element.style.setProperty(`--animate-duration`, `${duration}s`);

        //Remove animation classes and resolve the promise
        const HandleAnimationEnd = (event: AnimationEvent) => {
            event.stopPropagation();
            element.classList.remove(`${prefix}animated`, fullAnimationName);
            element.style.removeProperty(`--animate-duration`);
            resolve("Animation ended");
        };

        element.addEventListener("animationend", HandleAnimationEnd, {once: true});
    })
}

export function Animation_FlipInAndClear(element: HTMLElement, duration: number = 0.8): Promise<"Animation ended">
{
    return AnimateElementAndClean(element, AnimationType.FlipIn, duration);
}

export function Animation_BounceAndClear(element: HTMLElement, duration: number = 0.6): Promise<"Animation ended">
{
    return AnimateElementAndClean(element, AnimationType.Bounce, duration);
}

export function Animation_FlipOutAndClear(element: HTMLElement, duration: number = 0.8): Promise<"Animation ended">
{
    return AnimateElementAndClean(element, AnimationType.FlipOut, duration);
}

export function Animation_HeadShakeAndClear(element: HTMLElement, duration: number = 0.4): Promise<"Animation ended">
{
    return AnimateElementAndClean(element, AnimationType.HeadShake, duration);
}