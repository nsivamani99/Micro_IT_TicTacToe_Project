const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');
const playerScoreText = document.getElementById('playerScore');
const aiScoreText = document.getElementById('aiScore');

let options = Array(9).fill("");
let currentPlayer = "X";
let running = false;
let playerScore = 0;
let aiScore = 0;
let lastLoser = "O"; 

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
window.addEventListener('DOMContentLoaded', () => {
  startGame();
});
function startGame() {
  cells.forEach(cell => {
    cell.textContent = "";
    cell.addEventListener("click", cellClicked);
  });
  restartBtn.addEventListener("click", restartGame);
  options = Array(9).fill("");
  currentPlayer = "X";
  statusText.textContent = `Your Turn`;
  running = true;
}
function cellClicked() {
  const index = this.getAttribute("data-index");
  if (options[index] !== "" || !running) return;
  playMove(index, "X");
  if (running) setTimeout(() => aiMove(), 750);
}
function playMove(index, player) {
  options[index] = player;
  const cell = document.querySelector(`.cell[data-index="${index}"]`);
  cell.textContent = player;
  if (checkWinner(player)) {
  statusText.textContent = player === "X" ? "You Win!" : "AI Wins!";
  updateScore(player);
  lastLoser = player === "X" ? "O" : "X"; // Loser starts next
  running = false;
} else if (!options.includes("")) {
    statusText.textContent = "Draw!";
    running = false;
  } else {
    currentPlayer = player === "X" ? "O" : "X";
    statusText.textContent = currentPlayer === "X" ? "Your Turn" : "AI Turn";
  }
}
function aiMove() {
  const mode = difficultySelect.value;
  let index;
  if (mode === "easy") {
    index = randomMove();
  } else if (mode === "medium") {
    index = mediumAI();
  } else {
    index = hardAI();
  }
  if (index !== -1) playMove(index, "O");
}
function randomMove() {
  const empty = options.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}
function mediumAI() {
  return findBestMove(["O", "X"]) ?? randomMove();
}
function hardAI() {
  return minimax(options, "O").index;
}
function findBestMove([self, opponent]) {
  for (let i = 0; i < 9; i++) {
    if (options[i] === "") {
      options[i] = self;
      if (checkWinner(self)) { options[i] = ""; return i; }
      options[i] = "";
    }
  }
  for (let i = 0; i < 9; i++) {
    if (options[i] === "") {
      options[i] = opponent;
      if (checkWinner(opponent)) { options[i] = ""; return i; }
      options[i] = "";
    }
  }
  return null;
}
function checkWinner(player) {
  return winConditions.some(combo =>
    combo.every(i => options[i] === player)
  );
}
function updateScore(winner) {
  if (winner === "X") {
    playerScore++;
    playerScoreText.textContent = playerScore;
  } else if (winner === "O") {
    aiScore++;
    aiScoreText.textContent = aiScore;
  }
}
function restartGame() {
  options = Array(9).fill("");
  cells.forEach(cell => cell.textContent = "");
  currentPlayer = lastLoser;
  statusText.textContent = currentPlayer === "X" ? "Your Turn" : "AI Turn";
  running = true;
  if (currentPlayer === "O") {
    setTimeout(() => aiMove(), 300); 
  }
}
function minimax(board, player) {
  const emptySpots = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  const opponent = player === "O" ? "X" : "O";
  if (checkWinner("X")) return { score: -1 };
  if (checkWinner("O")) return { score: 1 };
  if (emptySpots.length === 0) return { score: 0 };
  const moves = [];
  for (let i of emptySpots) {
    board[i] = player;
    let result = minimax(board, opponent);
    moves.push({ index: i, score: result.score });
    board[i] = "";
  }
  return player === "O"
    ? moves.reduce((best, m) => m.score > best.score ? m : best)
    : moves.reduce((best, m) => m.score < best.score ? m : best);
}