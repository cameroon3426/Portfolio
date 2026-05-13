/* quiz.js — one-question-at-a-time quiz engine for QIROX Foundation modules
   Questions rendered from a JS bank each load — correct answers never written to the DOM.
   Options are shuffled on each render, so question order and option order both vary. */
(function() {
  var qPool = [], qCurrent = 0, qCorrect = 0, qTotal = 0, SKEY = '', MNUM = 0;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* call from each module's own script block:
     initQuiz(QUIZ_BANK, 5, 'qirox-foundation-completed', 1); */
  window.initQuiz = function(bank, pickN, storageKey, moduleNum) {
    SKEY = storageKey;
    MNUM = moduleNum;
    qPool = shuffle(bank).slice(0, pickN);
    qTotal = qPool.length;
    qCurrent = 0;
    qCorrect = 0;
    renderAll();
    showQ(0);
    updateBar();
  };

  function renderAll() {
    var container = document.getElementById('quiz-container');
    if (!container) return;
    container.innerHTML = '';
    qPool.forEach(function(q, idx) {
      container.appendChild(renderQ(q, idx));
    });
  }

  function renderQ(q, idx) {
    var div = document.createElement('div');
    div.className = 'quiz-q';
    div.id = 'qq' + idx;

    var inner = document.createElement('div');
    inner.className = 'question';

    if (q.image) {
      var imgHint = document.createElement('p');
      imgHint.style.cssText = 'color:var(--sub);font-size:12px;font-weight:400;margin-bottom:8px;';
      imgHint.textContent = 'Study the image below, then answer the question.';
      inner.appendChild(imgHint);

      var imgBlock = document.createElement('div');
      imgBlock.className = 'img-block';
      imgBlock.style.margin = '0 0 16px 0';

      var img = document.createElement('img');
      img.src = q.image;
      img.alt = q.imageAlt || '';
      img.className = 'training-img';
      img.title = 'Click to enlarge';
      img.style.maxWidth = '420px';
      imgBlock.appendChild(img);

      if (q.imageCaption) {
        var cap = document.createElement('div');
        cap.className = 'img-caption';
        cap.textContent = q.imageCaption + ' Click to enlarge.';
        imgBlock.appendChild(cap);
      }
      inner.appendChild(imgBlock);
    }

    var qText = document.createElement('p');
    qText.textContent = q.text;
    inner.appendChild(qText);

    if (q.type === 'mcq') {
      var shuffledOpts = shuffle(q.options.map(function(o, i) {
        return { text: o, correct: i === q.correct };
      }));
      var optDiv = document.createElement('div');
      optDiv.className = 'options';
      shuffledOpts.forEach(function(o) {
        var btn = document.createElement('div');
        btn.className = 'option';
        btn.textContent = o.text;
        var isCorrect = o.correct;
        var expl = q.explanation;
        btn.addEventListener('click', function() {
          handleMCQ(btn, 'qq' + idx, isCorrect, expl);
        });
        optDiv.appendChild(btn);
      });
      inner.appendChild(optDiv);
    } else if (q.type === 'text') {
      if (q.hint) {
        var hintEl = document.createElement('p');
        hintEl.style.cssText = 'font-size:13px;color:var(--sub);margin-top:4px;';
        hintEl.textContent = q.hint;
        inner.appendChild(hintEl);
      }
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'quiz-text-input';
      input.id = 'qq' + idx + '-input';
      input.placeholder = 'Type your answer...';
      inner.appendChild(input);

      inner.appendChild(document.createElement('br'));

      var accepted = q.accepted;
      var expl = q.explanation;
      var checkBtn = document.createElement('button');
      checkBtn.className = 'quiz-check-btn';
      checkBtn.textContent = 'Check Answer';
      checkBtn.addEventListener('click', function() {
        handleText('qq' + idx, accepted, expl);
      });
      inner.appendChild(checkBtn);
    } else if (q.type === 'dialogue') {
      var dlgHint = document.createElement('p');
      dlgHint.style.cssText = 'font-size:13px;color:var(--sub);margin-bottom:12px;font-style:italic;';
      dlgHint.textContent = 'Think about what you already know, then share your thoughts.';
      inner.appendChild(dlgHint);

      var dlgChat = document.createElement('div');
      dlgChat.className = 'dlg-chat';
      inner.appendChild(dlgChat);

      var dlgInput = document.createElement('textarea');
      dlgInput.className = 'dlg-input';
      dlgInput.placeholder = 'Share your thinking...';
      inner.appendChild(dlgInput);

      var dlgTurn = 0;
      var dlgR1 = q.response1;
      var dlgR2 = q.response2;
      var dlgFQ = q.followup;
      var dlgIdx = idx;

      var dlgBtn = document.createElement('button');
      dlgBtn.className = 'quiz-check-btn';
      dlgBtn.textContent = 'Share';
      dlgBtn.addEventListener('click', function() {
        var val = dlgInput.value.trim();
        if (!val) return;
        var userBubble = document.createElement('div');
        userBubble.className = 'dlg-user';
        userBubble.textContent = val;
        dlgChat.appendChild(userBubble);
        dlgInput.value = '';

        if (dlgTurn === 0) {
          var sys1 = document.createElement('div');
          sys1.className = 'dlg-system';
          sys1.textContent = dlgR1;
          dlgChat.appendChild(sys1);
          var fqEl = document.createElement('p');
          fqEl.className = 'dlg-followup';
          fqEl.textContent = dlgFQ;
          dlgChat.appendChild(fqEl);
          dlgTurn = 1;
        } else {
          var sys2 = document.createElement('div');
          sys2.className = 'dlg-system';
          sys2.textContent = dlgR2;
          dlgChat.appendChild(sys2);
          dlgInput.disabled = true;
          dlgBtn.disabled = true;
          var dlgContainer = document.getElementById('qq' + dlgIdx);
          if (dlgContainer && !dlgContainer.classList.contains('answered')) {
            dlgContainer.classList.add('answered');
            qCorrect++;
            var dlgFb = dlgContainer.querySelector('.quiz-feedback');
            if (dlgFb) { dlgFb.className = 'quiz-feedback correct'; dlgFb.textContent = '✓ Good thinking. Moving on.'; }
          }
          setTimeout(advance, 2200);
        }
      });
      inner.appendChild(dlgBtn);
    }

    var fb = document.createElement('div');
    fb.className = 'quiz-feedback';
    inner.appendChild(fb);

    div.appendChild(inner);
    return div;
  }

  function handleMCQ(el, qid, isCorrect, explanation) {
    var container = document.getElementById(qid);
    if (!container || container.classList.contains('answered')) return;
    container.classList.add('answered');
    container.querySelectorAll('.option').forEach(function(o) {
      o.style.pointerEvents = 'none';
    });
    var fb = container.querySelector('.quiz-feedback');
    if (isCorrect) {
      qCorrect++;
      el.classList.add('correct');
      if (fb) {
        fb.className = 'quiz-feedback correct';
        fb.textContent = '✓ Correct!' + (explanation ? ' ' + explanation : '');
      }
    } else {
      el.classList.add('incorrect');
      if (fb) {
        fb.className = 'quiz-feedback wrong';
        fb.textContent = '✗ Not quite.' + (explanation ? ' ' + explanation : '');
      }
    }
    setTimeout(advance, isCorrect ? 1400 : 2400);
  }

  function handleText(qid, accepted, explanation) {
    var container = document.getElementById(qid);
    if (!container || container.classList.contains('answered')) return;
    container.classList.add('answered');
    var input = document.getElementById(qid + '-input');
    if (!input) return;
    var val = input.value.trim().toLowerCase();
    var isCorrect = accepted.some(function(a) {
      return val.indexOf(a.toLowerCase()) !== -1;
    });
    input.disabled = true;
    var btn = container.querySelector('.quiz-check-btn');
    if (btn) btn.disabled = true;
    var fb = container.querySelector('.quiz-feedback');
    if (isCorrect) {
      qCorrect++;
      input.style.borderColor = '#16A34A';
      if (fb) {
        fb.className = 'quiz-feedback correct';
        fb.textContent = '✓ Correct!' + (explanation ? ' ' + explanation : '');
      }
    } else {
      input.style.borderColor = '#dc2626';
      if (fb) {
        fb.className = 'quiz-feedback wrong';
        fb.textContent = '✗ Expected: ' + accepted[0] + (explanation ? ' — ' + explanation : '');
      }
    }
    setTimeout(advance, isCorrect ? 1400 : 2600);
  }

  /* Enter key submits active text question */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    var qid = e.target.id.replace('-input', '');
    var container = document.getElementById(qid);
    if (!container || container.classList.contains('answered')) return;
    var btn = container.querySelector('.quiz-check-btn');
    if (btn) btn.click();
  });

  function showQ(idx) {
    document.querySelectorAll('.quiz-q').forEach(function(q) { q.classList.remove('active'); });
    var el = document.getElementById('qq' + idx);
    if (el) el.classList.add('active');
    updateBar();
  }

  function updateBar() {
    var bar = document.getElementById('quiz-bar');
    var txt = document.getElementById('quiz-progress-text');
    if (bar) bar.style.width = (qCurrent / qTotal * 100) + '%';
    if (txt) txt.textContent = 'Question ' + (qCurrent + 1) + ' of ' + qTotal;
  }

  function advance() {
    qCurrent++;
    if (qCurrent >= qTotal) { finish(); } else { showQ(qCurrent); }
  }

  function finish() {
    document.querySelectorAll('.quiz-q').forEach(function(q) { q.classList.remove('active'); });
    var final = document.getElementById('quiz-final');
    if (final) { final.style.display = 'block'; final.scrollIntoView({ behavior: 'smooth' }); }
    var bar = document.getElementById('quiz-bar');
    if (bar) bar.style.width = '100%';
    var txt = document.getElementById('quiz-progress-text');
    if (txt) txt.textContent = 'Complete';
    var pct = Math.round(qCorrect / qTotal * 100);
    var title = document.getElementById('quiz-result-title');
    if (title) title.textContent = qCorrect + ' / ' + qTotal + ' correct (' + pct + '%)';
    if (pct >= 80) {
      var pass = document.getElementById('quiz-result-pass');
      if (pass) pass.style.display = 'block';
      markDone();
    } else {
      var fail = document.getElementById('quiz-result-fail');
      if (fail) fail.style.display = 'block';
    }
  }

  function markDone() {
    try {
      var c = JSON.parse(localStorage.getItem(SKEY) || '[]');
      if (c.indexOf(MNUM) === -1) { c.push(MNUM); localStorage.setItem(SKEY, JSON.stringify(c)); }
    } catch(e) {}
  }
})();
