<script>
const setupPage = document.getElementById('setupPage');
const scorePage = document.getElementById('scorePage');
const endPage = document.getElementById('endPage');

const playersInputsDiv = document.getElementById('playersInputs');
const addPlayerBtn = document.getElementById('addPlayer');
const startGameBtn = document.getElementById('startGame');
const scoreTable = document.getElementById('scoreTable');
const endGameBtn = document.getElementById('endGame');
const resetGameBtn = document.getElementById('resetGame');
const backToSetupBtn = document.getElementById('backToSetup');
const goldWinnerP = document.getElementById('goldWinner');
const ecoWinnerP = document.getElementById('ecoWinner');
const roundNumberSpan = document.getElementById('roundNumber');
const nextRoundBtn = document.getElementById('nextRound');
const boostX2Btn = document.getElementById('boostX2');
const boostX3Btn = document.getElementById('boostX3');
const boostModal = document.getElementById('boostModal');
const boostType = document.getElementById('boostType');
const boostQuestion = document.getElementById('boostQuestion');
const closeModalBtn = document.getElementById('closeModal');
const roundHistoryDiv = document.getElementById('roundHistory');

let players = [];
let currentRound = 0;
let history = {};

const questionsX2 = [
  {
    text: "Quelle action est la plus écologique ?",
    answers: [
      { text: "Prendre l’avion", correct: false },
      { text: "Prendre le vélo", correct: true },
      { text: "Utiliser un générateur diesel", correct: false },
      { text: "Brûler des déchets", correct: false }
    ]
  },
  {
    text: "Quel matériau est le plus recyclable ?",
    answers: [
      {text:"Verre", correct:true},
      {text:"Plastique", correct:false},
      {text:"Carton souillé", correct:false}
    ]
  }
];

const questionsX3 = [
  {
    text: "Quel geste réduit le plus la pollution ?",
    answers: [
      {text:"Éteindre les lumières inutiles", correct:true},
      {text:"Jeter au sol", correct:false},
      {text:"Brûler du plastique", correct:false}
    ]
  },
  {
    text: "Quelle ressource est renouvelable ?",
    answers: [
      {text:"Énergie solaire", correct:true},
      {text:"Pétrole", correct:false},
      {text:"Charbon", correct:false}
    ]
  }
];


function renderSetupInputs() {
  playersInputsDiv.innerHTML = '';
  players.forEach((p, i) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = p.name || '';
    input.placeholder = `Nom du joueur ${i+1}`;
    input.className = 'w-full p-2 border rounded';
    input.oninput = e => players[i].name = e.target.value;
    playersInputsDiv.appendChild(input);
  });
}

addPlayerBtn.onclick = () => {
  players.push({name:'', gold:50, pollution:0});
  renderSetupInputs();
}

startGameBtn.onclick = () => {
  if(players.length < 3) return alert('You need at least 3 players!');
  currentRound = 0;
  history = {};
  players.forEach((p,i)=>{
    p.gold = 50;
    p.pollution = 0;
    history[i] = [{round:0, gold:50, pollution:0}];
  });
  setupPage.classList.add('hidden');
  scorePage.classList.remove('hidden');
  renderScoreboard();
  renderRoundHistory();
}

