const boardEl = document.getElementById('board');
const status = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const aiBtn = document.getElementById('ai-move');
const pointsFirstEl = document.getElementById('points-first');
const pointsSecondEl = document.getElementById('points-second');
let board = Array(9).fill('');
let turn = 'X';

// Weights for each cell (0..8). Adjust values to prioritize cells.
// Layout indices:
// 0 1 2
// 3 4 5
// 6 7 8

// const weights = [2,1,2,1,3,1,2,1,2];
const weights = Array(9);
for(let i=0;i<9;i++){
  weights[i] = Math.floor( (Math.random()-0.5) * 100 );
}
// computePoints returns total weights for X and O

function render(){
  boardEl.innerHTML = '';
  board.forEach((v,i)=>{
    const c = document.createElement('div');
    c.className='cell';
    c.innerHTML = (v? v : '') + `<div class="weight">${weights[i]}</div>`;
    c.onclick = ()=>{ if(!board[i] && !winner()){ board[i]=turn; turn = turn==='X'?'O':'X'; update(); }};
    boardEl.appendChild(c);
  });

    const w = winner();
    if (w) {
      if (w === 'draw') {
        const points = computePoints();
        if (points.X > points.O) {
          status.textContent = `X の勝ち (ポイント)`;
        } else if (points.O > points.X) {
          status.textContent = `O の勝ち (ポイント)`;
        } else {
          status.textContent = `完全な引き分け`;
        }
      } else {
        status.textContent = `${w} の勝ち`;
      }
    } else {
      status.textContent = `${turn} の手番`;
    }

  const pts = computePoints();
  if(pointsFirstEl) pointsFirstEl.textContent = `first = ${pts.X}`;
  if(pointsSecondEl) pointsSecondEl.textContent = `second = ${pts.O}`;
}

function lines(){
  return [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
}

function winner(){
  for(const [a,b,c] of lines()){
    if(board[a] && board[a]===board[b] && board[b]===board[c]) return board[a];
  }
  if(board.every(x=>x)) return 'draw';
  return null;
}

function computePoints() {
  const points = { X: 0, O: 0 };
  board.forEach((cell, i) => {
    if (!cell) return;
    if (cell === 'X') points.X += weights[i];
    if (cell === 'O') points.O += weights[i];
  });
  return points;
}

function update(){ render(); }

resetBtn.onclick = ()=>{ 
  board = Array(9).fill(''); 
  turn='X';
  for(let i=0;i<9;i++){
    weights[i] = Math.floor( (Math.random()-0.5) * 100 );
  } 
  update(); 
};

// Simple AI: pick the empty cell with highest weight
function bestWeightedMove(){
  let best = -1; let bestW = -Infinity;
  for(let i=0;i<9;i++){
    if(!board[i] && weights[i]>bestW){ best = i; bestW = weights[i]; }
  }
  return best;
}

if(aiBtn){
  aiBtn.onclick = ()=>{
    const idx = bestWeightedMove();
    if(idx>=0 && !winner()){ board[idx]=turn; turn = turn==='X'?'O':'X'; update(); }
  };
}

render();
