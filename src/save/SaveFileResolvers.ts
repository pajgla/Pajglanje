import { EGameState } from "../game/enums/EGameState";

type OldHisogram = {
    1: number,
    2: number,
    3: number,
    4: number,
    5: number,
    6: number
}

export function ResolveGameState(oldState: string): EGameState //As stringified json
{
    switch (oldState)
    {
        case "active":
            return EGameState.InProgress;
        case "solved":
            return EGameState.Won;
        case "failed":
            return EGameState.Lost;
        default:
            throw new Error(`Unhandled old game state`);
    }
}

export function ResolveOldHistogram(oldHistogram: any): number[]
{
    let parsed = JSON.parse(JSON.stringify(oldHistogram)) as OldHisogram;
    let array = Array();
    array.push(parsed[1]);
    array.push(parsed[2]);
    array.push(parsed[3]);
    array.push(parsed[4]);
    array.push(parsed[5]);
    array.push(parsed[6]);

    return array;
}