# 2048 AI Player

This project implements an AI that automatically plays the 2048 game, aiming to achieve the highest possible score.  It's built using React, TypeScript, and Vite.

## Introduction

This project provides a web-based implementation of the 2048 game, enhanced with an AI player. The AI intelligently makes moves to try and maximise the score.  You can watch the AI play the game automatically.

You can view the game [here](https://nalin-mathur15.github.io/2048bot/)

## How to Run

1. **Clone the repository:**

   ```bash
   git clone https://github.com/nalin-mathur15/2048bot.git
   ```
2. **Navigate to project directory:**
    ```bash
    cd <project-directory>
    ```
3. **Install dependencies:**
    ```bash
    npm install #or yarn
    ```
4. **Start the development server:**
    ```bash
    npm run dev #or yarn dev
    ```
The game should open automatically in your default browser. If not, you can manually view it at ```http://localhost:5173```

## Technologies Used
- React
- TypeScript
- Vite
- TailwindCSS
- PostCSS

## AI Algorithm
This AI uses a Minimax algorithm with alpha-beta pruning to determine the best move. It evaluates the game state based on factors such as the number of empty tiles, the scatteredness of tiles (difference between adjacent tiles and whether large tiles are far apart or grouped together), and the potential for merging tiles.

## Future Prospects
- Implement a more advanced algorithm (such as Expectimax)
- Add a user interface to control difficulty/speed.

## License
This project licensed under the MIT License.
