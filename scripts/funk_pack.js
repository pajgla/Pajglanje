
// pretty print
function pprint(title, content) {
    console.log(title);
    console.log(content);
    console.log("");
}

// string -> array of chars
function break_apart(a) {
    let result = [];
    for (let i = 0; i < a.length; i++) {
        result.push(a[i]);
    }
    return result;
}

// zip([ a, b, c ], [ d, e, f ]) => [ [a, d], [b, e], [c, f] ]
function zip(a, b) {
    let zipper = [];
    for (let i = 0; i < a.length; i++) {
        zipper.push([ a[i], b[i] ]);
    }

    return zipper;
}

// [ a, b, ... ] => [ { index: 0, element: a }, { index: 1, element: b }, ... ]
function iter_with_index(a, start = 0) {
    let iter = [];
    for (let i = 0; i < a.length; i++) {
        iter.push({ index: start + i, element: a[i] });
    }
    return iter;
}

// hello => { h: 1, e: 1, l: 2, o: 1 }
function get_letter_frequency(word) {
    return [...word].reduce((a, c) =>
        (a[c] = a[c] + 1 || 1) && a, {})
}

export { pprint, break_apart, zip, iter_with_index, get_letter_frequency };
