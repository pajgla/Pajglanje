function formatTime(ht, mt, st) {
    let h = `${ht > 0 ? ht : 0}`.padStart(2, "0");
    let m = `${mt > 0 ? mt : 0}`.padStart(2, "0");
    let s = `${st > 0 ? st : 0}`.padStart(2, "0");
    return `${h}:${m}:${s}`
}

function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function rand_int_decorator(rnd, limit) {
    return function() {
        return Math.round(rnd() * limit);
    }
}

function make_stable_seeded_rand(seed, limit) {
    return rand_int_decorator(mulberry32(seed), limit);
}

function stringEncrypt(string)
{
    return window.btoa(string);
}

function stringDecrypt(string)
{
    return window.atob(string);
}

export { formatTime, make_stable_seeded_rand, stringEncrypt, stringDecrypt };