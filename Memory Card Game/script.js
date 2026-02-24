const board=document.getElementById("board");
const emojis=["🔥","🚀","🎮","💎","⚡","🌟","🎵","🧠","👑","🐍","🍕","🎲","🍔","🐶","🏆","🎯","🌈","🦄"];

let cards=[],flipped=[],moves=0,timer=0,interval;
let player=1,score1=0,score2=0,multiplayer=false,paused=false;
let combo=0;

document.getElementById("restart").onclick=startGame;
document.getElementById("theme").onclick=()=>document.body.classList.toggle("light");
document.getElementById("multi").onclick=()=>multiplayer=!multiplayer;
document.getElementById("pause").onclick=()=>paused=!paused;
document.getElementById("shuffle").onclick=shuffleBoard;
document.getElementById("power").onclick=powerReveal;
document.getElementById("difficulty").onchange=startGame;

function startGame(){
clearInterval(interval);
board.innerHTML="";

moves=0;
timer=0;
combo=0;
score1=0;
score2=0;
player=1;
paused=false;
flipped=[];

document.getElementById("winScreen").style.display="none";
updateUI();

let level=document.getElementById("difficulty").value;
let pairs=level==="easy"?6:
          level==="medium"?8:
          level==="pro"?12:18;

let cols=Math.ceil(Math.sqrt(pairs*2));
board.style.gridTemplateColumns="repeat("+cols+",1fr)";

cards=[...emojis.slice(0,pairs),...emojis.slice(0,pairs)];
cards.sort(()=>0.5-Math.random());

cards.forEach(e=>{
let card=document.createElement("div");
card.className="card";
card.innerHTML=`
<div class="card-inner">
<div class="front">${e}</div>
<div class="back">?</div>
</div>`;
card.onclick=()=>flip(card,e);
board.appendChild(card);
});

interval=setInterval(()=>{
if(!paused){
timer++;
updateUI();
}
},1000);
}

function flip(card,e){
if(paused||card.classList.contains("flip")||flipped.length===2) return;

card.classList.add("flip");
flipped.push({card,e});
playSound("click");

if(flipped.length===2){
moves++;
updateUI();
setTimeout(check,600);
}
}

function check(){
let [a,b]=flipped;

if(a.e===b.e){
combo++;
playSound("match");
if(multiplayer){
if(player===1) score1++; else score2++;
}
confetti({particleCount:50,spread:70});
} else {
combo=0;
playSound("wrong");
a.card.classList.remove("flip");
b.card.classList.remove("flip");
if(multiplayer) player=player===1?2:1;
}

flipped=[];
updateUI();

if(document.querySelectorAll(".flip").length===cards.length){
win();
}
}

function win(){
clearInterval(interval);
playSound("win");
document.getElementById("winner").innerText=
multiplayer?
(score1>score2?"Player 1 Wins!":
score2>score1?"Player 2 Wins!":"Draw!")
:"You Win!";
document.getElementById("winScreen").style.display="flex";
}

function updateUI(){
document.getElementById("moves").innerText=moves;
document.getElementById("time").innerText=timer;
document.getElementById("combo").innerText=combo;
document.getElementById("turn").innerText="Player "+player;
document.getElementById("score1").innerText=score1;
document.getElementById("score2").innerText=score2;
}

function shuffleBoard(){
moves+=3;
updateUI();
let values=[...document.querySelectorAll(".front")].map(f=>f.textContent);
values.sort(()=>0.5-Math.random());
document.querySelectorAll(".front").forEach((f,i)=>{
f.textContent=values[i];
});
document.querySelectorAll(".card").forEach(c=>c.classList.remove("flip"));
}

function powerReveal(){
document.querySelectorAll(".card").forEach(c=>c.classList.add("flip"));
setTimeout(()=>{
document.querySelectorAll(".card").forEach(c=>{
if(!flipped.includes(c)) c.classList.remove("flip");
});
},3000);
}

function playSound(type){
let ctx=new(window.AudioContext||window.webkitAudioContext)();
let osc=ctx.createOscillator();
let gain=ctx.createGain();
osc.connect(gain);
gain.connect(ctx.destination);
gain.gain.value=0.1;

if(type==="click") osc.frequency.value=600;
if(type==="match") osc.frequency.value=900;
if(type==="wrong") osc.frequency.value=200;
if(type==="win") osc.frequency.value=1200;

osc.start();
osc.stop(ctx.currentTime+0.2);
}

startGame();
