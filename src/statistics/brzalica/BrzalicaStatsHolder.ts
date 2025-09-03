export type BrzalicaStatsHolder = {
    gamesPlayed: number,
    totalWordsGuessed: number,
    averageAttemptsPerWord: number,
    totalAttempts: number,
    averageGuessedWordsPerGame: number,
    averageTimePerWord: number,
    totalTimeTaken: number,
    fastestSolve: number | null,
    bestGuessStreak: number | null,

    histogram: number[]
}