
export function simpleAnimateFlipAndClear(element) {
    return animateElementAndClean(element, 'flipInX', 0.8);
}

export function delay(something, sec) {
    setTimeout(something, sec * 1000);
}

export function animateElementAndClean(element, animation, animationDuration = 1, prefix = 'animate__') {
    return new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        element.classList.add(`${prefix}animated`, animationName);
        element.style.setProperty('--animate-duration', `${animationDuration}s`);

        //Remove animation classes and resolve the promise
        function HandleAnimationEnd(event) {
            event.stopPropagation();
            element.classList.remove(`${prefix}animated`, animationName);
            element.style.removeProperty('--animate-duration');
            resolve('Animation ended');
        }

        element.addEventListener('animationend', HandleAnimationEnd, {once: true});
    })
};