function renderScoreboard(){
  roundNumberSpan.textContent = currentRound;
  scoreTable.innerHTML = '';
  players.forEach((p,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-2 py-1">${p.name}</td>
      <td class="border px-2 py-1">
        <input type="number" id="gold-${i}" value="${p.gold}" class="w-16 p-1 border rounded text-center text-xs sm:text-sm"/>
      </td>
      <td class="border px-2 py-1">
        <input type="number" id="pollution-${i}" value="${p.pollution}" class="w-16 p-1 border rounded text-center text-xs sm:text-sm"/>
      </td>
    `;
    scoreTable.appendChild(tr);
  });
}

function renderRoundHistory(){
  roundHistoryDiv.innerHTML='';
  for(let r=0;r<=currentRound;r++){
    let line = `Round ${r}: `;
    line += players.map((p,i)=>{
      const entry = history[i][r];
      if(!entry) return '';
      if(r===0) return `${p.name} ${entry.gold}/${entry.pollution}`;
      const prev = history[i][r-1];
      const goldColor = entry.gold>prev.gold?'text-green-600':entry.gold<prev.gold?'text-red-600':'';
      const polColor = entry.pollution>prev.pollution?'text-red-600':entry.pollution<prev.pollution?'text-green-600':'';
      return `<span>${p.name} <span class="${goldColor}">${entry.gold}</span>/<span class="${polColor}">${entry.pollution}</span></span>`;
    }).join(', ');
    const p = document.createElement('div');
    p.innerHTML = line;
    roundHistoryDiv.appendChild(p);
  }
}

nextRoundBtn.onclick = () => {
  players.forEach((p,i)=>{
    const goldInput = document.getElementById(`gold-${i}`);
    const polInput = document.getElementById(`pollution-${i}`);
    if(goldInput)p.gold=parseInt(goldInput.value)||0;
    if(polInput)p.pollution=parseInt(polInput.value)||0;
    history[i].push({round:currentRound+1, gold:p.gold, pollution:p.pollution});
  });
  currentRound++;
  renderScoreboard();
  renderRoundHistory();
}

endGameBtn.onclick = () => {
  players.forEach((p,i)=>{
    const goldInput = document.getElementById(`gold-${i}`);
    const polInput = document.getElementById(`pollution-${i}`);
    if(goldInput)p.gold=parseInt(goldInput.value)||0;
    if(polInput)p.pollution=parseInt(polInput.value)||0;
    history[i].push({round:currentRound, gold:p.gold, pollution:p.pollution});
  });

  scorePage.classList.add('hidden');
  endPage.classList.remove('hidden');

  const maxGold = Math.max(...players.map(p=>p.gold));
  const goldWinners = players.filter(p=>p.gold===maxGold).map(p=>p.name).join(', ');

  const ecoScores = players.map(p=>({name:p.name, score:p.gold-Math.abs(p.pollution)}));
  const maxEcoScore = Math.max(...ecoScores.map(e=>e.score));
  const ecoWinners = ecoScores.filter(e=>e.score===maxEcoScore).map(e=>e.name).join(', ');

  goldWinnerP.textContent = `🥇 Gold Winner: ${goldWinners} (${maxGold} gold)`;
  ecoWinnerP.textContent = `🌱 Eco Winner: ${ecoWinners} (score: ${maxEcoScore})`;

  drawChart();
}

function drawChart() {
  drawSingleChart('goldChart', 'gold');
  drawSingleChart('pollutionChart', 'pollution');
}

function drawSingleChart(canvasId, type) {
  const canvas = document.getElementById(canvasId);
  const container = canvas.parentElement;

  canvas.width = container.clientWidth;
  canvas.height = canvas.width * 0.5;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const padding = 40;
  const graphWidth = canvas.width - 2*padding;
  const graphHeight = canvas.height - 2*padding;

  let maxVal=-Infinity, minVal=Infinity, maxRound=0;
  Object.values(history).forEach(ph => {
    ph.forEach(e => {
      const val = type==='gold'? e.gold : e.pollution;
      maxVal = Math.max(maxVal, val);
      minVal = Math.min(minVal, val);
      maxRound = Math.max(maxRound, e.round);
    });
  });
  const yRange = Math.max(maxVal - minVal,1);
  const yMin = minVal;

  // Axes
  ctx.strokeStyle='#333';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(padding,padding);
  ctx.lineTo(padding,canvas.height-padding);
  ctx.lineTo(canvas.width-padding,canvas.height-padding);
  ctx.stroke();

  // Labels
  ctx.fillStyle='#333';
  ctx.font='12px sans-serif';
  ctx.fillText('Rounds',canvas.width/2-20,canvas.height-10);
  ctx.save();
  ctx.translate(10,canvas.height/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText('Value',0,0);
  ctx.restore();

  // Grille
  ctx.strokeStyle='#ddd';
  ctx.lineWidth=1;
  for(let i=0;i<=5;i++){
    const y = padding + (i/5)*graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding,y);
    ctx.lineTo(canvas.width-padding,y);
    ctx.stroke();
    const val = Math.round(maxVal-(i/5)*yRange);
    ctx.fillStyle='#666';
    ctx.fillText(val.toString(), padding-30, y+4);
  }

  const colors=['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899'];

  players.forEach((p,i)=>{
    const ph = history[i]||[];
    if(ph.length===0) return;

    ctx.strokeStyle = colors[i%colors.length];
    ctx.fillStyle = colors[i%colors.length];
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ph.forEach((e,idx)=>{
      const val = type==='gold'? e.gold : e.pollution;
      const x = padding + (e.round/maxRound)*graphWidth;
      const y = canvas.height-padding - ((val-yMin)/yRange)*graphHeight;
      if(idx===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();

    // Points
    ph.forEach(e=>{
      const val = type==='gold'? e.gold : e.pollution;
      const x = padding + (e.round/maxRound)*graphWidth;
      const y = canvas.height-padding - ((val-yMin)/yRange)*graphHeight;
      ctx.beginPath();
      ctx.arc(x,y,3,0,2*Math.PI);
      ctx.fill();
    });
  });
}


resetGameBtn.onclick=()=>{
  players=[];
  currentRound=0;
  history={};
  renderSetupInputs();
  scorePage.classList.add('hidden');
  setupPage.classList.remove('hidden');
}

backToSetupBtn.onclick=()=>location.reload();
function openBoostModal(boostValue, questionSet) {
    const q = questionSet[Math.floor(Math.random() * questionSet.length)];

    boostType.textContent = boostValue;
    boostQuestion.textContent = q.text;

    const choicesDiv = document.getElementById("boostChoices");
    choicesDiv.innerHTML = "";

    q.answers.forEach((answer) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn border w-full p-3 rounded-[20px] bg-white/10 text-white font-semibold hover:bg-white/20";
        btn.textContent = answer.text;

        btn.onclick = () => {
            // Bloquer tous les boutons
            document.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);

            if (answer.correct) {
                btn.classList.add("choice-correct");
            } else {
                btn.classList.add("choice-wrong");
            }
        };

        choicesDiv.appendChild(btn);
    });

    // Affiche la modale
    boostModal.classList.remove("hidden");
}

// Fermer modale
closeModalBtn.onclick = () => {
    boostModal.classList.add("hidden");
    document.getElementById("boostChoices").innerHTML = "";
};
  const q = questionSet[Math.floor(Math.random() * questionSet.length)];

  boostType.textContent = boostValue;
  boostQuestion.textContent = q.text;

  const choicesDiv = document.getElementById("boostChoices");
  choicesDiv.innerHTML = "";

  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn border";
    btn.textContent = answer.text;

    btn.onclick = () => {
      // Lock all buttons
      document.querySelectorAll(".choice-btn").forEach(b => b.classList.add("choice-disabled"));

      if (answer.correct) {
        btn.classList.add("choice-correct");
      } else {
        btn.classList.add("choice-wrong");
      }
    };

    choicesDiv.appendChild(btn);
  });

  boostModal.classList.remove("hidden");
}

boostX2Btn.onclick = () => openBoostModal("X2", questionsX2);
boostX3Btn.onclick = () => openBoostModal("X3", questionsX3);
closeModalBtn.onclick = () => {
    boostModal.classList.add("hidden");
    // Reset choices so next question works properly
    document.getElementById("boostChoices").innerHTML = "";
};


renderSetupInputs();
boostModal.classList.add("hidden");
</script>