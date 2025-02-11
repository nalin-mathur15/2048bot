import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

const Game2048 = () => {
    const [board, setBoard] = useState(Array(4).fill(null).map(() => Array(4).fill(0)));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [paused, setPause] = useState(false);
    const [run, setRun] = useState(true);

    const boardinit = useCallback(() => {
        const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
        addNewTile(newBoard);
        addNewTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setPause(false);
        setRun(true);        
    }, []);

    const addNewTile = (gameBoard) => {
        const empty: number[][] = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (gameBoard[i][j] == 0) {
                    empty.push([i, j]);
                }
            }
        }

        if (empty.length > 0) {
            const [row, col] = empty[Math.floor(Math.random() * empty.length)];
            gameBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    
    };
    
    const moveTile = (direction, board) => { 
        let newBoard = JSON.parse(JSON.stringify(board));
        let moved = false;
        let newScore = score;

        const rotate = (b, times) => {
            let rotated = [...b];
            for (let i = 0; i < times; i++) {
                rotated = rotated[0].map((_, index) => 
                    rotated.map(row => row[index]).reverse()
                );
            }
            return rotated;
        };

        const moveLeft = (b) => {
            let moved = false;
            let score = 0;

            for (let i = 0; i < 4; i++) {
                let row = b[i].filter(cell => cell != 0);
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        score += row[j];
                        row.splice(j + 1, j);
                
                    }
                }
                let newrow = [...row, ...Array(4 - row.length).fill(0)];
                if (JSON.stringify(b[i]) !== JSON.stringify(newrow)) moved = true;
                b[i] = newrow;

            }
            return { moved, score };
        };

        switch (direction) {
            case 'left':
                ({ moved, score: newScore } = moveLeft(newBoard));
                break;
            case 'right':
                newBoard = rotate(newBoard, 2);
                ({ moved, score: newScore } = moveLeft(newBoard));
                newBoard = rotate(newBoard, 2);
                break;
            case 'up':
                newBoard = rotate(newBoard, 1);
                ({ moved, score: newScore } = moveLeft(newBoard));
                newBoard = rotate(newBoard, 3);
                break;
            case 'down':
                newBoard = rotate(newBoard, 3);
                ({ moved, score: newScore } = moveLeft(newBoard));
                newBoard = rotate(newBoard, 1);
                break;
        }

        if (moved) {
            addNewTile(newBoard);
            setBoard(newBoard);
            setScore(score + newScore);
        }

        return moved;
    };

    const checkGameOver = () => {
        for (let i = 0; i < 4; i++){
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) return false;
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (
                (i < 3 && board[i][j] === board[i + 1][j]) ||
                (j < 3 && board[i][j] === board[i][j + 1])
                ) {
                    return false;
                }
            }
        }
        return true;
    };

    const getMove = () => {
        const dirs = ['left', 'right', 'up', 'down'];
        let best = -Infinity;
        let bestMove = 'left';
        const depth = 4;

        for (const dir of dirs) {
            const boardCopy = JSON.parse(JSON.stringify(board));
            const moved = moveTile(dir, boardCopy);
            if (moved) {
                const score = lookAhead(boardCopy, depth, -Infinity, Infinity, false);
                if (score > best) {
                    best = score;
                    bestMove = dir;
                }
            }
        }
        return bestMove;
    };

    const evaluate = (b) => {
        let score = 0;
        const w = [
            [4.0, 3.0, 2.0, 1.0],
            [3.0, 2.0, 1.0, 0.5],
            [2.0, 1.0, 0.5, 0.25],
            [1.0, 0.5, 0.25, 0.1]
        ];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                score += b[i][j] * w[i][j];
            }
        }

        let monotonic = 0;
        for (let i = 0; i < 4; i++) {
            let rowDiff = 0;
            let colDiff = 0;
            for (let j = 0; j < 4; j++) {
                const rowDelta = Math.log2(b[i][j] + 1) - Math.log2(b[i][j + 1] + 1);
                rowDiff += rowDelta > 0 ? rowDelta : -rowDelta;

                const colDelta = Math.log2(b[i][j] + 1) - Math.log2(b[i + 1][j] + 1);
                colDiff += colDelta > 0 ? colDelta : -colDelta;
            }
            monotonic -= (rowDiff + colDiff);
        }
        score += monotonic * 100;

        const emptyCells = b.flat().filter(cell => cell === 0).length;
        score += emptyCells * 200;

        let scatter = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (b[i][j] !== 0) {
                    const val = Math.log2(b[i][j]);
                    if (i > 0 && b[i - 1][j] !== 0) {
                        scatter -= Math.abs(val - Math.log2(b[i - 1][j]));
                    }
                    if (j > 0 && b[i][j - 1] !== 0) {
                        scatter -= Math.abs(val - Math.log2(b[i][j - 1]));
                    }
                }
            }
        }
        score += scatter * 50;
        
        return score;

    };

    const lookAhead = (board, depth, alpha, beta, maximising) => {
        if (depth === 0) return evaluate(board);
    
        if (maximising) {
            let maxScore = -Infinity;
            const directions = ['up', 'right', 'down', 'left'];
      
            for (const direction of directions) {
                const boardCopy = JSON.parse(JSON.stringify(board));
                if (moveTile(direction, boardCopy)) {
                    const score = lookAhead(boardCopy, depth - 1, alpha, beta, false);
                    maxScore = Math.max(maxScore, score);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            }
            return maxScore === -Infinity ? evaluate(board) : maxScore;
        } else {
            let minScore = Infinity;
            const emptyCells = [];
      
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (board[i][j] === 0) emptyCells.push([i, j]);
                }
            }
      
            for (const [i, j] of emptyCells) {
                for (const value of [2, 4]) {
                    const boardCopy = JSON.parse(JSON.stringify(board));
                    boardCopy[i][j] = value;
                    const score = lookAhead(boardCopy, depth - 1, alpha, beta, true);
                    minScore = Math.min(minScore, score);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
            return minScore === Infinity ? evaluate(board) : minScore;
        }
    };


    useEffect(() => {
        if (!gameOver && run && !paused) {
            const timer = setTimeout(() => {
                const move = getMove();
                moveTile(move, board);
                if (checkGameOver()) {
                    setGameOver(true);
                    setRun(false);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [board, gameOver, run, paused]);

    useEffect(() => {
        boardinit();
    }, [boardinit]);

    const getTileColour = (val) => {
        const clrs = {
            2: 'bg-gray-200',
            4: 'bg-gray-300',
            8: 'bg-orange-200',
            16: 'bg-orange-300',
            32: 'bg-orange-400',
            64: 'bg-orange-500',
            128: 'bg-yellow-200',
            256: 'bg-yellow-300',
            512: 'bg-yellow-400',
            1024: 'bg-yellow-500',
            2048: 'bg-yellow-600'
        };
        return clrs[val] || 'bg-yellow-700';
    };

    return(
        <div className="flex flex-col items-center gap-4 p-8 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="text-3xl font-bold mb-6 text-gray-800"> 2048 AI Player</div>
            
            <div className="flex gap-4 mb-6">
                <Button
                    onClick={() => setRun(false)}
                    disabled={!run || gameOver}
                    className="bg-red-500 hover:bg-red-600 transition-colors duration-200"
                > Stop </Button>
                <Button
                    onClick={() => setPause(!paused)}
                    disabled={!run || gameOver}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                > {paused ? 'Resume' : 'Pause'} </Button>
                <Button
                    onClick={boardinit}
                    className="bg-green-500 hover:bg-green-600 transition-colors duration-200"
                > Restart </Button>
            </div>

            <div className="text-xl font-bold mb-6 text-gray-700">Score: {score}</div>

            <Card className="p-6 bg-white shadow-lg rounded-xl">
                <div className="grid grid-cols-4 gap-3">
                    {board.map((row, i) => 
                        row.map((cell, j) => (
                        <div
                            key = {'${i}-${j}'}
                            className={`w-20 h-20 flex items-center justify-center text-2xl font-bold rounded-lg transform transition-all duration-200 ease-in-out
                            ${cell ? getTileColour(cell) : 'bg-gray-200'} 
                            ${cell ? 'scale-100' : 'scale-95'}
                            `}
                        >
                            {cell || ''}
                        </div>
                        ))
                    )}
                </div>
            </Card>

            {gameOver && (
                <div className="text-2xl font-bold text-red-500 mt-6 animate-bounce">
                    Game Over! Final Score: {score}
                </div>
            )}  
        </div>
    );
};

export default Game2048;