const board = document.getElementById("board");
const statusText = document.getElementById("status");
const difficultySelect = document.getElementById("difficulty");

let gameState = Array(9).fill("");
let currentPlayer = "X";
let mode = "2player";
let gameActive = true;

let xScore = parseInt(localStorage.getItem("xScore")) || 0;
let oScore = parseInt(localStorage.getItem("oScore")) || 0;
let drawScore = parseInt(localStorage.getItem("drawScore")) || 0;

document.getElementById("xScore").textContent = xScore;
document.getElementById("oScore").textContent = oScore;
document.getElementById("drawScore").textContent = drawScore;

const winCombos = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
];

function createBoard() {
    board.innerHTML = "";
    gameState = Array(9).fill("");
    gameActive = true;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.addEventListener("click", () => makeMove(i));
        board.appendChild(cell);
    }
}
createBoard();

function makeMove(index) {
    if (!gameActive || gameState[index] !== "") return;

    gameState[index] = currentPlayer;
    board.children[index].textContent = currentPlayer;

    if (checkWinner()) return;

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = "Player " + currentPlayer + "'s Turn";

    if (mode === "ai" && currentPlayer === "O") {
        setTimeout(aiMove, 300);
    }
}

function aiMove() {
    let difficulty = difficultySelect.value;
    let move;

    if (difficulty === "easy") {
        move = randomMove();
    } else if (difficulty === "medium") {
        move = Math.random() < 0.5 ? randomMove() : bestMove();
    } else {
        move = bestMove();
    }

    makeMove(move);
}

function randomMove() {
    let empty = gameState.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
}

function bestMove() {
    return minimax([...gameState], "O").index;
}

function minimax(boardState, player) {
    let empty = boardState.map((v,i)=>v===""?i:null).filter(v=>v!==null);

    if (checkWin(boardState,"X")) return {score:-10};
    if (checkWin(boardState,"O")) return {score:10};
    if (empty.length === 0) return {score:0};

    let moves = [];

    for (let i of empty) {
        let move = {};
        move.index = i;
        boardState[i] = player;

        let result = minimax(boardState, player==="O"?"X":"O");
        move.score = result.score;

        boardState[i] = "";
        moves.push(move);
    }

    return player==="O"
        ? moves.reduce((a,b)=>a.score>b.score?a:b)
        : moves.reduce((a,b)=>a.score<b.score?a:b);
}

function checkWin(boardState, player) {
    return winCombos.some(combo =>
        combo.every(index => boardState[index] === player)
    );
}

function checkWinner() {
    for (let combo of winCombos) {
        if (combo.every(index => gameState[index] === currentPlayer)) {
            updateScore(currentPlayer);
            particle();
            gameActive = false;
            statusText.textContent = currentPlayer + " Wins!";
            return true;
        }
    }

    if (!gameState.includes("")) {
        updateScore("draw");
        statusText.textContent = "Draw!";
        gameActive = false;
        return true;
    }

    return false;
}

function updateScore(winner) {
    if (winner==="X") xScore++;
    else if (winner==="O") oScore++;
    else drawScore++;

    localStorage.setItem("xScore",xScore);
    localStorage.setItem("oScore",oScore);
    localStorage.setItem("drawScore",drawScore);

    document.getElementById("xScore").textContent = xScore;
    document.getElementById("oScore").textContent = oScore;
    document.getElementById("drawScore").textContent = drawScore;
}

function restartGame() {
    currentPlayer = "X";
    statusText.textContent = "Player X's Turn";
    createBoard();
}

function setMode(m) {
    mode = m;
    restartGame();
}

function changeTheme(theme) {
    document.body.className = theme;
}

function particle() {
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i=0;i<150;i++){
        ctx.fillStyle=`hsl(${Math.random()*360},100%,50%)`;
        ctx.fillRect(Math.random()*canvas.width,
                     Math.random()*canvas.height,4,4);
    }

    setTimeout(()=>{
        ctx.clearRect(0,0,canvas.width,canvas.height);
    },800);
}
