export class GameTimeHelpers {
    public static GetGameTime(gameStartDate: Date, hoursBetweenGames: number): number {
        const currentDate = new Date();
        const dateDifference = currentDate.getTime() - gameStartDate.getTime();
        let hourDiff = Math.floor(dateDifference / (1000 * 60 * 60));
        return Math.floor(hourDiff / hoursBetweenGames);
    }
}