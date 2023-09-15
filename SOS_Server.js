const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Serve static files (HTML, CSS, etc.) from a "public" folder
app.use(bodyParser.json());
app.use(cors());

// Initialize game state
let gameState = {
  size: 3,
  board: [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']],
  gameOngoing: false,
  turn: 1,
  playerOne: 0,
  playerTwo: 0,
};


function hasEnded(){
  let size = gameState.size;
  for(let i = 0; i < size; i ++){
    for(let j = 0; j < size; j ++){
      if (gameState.board[i][j] == '-') return false;
    }
  }
  return true;
}

function updatePoints(player, x, y){
  let t = 0;
  let size = gameState.size;
  let board = gameState.board;
  if(board[x][y] == 'O'){
    if ((x > 0 && x < size - 1) && (board[x-1][y] == 'S') && (board[x+1][y] == 'S')){
      t += 1
    }
    if ((y > 0 && y < size - 1) && board[x][y-1] == 'S' && board[x][y+1] == 'S'){
      t += 1
    }
    if ((x > 0 && x < size - 1) && (y > 0 && y < size - 1) && board[x-1][y-1] == 'S' && board[x+1][y+1] == 'S'){
      t += 1
    }
    if ((y > 0 && y < size - 1) && (x > 0 && x < size - 1) && board[x-1][y+1] == 'S' && board[x+1][y-1] == 'S'){
      t += 1
    }
  }
  else{
    if ((x > 1) && (board[x - 1][y] == 'O') && (board[x - 2][y] == 'S')) {
      t += 1
    }
    if ((y > 1) && board[x][y - 1] == 'O' && board[x][y - 2] == 'S') {
      t += 1
    }
    if ((x > 1 && y > 1) && board[x - 1][y - 1] == 'O' && board[x - 2][y - 2] == 'S') {
      t += 1
    }
    if ((x > 1 && y < size - 2) && board[x - 1][y + 1] == 'O' && board[x - 2][y + 2] == 'S') {
      t += 1
    }
    if ((x < size - 2) && (board[x + 1][y] == 'O') && (board[x + 2][y] == 'S')) {
      t += 1
    }
    if ((y < size - 2) && board[x][y + 1] == 'O' && board[x][y + 2] == 'S') {
      t += 1
    }
    if ((x < size - 2 && y < size - 2) && board[x + 1][y + 1] == 'O' && board[x + 2][y + 2] == 'S') {
      t += 1
    }
    if ((x < size - 2 && y > 1) && board[x + 1][y - 1] == 'O' && board[x + 2][y - 2] == 'S') {
      t += 1
    }
  }
  if (player == 1) {gameState.playerOne += t}
  else { gameState.playerTwo += t;}
  return;
}

app.get('/', (req, res) => {
  res.status(200).json({gameState: gameState});
})

app.post('/start-game', (req, res) => {
    let size = req.body.size;
    if(size<3 || !size){
      res.status(404).json({"Message":"Invalid input"})
      return
    }
    gameState.size = size
    gameState.board = Array.from({ length: req.body.size }, () =>
    Array.from({ length: req.body.size }, () => '-')
  )
    gameState.gameOngoing = true;
    res.status(200).json({gameState: gameState});
})


// Handle player moves
app.post('/make-move', (req, res) => {

  if (!gameState.gameOngoing) {
    res.status(400).json({ message: 'Start a new game first!' });
    return;
  }

  const { x, y, option } = req.body;
  let size = gameState.size
  // Validate player and move
  if (x < 0 || x > size || y < 0 || y > size ||
      gameState.board[x][y] !== '-' || (option != 'S' && option != 'O')) {
    res.status(400).json({ message: 'Invalid move!' });
    return;
  }

  // Update the game state
  gameState.board[x][y] = option;

  if (gameState.turn == 1){
    temp = gameState.playerOne;
    updatePoints(1, x, y);
  }
  else{
    temp = gameState.playerTwo;
    updatePoints(2, x, y);
  }



  if (hasEnded()) {
    gameState.gameOngoing = false;
    if (gameState.playerOne == gameState.playerTwo){
      res.status(200).json({message: "It's a draw!", gameState: gameState});
      return;
    }
    else {
      let winner = gameState.playerOne > gameState.playerTwo ? "Player 1":"Player 2";
      res.status(200).json({message: `${winner} has won`, gameState: gameState});
      return;
    }
  } 

  else {
    if(gameState.turn == 1 && temp != gameState.playerOne){
      res.status(200).json({message: `Player 1 gains ${gameState.playerOne-temp} points and gets another chance!`, gameState: gameState})
      return;
    }
    if(gameState.turn == 2 && temp != gameState.playerTwo){
      res.status(200).json({message: `Player 2 gains ${gameState.playerTwo-temp} points and gets another chance!`, gameState: gameState})
      return;
    }
    else{
      if (gameState.turn == 1) {gameState.turn = 2;}
      else {gameState.turn = 1}
      let temp = gameState.turn
      res.status(200).json({message: `Player ${temp}'s chance!`, gameState: gameState});
      return;
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
