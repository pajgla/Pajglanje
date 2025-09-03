import { PajglanjeGame } from './game/PajglanjeGame';
import type { IGame } from './game/IGame';
import { UserManager } from './managers/user/UserManager';

let gameInstance: IGame = new PajglanjeGame();
let userManager: UserManager = new UserManager();

document.addEventListener("DOMContentLoaded", () => {
    userManager.TryAutoLogin();
    
    gameInstance.Init();
    gameInstance.StartGame();
});