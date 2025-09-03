import Rand from 'rand-seed'

export class UniqueRandom
{
    private m_Generator: any;
    private m_UsedIndices: Set<number> = new Set();

    constructor(seed?: string, usedIndices?: number[])
    {
        this.m_Generator = new Rand(seed);

        if (usedIndices !== null && usedIndices !== undefined && usedIndices.length > 0)
        {
            for (let index of usedIndices)
            {
                this.m_UsedIndices.add(index);
            }
        }
    }

    public GetUnique(max: number): number {
        let randomIndex: number;
        do {
            randomIndex = Math.floor(this.m_Generator.next() * max);
        } while (this.m_UsedIndices.has(randomIndex));

        this.m_UsedIndices.add(randomIndex);

        return randomIndex;
    }

    public Reset()
    {
        this.m_UsedIndices.clear();
    }
}