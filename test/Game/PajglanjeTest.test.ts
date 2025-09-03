import { Board } from '../../src/board/Board';
import { IBoard } from '../../src/board/IBoard';

describe("Board Test", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="board"></div>';
    });

    test("Board Test", () => {
        const x = 5;
        const y = 6;
        let board: IBoard = new Board(x,y);
        expect(board.CreateBoardElement).toThrow();

        let boardElement = document.createElement('div');
        boardElement.id = 'board';
        expect(() => board.CreateBoardElement()).not.toThrow();

        const squareElements = document.querySelectorAll('.square');
        expect(squareElements).not.toBe(null);
        expect(squareElements).toHaveLength(x * y);
    });


})