import {break_apart, get_letter_frequency, iter_with_index, zip} from './funk_pack.js';

export const Digraphs = [
    { input: [ 'd', 'ž' ], output: 'џ' },
    { input: [ 'l', 'j' ], output: 'љ' },
    { input: [ 'n', 'j' ], output: 'њ' },
];

export function consolidate_digraphs(word, digraphs_to_use = Digraphs) {
    let match_digraphs = function(letters, predicate) {
        return letters.reduce((all, e_) => {
            let e = `${e_}`.toLowerCase();
            let last = all.slice(-1)[0];
            let change_happened = false;
            if (last !== undefined) {
                if (last === predicate.input[0] && e === predicate.input[1]) {
                    all.pop();
                    all.push(predicate.output);
                    change_happened = true;
                }
            }

            if (!change_happened) {
                all.push(e);
            }
            return all
        }, [])
    }

    let letters = break_apart(word);
    for (let predicate of digraphs_to_use) {
        letters = match_digraphs(letters, predicate)
    }
    return letters.join('');
}

export class LetterStatus {
    static Gray = new LetterStatus(0)
    static Yellow = new LetterStatus(1)
    static Green = new LetterStatus(2)

    constructor(value) {
        this.value = value;
    }

    toString() {
        switch(this.value) {
            case 0: return "Gray";
            case 1: return "Yellow";
            case 2: return "Green";
            default: console.error(`No Letter Status with value ${this.value}`);
        }
    }
}

export function valueToLetterStatus(value) {
    switch (value) {
        case 0: return LetterStatus.Gray;
        case 1: return LetterStatus.Yellow;
        case 2: return LetterStatus.Green;
        default:
            console.error(`Cannot create letter status from value ${value}`);
            break;
    }
}

export function match_words(input_, guess_) {
    let input = consolidate_digraphs(input_);
    let guess = consolidate_digraphs(guess_);

    let letter_freq_input = get_letter_frequency(input)
    let zipped = zip(input, iter_with_index(guess))

    let map_letter_diff = zipped.map((e) => {
        let left_value = e[0].charCodeAt(0);
        let right_value = e[1].element.charCodeAt(0);
        e.value = Math.abs(left_value - right_value);
        return e;
    })

    let sorted = map_letter_diff.sort((a, b) => { return a.value - b.value; })

    let comparator = sorted.map(e => { return { index: e[1].index, pair: [ e[0], e[1].element ] } })

    let folded = comparator.reduce((acc, current) => {
        let state = LetterStatus.Gray;
        if (letter_freq_input[current.pair[1]] > 0) {
            letter_freq_input[current.pair[1]]--;
            state = (current.pair[0] === current.pair[1]) ? LetterStatus.Green : LetterStatus.Yellow;
        }

        let colored_line = { index: current.index, state: state };
        acc.push(colored_line);
        return acc
    }, []);

    let resort_by_index = folded.sort((a, b) => { return a.index - b.index; });
    let word_match = resort_by_index.map(e => { return e.state });
    let success = (() => {
        let set = new Set(word_match);
        return set.has(LetterStatus.Green) && set.size === 1;
    })();

    return [ success, zip(guess, word_match) ];
}
