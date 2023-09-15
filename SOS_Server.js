const express = require('express');
const app = express();
const port = 3000;

// Serve static files (HTML, CSS, etc.) from a "public" folder
app.use(express.static('public'));

// Initialize game state
let gameState = {
  board: [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']],
  gameOngoing: false,
  turnCount: 0,
};


//Points of both players
let players = {
    playerOnePoints: 0,
    playerOneChoice: 'S',
    playerTwoPoints: 0,
    playerTwoChoice: 'O'
};

// Function to check if a player has won
function checkWin(player) {
  // Implement your win-checking logic here
}

app.post('start-game', (req, res) => {
    gameState.gameOngoing = true;
    res.status(200);
})

app.post('choose-symbol', (req, res) => {
    if (req.choice != 0){
        players.playerOneChoice = 'O';
        players.playerTwoChoice = 'S';
    }
    res.status(200)
})

// Handle player moves
app.post('/make-move', (req, res) => {
  if (gameState.gameOver) {
    res.status(400).json({ message: 'Game over. Start a new game.' });
    return;
  }

  const { x, y, player } = req.query;

  // Validate player and move
  if (player !== gameState.currentPlayer ||
      x < 0 || x > 2 || y < 0 || y > 2 ||
      gameState.board[x][y] !== '') {
    res.status(400).json({ message: 'Invalid move.' });
    return;
  }

  // Update the game state
  gameState.board[x][y] = player;
  const won = checkWin(player);

  if (won) {
    gameState.gameOver = true;
    gameState.winner = player;
  } else {
    gameState.currentPlayer = player === 'S' ? 'O' : 'S';
  }

  res.status(200).json({ message: 'Move successful', gameState });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
