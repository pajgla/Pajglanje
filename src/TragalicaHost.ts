import {TragalicaGame} from "./game/TragalicaGame";


let gameInstance: TragalicaGame = new TragalicaGame();

document.addEventListener("DOMContentLoaded", () => {
    gameInstance.Init();
    gameInstance.StartGame();
});