import { BrzalicaGame } from "./game/BrzalicaGame"
import type { IGame } from "./game/IGame"

let gameInstance: IGame = new BrzalicaGame();

document.addEventListener('DOMContentLoaded', () => {
    gameInstance.Init();
    gameInstance.StartGame();
});