// ================= QUIZ ENGINE =================
let activeSet = [];
let idx = 0;
let userAnswers = [];
let shuffleOn = true;
let currentTopicLabel = "";

const pickerView = document.getElementById('pickerView');
const quizView = document.getElementById('quizView');
const topicPickGrid = document.getElementById('topicPickGrid');

const topics = [...new Set(QUESTIONS.map(q=>q.topic))];
const counts = {};
topics.forEach(t => counts[t] = QUESTIONS.filter(q=>q.topic===t).length);

topics.forEach(t=>{
  const btn = document.createElement('button');
  btn.className = 'topic-pick';
  btn.innerHTML = `<div class="tp-name">${t}</div><div class="tp-count">${counts[t]} questions</div>`;
  btn.addEventListener('click', ()=> startQuiz(t));
  topicPickGrid.appendChild(btn);
});

document.getElementById('shuffleToggle').addEventListener('click', function(){
  shuffleOn = !shuffleOn;
  this.textContent = shuffleOn ? '🔀 Shuffle: On' : '🔀 Shuffle: Off';
});
document.getElementById('startFullBtn').addEventListener('click', ()=> startQuiz('all'));
document.getElementById('backToPickerBtn').addEventListener('click', showPicker);
document.getElementById('backToPickerBtn2').addEventListener('click', showPicker);
document.getElementById('retryBtn').addEventListener('click', ()=> startQuiz(currentTopicLabel));

function shuffleArr(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function showPicker(){
  pickerView.style.display = 'block';
  quizView.style.display = 'none';
  window.scrollTo({top: document.getElementById('quiz-app').offsetTop - 80, behavior:'smooth'});
}

function startQuiz(topicLabel){
  currentTopicLabel = topicLabel;
  let set = topicLabel === 'all' ? QUESTIONS.slice() : QUESTIONS.filter(q=>q.topic===topicLabel);
  if(shuffleOn) set = shuffleArr(set);
  activeSet = set;
  idx = 0;
  userAnswers = new Array(activeSet.length).fill(null);
  pickerView.style.display = 'none';
  quizView.style.display = 'block';
  document.getElementById('scoreBanner').style.display = 'none';
  document.getElementById('quiz-summary').style.display = 'none';
  document.getElementById('quiz-summary').innerHTML = '';
  renderQuestion();
  window.scrollTo({top: document.getElementById('quiz-app').offsetTop - 80, behavior:'smooth'});
}

function renderQuestion(){
  const body = document.getElementById('quizBody');
  const progress = document.getElementById('progressLabel');
  if(activeSet.length===0){ body.innerHTML=''; progress.textContent=''; return; }
  const setLabel = currentTopicLabel === 'all' ? 'Full Mixed Quiz' : currentTopicLabel;
  progress.textContent = `${setLabel} — Question ${idx+1} of ${activeSet.length}`;
  const item = activeSet[idx];
  const answered = userAnswers[idx] !== null;

  let optsHtml = item.options.map((opt,i)=>{
    let cls = 'opt';
    if(answered){
      if(i === item.answer) cls += ' correct';
      else if(i === userAnswers[idx] && i !== item.answer) cls += ' incorrect';
    }
    return `<button class="${cls}" data-i="${i}" ${answered?'disabled':''}>${String.fromCharCode(65+i)}. ${opt}</button>`;
  }).join('');

  body.innerHTML = `
    <div class="qcard">
      <div class="qtop">
        <span class="qnum">Question ${idx+1}</span>
        <span class="qtopic">${item.topic}</span>
      </div>
      <div class="qtext">${item.q}</div>
      ${optsHtml}
      <div class="explain" id="explainBox" style="display:${answered?'block':'none'}">
        <strong>${answered ? (userAnswers[idx]===item.answer ? '✅ Correct. ' : '❌ Not quite. ') : ''}</strong>${item.explain}
      </div>
      <div class="quiz-nav">
        <button id="prevBtn" ${idx===0?'disabled':''}>← Previous</button>
        <button class="primary" id="nextBtn">${idx===activeSet.length-1 ? 'Finish Quiz' : 'Next →'}</button>
      </div>
    </div>
  `;

  body.querySelectorAll('.opt').forEach(btn=>{
    btn.addEventListener('click', function(){
      if(userAnswers[idx] !== null) return;
      userAnswers[idx] = parseInt(this.dataset.i);
      renderQuestion();
    });
  });
  document.getElementById('prevBtn').addEventListener('click', ()=>{ idx--; renderQuestion(); });
  document.getElementById('nextBtn').addEventListener('click', ()=>{
    if(idx < activeSet.length-1){ idx++; renderQuestion(); }
    else finishQuiz();
  });
}

function finishQuiz(){
  const total = activeSet.length;
  let correct = 0;
  activeSet.forEach((item,i)=>{ if(userAnswers[i]===item.answer) correct++; });
  const pct = Math.round((correct/total)*100);
  document.getElementById('quizBody').innerHTML = '';
  document.getElementById('progressLabel').textContent = '';
  const banner = document.getElementById('scoreBanner');
  banner.style.display = 'block';
  const setLabel = currentTopicLabel === 'all' ? 'Full Mixed Quiz' : currentTopicLabel;
  document.getElementById('scoreText').textContent = `${setLabel}: ${correct} / ${total} correct (${pct}%)`;
  let msg = pct>=85 ? "Excellent — you're exam-ready on this! 🎯" : pct>=60 ? "Solid, but review the missed questions below." : "Keep reviewing — revisit this topic's page and retry.";
  document.getElementById('scoreSub').textContent = msg;

  const summary = document.getElementById('quiz-summary');
  summary.style.display = 'block';
  summary.innerHTML = '<h3 style="margin-top:0">Review</h3>' + activeSet.map((item,i)=>{
    const ua = userAnswers[i];
    const right = ua === item.answer;
    return `<div class="summary-row ${right?'right':'wrong'}">
      <span>${i+1}. [${item.topic}] ${item.q.substring(0,70)}${item.q.length>70?'…':''}</span>
      <span>${right ? '✅' : '❌ (Correct: '+String.fromCharCode(65+item.answer)+')'}</span>
    </div>`;
  }).join('');
  window.scrollTo({top: document.getElementById('quiz-app').offsetTop - 80, behavior:'smooth'});
}
