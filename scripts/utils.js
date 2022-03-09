function formatTime(ht, mt, st) {
    let h = `${ht > 0 ? ht : 0}`.padStart(2, "0");
    let m = `${mt > 0 ? mt : 0}`.padStart(2, "0");
    let s = `${st > 0 ? st : 0}`.padStart(2, "0");
    return `${h}:${m}:${s}`
}

export { formatTime };