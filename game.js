/* ============================================================
   BOSS BATTLE QUIZ — GAME LOGIC
   ------------------------------------------------------------
   Depends on: questions.js (data), sounds.js (audio)
   ============================================================ */

(function () {
  'use strict';

  /* ---------- STATE ---------- */
  const state = {
    hero: { name: "Aeron", character: CHARACTERS[0] },
    heroHp: 0,
    heroMaxHp: 0,
    bossHp: 0,
    bossMaxHp: 0,
    usedQuestions: [],
    currentQuestion: null,
    currentQuestionTime: GAME_CONFIG.TIME_PER_QUESTION,
    questionIndex: 0,           // Which question we're on (0-based)
    totalQuestions: 0,          // How many questions this run
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    correctThisLevel: 0,
    healsAvailable: 1,
    timerInterval: null,
    timeLeft: 0,
    answering: false,
    typewriterTimeout: null,
    audioUnlocked: false,
    fullStoryHTML: ""
  };

  /* ---------- DOM HELPERS ---------- */
  const $ = function (id) { return document.getElementById(id); };

  function showScreen(id) {
    ['start-screen', 'creator-screen', 'story-screen', 'game-screen', 'end-screen'].forEach(function (s) {
      const el = $(s);
      if (el) el.classList.add('hidden');
    });
    const target = $(id);
    if (target) target.classList.remove('hidden');
  }

  /* ============================================================
     AUDIO UNLOCK
     ============================================================ */
  function unlockAudioOnce() {
    if (state.audioUnlocked) return;
    Audio.unlock();
    state.audioUnlocked = true;
    document.removeEventListener('click', unlockAudioOnce);
    document.removeEventListener('keydown', unlockAudioOnce);
    document.removeEventListener('touchstart', unlockAudioOnce);
  }

  /* ============================================================
     HERO CREATOR
     ============================================================ */

  const STAT_MAX = {
    hp: 140,
    damage: 35,
    heal: 40
  };

  function getStatPercent(value, max) {
    return Math.max(8, Math.min(100, Math.round((value / max) * 100)));
  }

  function buildCharacterData(c) {
    return {
      hp:     { label: "Health", icon: "❤️", pct: getStatPercent(c.hp, STAT_MAX.hp) },
      damage: { label: "Damage", icon: "⚔️", pct: getStatPercent(c.damage, STAT_MAX.damage) },
      heal:   { label: "Heal",   icon: "💚", pct: getStatPercent(c.heal, STAT_MAX.heal) }
    };
  }

  function shortName(name) {
    return name.replace("The ", "");
  }

  function renderCharacterPicker() {
    const picker = $('hero-picker');
    const layout = picker.parentElement;
    picker.innerHTML = '';

    let detail = layout.querySelector('.hero-detail');
    if (!detail) {
      detail = document.createElement('div');
      detail.className = 'hero-detail';
      layout.appendChild(detail);
    }

    CHARACTERS.forEach(function (c, i) {
      const thumb = document.createElement('div');
      thumb.className = 'hero-thumb' + (i === 0 ? ' selected' : '');
      thumb.dataset.id = c.id;
      thumb.innerHTML =
        '<div class="thumb-emoji">' + c.emoji + '</div>' +
        '<div class="thumb-name">' + shortName(c.name) + '</div>';

      thumb.addEventListener('click', function () {
        document.querySelectorAll('.hero-thumb').forEach(function (t) { t.classList.remove('selected'); });
        thumb.classList.add('selected');
        Audio.sfxAnswer();
        renderHeroDetail(c);
      });

      picker.appendChild(thumb);
    });

    renderHeroDetail(CHARACTERS[0]);
  }

  function renderHeroDetail(c) {
    const detail = document.querySelector('.hero-detail');
    if (!detail) return;

    const stats = buildCharacterData(c);
    const statOrder = ['hp', 'damage', 'heal'];

    let statRowsHTML = '';
    statOrder.forEach(function (key) {
      const s = stats[key];
      statRowsHTML +=
        '<div class="stat-row stat-' + key + '">' +
          '<div class="stat-label-cell">' +
            '<span class="stat-icon">' + s.icon + '</span>' +
            '<span>' + s.label + '</span>' +
          '</div>' +
          '<div class="stat-bar-track">' +
            '<div class="stat-bar-fill" style="width:' + s.pct + '%"></div>' +
          '</div>' +
        '</div>';
    });

    detail.innerHTML =
      '<div class="detail-header">' +
        '<div class="detail-avatar">' + c.emoji + '</div>' +
        '<div class="detail-name-block">' +
          '<div class="detail-name">' + shortName(c.name) + '</div>' +
          '<div class="detail-class">' + shortName(c.name) + ' Class</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-desc">' + c.desc + '</div>' +
      '<div style="display:flex; flex-direction:column; gap:8px;">' +
        statRowsHTML +
      '</div>';
  }

  function showCreator() {
    Audio.sfxClick();
    renderCharacterPicker();
    showScreen('creator-screen');
  }

  function confirmHero() {
    Audio.sfxClick();
    const nameInput = $('hero-name-input').value.trim();
    state.hero.name = nameInput || "Aeron";
    const selected = document.querySelector('.hero-thumb.selected');
    state.hero.character = CHARACTERS.find(function (c) {
      return c.id === (selected ? selected.dataset.id : null);
    }) || CHARACTERS[0];

    $('hero-sigil-hud').textContent = state.hero.character.emoji;
    $('hero-name-hud').textContent = state.hero.name;
    $('hero-sprite').textContent = state.hero.character.emoji;

    buildStory();
    showScreen('story-screen');
    typewriteStory(state.fullStoryHTML);
  }

  /* ============================================================
   STORY
   ============================================================ */
function buildStory() {
  const h = state.hero;
  const b = BOSS;
  state.fullStoryHTML =
    '<p>The village of <span class="highlight">Eldenmoor</span> has fallen silent.</p>' +
    '<p>For three nights, no one has dared leave their homes. The lanterns burn low, and the wind carries a sound no one can name — a low, patient growl coming from the old ruins on the hill.</p>' +
    '<p>You are <span class="highlight">' + h.name + '</span>, ' + h.character.emoji + ' ' + h.character.name + ' of the <span class="highlight">Order of the Quill</span> — the keepers of forgotten knowledge. When the others fled, you stayed.</p>' +
    '<div class="chapter-break">◆ ◆ ◆</div>' +
    '<p>At dawn, a letter arrived sealed with black wax. Inside, a single line:</p>' +
    '<p style="text-align:center; font-style:italic; color:#ffd700; font-size:16px; margin:16px 0;">"Prove your mind, or lose your world."</p>' +
    '<p>The path to the ruins is short. The journey into the dragon\'s lair is not.</p>' +
    '<p>You gather what little you can — a lantern, a pouch of herbs, and the ' + h.character.emoji + ' that marks you as one of the Order. At the crossroads, you pause.</p>' +
    '<p>To the east lies the old road through the Whispering Forest. To the west, the steep climb up the Mountain Pass. Either will bring you to the ruins by nightfall.</p>' +
    '<p>You choose the path that calls to you — and you walk.</p>' +
    '<div class="chapter-break">◆ ◆ ◆</div>' +
    '<p>The ruins rise before you as the sun sinks behind the hills — a dark spire against a bruised sky. The air grows warm. Smoke drifts from the broken windows.</p>' +
    '<p>Inside, torches flicker along the walls. At the far end of the great hall, something stirs in the shadows — a serpentine shape uncoils from the dark, its scales catching the firelight. Smoke curls from its nostrils. Two eyes like molten gold fix upon you.</p>' +
    '<p><span class="highlight">' + b.name + '</span> raises its head and speaks, its voice like stone grinding against stone:</p>' +
    '<p style="text-align:center; font-style:italic; color:#ff8c42; font-size:15px; margin:16px 0;">"Answer truly, and you may pass.<br>Hesitate, and you belong to me."</p>' +
    '<p>You raise your ' + h.character.emoji + ' and steady your mind. Every answer is a strike. Every mistake, a wound. The trial begins now.</p>' +
    '<p class="whisper">— Prove your mind, ' + h.name + '. —</p>';
}

function buildEndings() {
  const h = state.hero;
  const b = BOSS;
  ENDINGS.win.text =
    '<p><span class="highlight">' + b.name + '</span> lets out a long, shuddering breath. Its golden eyes dim. Slowly, the great wyrm lowers its head to the stone — not in defeat, but in respect. Its voice fades into silence like embers dying in the dark.</p>' +
    '<p>You, <span class="highlight">' + h.name + '</span> the ' + h.character.name + ', step out of the ruins as the first light of morning touches the hills. The smoke has cleared. Eldenmoor will wake to a new day — and it will remember the ' + h.character.emoji + ' who stood alone before the dragon and answered without fear.</p>' +
    '<p class="whisper">— The Order of the Quill endures. —</p>';
  ENDINGS.lose.text =
    '<p>Your mind falters. The last answer slips away like smoke on the wind. <span class="highlight">' + b.name + '</span> lifts its head, its voice low and patient — victorious.</p>' +
    '<p>The torches go out one by one. The ruins are quiet again, save for the slow rhythm of a dragon\'s breathing in the dark.</p>' +
    '<p>But the Order does not fall so easily. Somewhere in the village, another scholar picks up a quill, and the story begins again.</p>' +
    '<p class="whisper">— Try once more, ' + h.name + '. —</p>';
}

  /* ---------- TYPEWRITER ---------- */
  function typewriteStory(html) {
    const container = $('story-text');
    if (!container) return;
    if (state.typewriterTimeout) clearTimeout(state.typewriterTimeout);
    container.innerHTML = '';
    container.classList.add('typewriter');

    $('story-skip-btn').classList.remove('hidden');
    $('story-begin-btn').classList.add('hidden');

    const tokens = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === '<') {
        const end = html.indexOf('>', i);
        if (end !== -1) {
          tokens.push({ type: 'tag', value: html.slice(i, end + 1) });
          i = end + 1;
          continue;
        }
      }
      tokens.push({ type: 'char', value: html[i] });
      i++;
    }

    let buffer = '';
    let idx = 0;
    let charSinceSound = 0;
    const speed = GAME_CONFIG.TYPEWRITER_SPEED;

    function step() {
      if (idx >= tokens.length) {
        container.classList.remove('typewriter');
        $('story-skip-btn').classList.add('hidden');
        $('story-begin-btn').classList.remove('hidden');
        return;
      }
      const token = tokens[idx];
      buffer += token.value;

      let delay = speed;
      if (token.type === 'tag') {
        delay = (token.value.indexOf('</p') === 0 || token.value.indexOf('<br') === 0) ? 200 : 0;
      } else if (token.type === 'char') {
        charSinceSound++;
        if (charSinceSound >= 4 && token.value.trim() !== '') {
          try { Audio.sfxType(); } catch (e) {}
          charSinceSound = 0;
        }
        if (token.value === '.' || token.value === '!' || token.value === '?') delay = 90;
        else if (token.value === ',' || token.value === ';') delay = 45;
      }

      container.innerHTML = buffer;
      container.scrollTop = container.scrollHeight;
      idx++;
      state.typewriterTimeout = setTimeout(step, delay);
    }
    step();
  }

  function finishTyping() {
    if (state.typewriterTimeout) clearTimeout(state.typewriterTimeout);
    const container = $('story-text');
    if (container) {
      container.innerHTML = state.fullStoryHTML;
      container.classList.remove('typewriter');
      container.scrollTop = container.scrollHeight;
    }
    $('story-skip-btn').classList.add('hidden');
    $('story-begin-btn').classList.remove('hidden');
  }

  function beginBattle() {
    if (state.typewriterTimeout) clearTimeout(state.typewriterTimeout);
    Audio.sfxClick();
    startGame();
  }

  /* ============================================================
     BOSS HP CALCULATION
     ------------------------------------------------------------
     In ALL_QUESTIONS_MODE, we compute boss HP so that:
       - The boss survives until the last question
       - Only a PERFECT streak could theoretically one-shot it early
       - The player must answer every question to win
     Formula:
       maxPossibleDamage = sum of damage from every question answered
                           correctly with a maximum streak
       bossHp = maxPossibleDamage × 0.95 (rounded)
     This ensures the boss survives all but the final blow.
     ============================================================ */
  function calculateBossHp(heroDamage, questionCount) {
    if (!GAME_CONFIG.ALL_QUESTIONS_MODE) {
      return Math.round(BOSS.hp * state.hero.character.hpMult);
    }

    // Max damage per hit = base + capped streak bonus
    const maxPerHit = heroDamage + GAME_CONFIG.MAX_STREAK_BONUS;

    // Assume each question deals full damage
    const maxTotalDamage = maxPerHit * questionCount;

    // Set boss HP to 95% of that — the boss survives until the last question
    // unless the player is close to perfect
    return Math.round(maxTotalDamage * 0.95);
  }

  /* ============================================================
     GAME START
     ============================================================ */
  function startGame() {
    if (state.typewriterTimeout) clearTimeout(state.typewriterTimeout);

    // Reset state
    state.heroMaxHp = state.hero.character.hp;
    state.heroHp = state.heroMaxHp;

    state.totalQuestions = QUESTIONS.length;
    state.questionIndex = 0;
    state.usedQuestions = [];

    // Build a shuffled queue containing EVERY question exactly once
    const queue = QUESTIONS.slice().sort(function () { return Math.random() - 0.5; });
    state.usedQuestions = queue;

    // Calculate boss HP based on mode
    state.bossMaxHp = calculateBossHp(state.hero.character.damage, state.totalQuestions);
    state.bossHp = state.bossMaxHp;

    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.totalCorrect = 0;
    state.totalAnswered = 0;
    state.correctThisLevel = 0;
    state.healsAvailable = 1;
    state.answering = false;

    $('boss-name').textContent = BOSS.name;
    $('boss-sprite-arena').textContent = BOSS.emoji;
    $('hero-sprite').textContent = state.hero.character.emoji;
    $('hero-sigil-hud').textContent = state.hero.character.emoji;
    $('hero-name-hud').textContent = state.hero.name;

    $('heal-btn').classList.remove('visible');
    $('heal-btn').textContent = '💚 USE HEAL (+' + state.hero.character.heal + ' HP)';

    showScreen('game-screen');
    updateHud();
    updateBossSprite();
    nextQuestion();
  }

  function restartGame() {
    Audio.sfxClick();
    $('end-screen').innerHTML = '';
    showScreen('start-screen');
  }

  /* ============================================================
     TIMER CALCULATION
     ============================================================ */
  function getQuestionTime(question) {
    if (question.time && typeof question.time === 'number' && question.time > 0) {
      return question.time;
    }
    if (GAME_CONFIG.TIME_AUTO_SCALE) {
      const qLen = (question.q || '').length;
      const longestAnswer = Math.max.apply(null, question.a.map(function (a) { return a.length; }));
      const totalChars = qLen + longestAnswer;
      const scaled = GAME_CONFIG.TIME_PER_QUESTION + (totalChars * GAME_CONFIG.TIME_PER_CHAR);
      return Math.round(
        Math.max(GAME_CONFIG.TIME_MIN, Math.min(GAME_CONFIG.TIME_MAX, scaled))
      );
    }
    return GAME_CONFIG.TIME_PER_QUESTION;
  }

  /* ============================================================
     QUESTIONS — pulls from the shuffled queue, uses every one
     ============================================================ */
  function nextQuestion() {
    state.answering = false;

    // If we've used all questions, resolve the fight
    if (state.usedQuestions.length === 0) {
      return resolveSuddenDeath();
    }

    // Take the next question from the queue
    state.currentQuestion = state.usedQuestions.shift();
    state.questionIndex++;

    state.currentQuestionTime = getQuestionTime(state.currentQuestion);

    renderQuestion();
    startTimer();
  }

  function renderQuestion() {
    $('question-text').textContent = state.currentQuestion.q;
    const box = $('answers');
    box.innerHTML = '';
    const shuffled = state.currentQuestion.a.slice().sort(function () { return Math.random() - 0.5; });
    const correct = state.currentQuestion.a[0];
    shuffled.forEach(function (ans) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = ans;
      btn.title = ans;
      btn.addEventListener('click', function () {
        Audio.sfxAnswer();
        handleAnswer(btn, ans === correct);
      });
      box.appendChild(btn);
    });
  }

  /* ============================================================
     TIMER
     ============================================================ */
  function startTimer() {
    clearInterval(state.timerInterval);
    state.timeLeft = state.currentQuestionTime;
    const bar = $('timer-bar');
    bar.classList.remove('warning');
    bar.style.width = '100%';
    const startTime = Date.now();

    state.timerInterval = setInterval(function () {
      const elapsed = (Date.now() - startTime) / 1000;
      state.timeLeft = Math.max(0, state.currentQuestionTime - elapsed);
      const pct = (state.timeLeft / state.currentQuestionTime) * 100;
      bar.style.width = pct + '%';

      const warningThreshold = Math.min(3, state.currentQuestionTime * 0.2);
      if (state.timeLeft <= warningThreshold) bar.classList.add('warning');

      if (Math.ceil(state.timeLeft) !== Math.ceil(state.timeLeft + 0.1)
          && state.timeLeft <= warningThreshold
          && state.timeLeft > 0) {
        Audio.sfxTick();
      }

      if (state.timeLeft <= 0 && !state.answering) {
        clearInterval(state.timerInterval);
        timeUp();
      }
    }, 100);
  }

  function stopTimer() { clearInterval(state.timerInterval); }

  function timeUp() {
    if (state.answering) return;
    state.answering = true;
    state.streak = 0;
    state.totalAnswered++;
    state.heroHp = Math.max(0, state.heroHp - GAME_CONFIG.DAMAGE_TAKEN);
    Audio.sfxWrong();
    $('question-text').textContent = "⏰ Time's up! The boss strikes!";
    document.querySelectorAll('.answer-btn').forEach(function (b) {
      b.disabled = true;
      if (b.textContent === state.currentQuestion.a[0]) b.classList.add('correct');
    });
    animateBossAttack();
    updateHud();
    setTimeout(function () {
      // Check if hero died
      if (state.heroHp <= 0) return endGame(false);
      // Otherwise continue to next question (even if we've run out)
      nextQuestion();
    }, 1600);
  }

  /* ============================================================
     ANSWER HANDLING
     ============================================================ */
  function handleAnswer(btn, isCorrect) {
    if (state.answering) return;
    state.answering = true;
    stopTimer();
    state.totalAnswered++;

    document.querySelectorAll('.answer-btn').forEach(function (b) { b.disabled = true; });
    const correct = state.currentQuestion.a[0];
    document.querySelectorAll('.answer-btn').forEach(function (b) {
      if (b.textContent === correct) b.classList.add('correct');
      else if (b === btn && !isCorrect) b.classList.add('wrong');
    });

    if (isCorrect) {
      state.streak++;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      state.totalCorrect++;
      state.correctThisLevel++;

      const streakBonus = Math.min(state.streak - 1, 5) * GAME_CONFIG.STREAK_BONUS_PER_HIT;
      const cappedBonus = Math.min(streakBonus, GAME_CONFIG.MAX_STREAK_BONUS);
      const totalDamage = state.hero.character.damage + cappedBonus;

      // Prevent boss from dying before last question (except the very last)
      if (GAME_CONFIG.ALL_QUESTIONS_MODE && state.usedQuestions.length > 0) {
        // Cap damage so boss HP stays at least 1 (survives until next question)
        state.bossHp = Math.max(1, state.bossHp - totalDamage);
      } else {
        state.bossHp = Math.max(0, state.bossHp - totalDamage);
      }

      const speedRatio = state.timeLeft / state.currentQuestionTime;
      const speedBonus = Math.round(speedRatio * 20);
      const points = 10 + (state.streak * 5) + speedBonus;
      state.score += points;

      Audio.sfxCorrect();
      animateHeroAttack(totalDamage, points, state.streak);

      if (state.correctThisLevel % GAME_CONFIG.HEAL_EVERY_N_CORRECT === 0 && state.healsAvailable > 0) {
        $('heal-btn').classList.add('visible');
      }
    } else {
      state.streak = 0;
      state.heroHp = Math.max(0, state.heroHp - GAME_CONFIG.DAMAGE_TAKEN);
      Audio.sfxWrong();
      animateBossAttack(GAME_CONFIG.DAMAGE_TAKEN);
    }

    updateHud();
    updateBossSprite();
    setTimeout(function () {
      // Hero died? Lose immediately
      if (state.heroHp <= 0) return endGame(false);
      // Otherwise keep going
      nextQuestion();
    }, 1800);
  }

  /* ============================================================
     ANIMATIONS
     ============================================================ */
  function animateHeroAttack(damage, points, streak) {
    const hero = $('hero-sprite');
    hero.classList.add('hero-attacking');
    Audio.sfxHeroHit();
    setTimeout(function () {
      hero.classList.remove('hero-attacking');
      const boss = $('boss-sprite-arena');
      boss.classList.add('boss-hurt');
      spawnImpact(0.75, '💥');
      spawnDamage(0.75, '-' + damage, '#ff6b6b');
      if (streak >= 3) spawnDamage(0.5, '🔥 x' + streak, '#ff9500');
      setTimeout(function () { boss.classList.remove('boss-hurt'); }, 500);
    }, 400);
    setTimeout(function () { spawnDamage(0.15, '+' + points, '#7ee787'); }, 700);
  }

  function animateBossAttack(damage) {
    damage = damage || GAME_CONFIG.DAMAGE_TAKEN;
    const boss = $('boss-sprite-arena');
    boss.classList.add('boss-attacking');
    Audio.sfxBossHit();
    setTimeout(function () {
      boss.classList.remove('boss-attacking');
      const hero = $('hero-sprite');
      hero.classList.add('hero-hurt');
      spawnImpact(0.2, '💢');
      if (damage > 0) spawnDamage(0.2, '-' + damage, '#ff6b6b');
      setTimeout(function () { hero.classList.remove('hero-hurt'); }, 500);
    }, 400);
  }

  function spawnDamage(xPct, text, color) {
    const el = document.createElement('div');
    el.className = 'damage-pop';
    el.textContent = text;
    el.style.color = color;
    el.style.left = (xPct * 100) + '%';
    el.style.bottom = '70px';
    $('arena').appendChild(el);
    setTimeout(function () { el.remove(); }, 1100);
  }

  function spawnImpact(xPct, emoji) {
    const el = document.createElement('div');
    el.className = 'impact';
    el.textContent = emoji;
    el.style.left = (xPct * 100) + '%';
    el.style.bottom = '55px';
    $('arena').appendChild(el);
    setTimeout(function () { el.remove(); }, 600);
  }

  /* ============================================================
     HEAL
     ============================================================ */
  function useHeal() {
    if (state.healsAvailable <= 0) return;
    Audio.sfxClick();
    state.healsAvailable--;
    state.heroHp = Math.min(state.heroMaxHp, state.heroHp + state.hero.character.heal);
    Audio.sfxHeal();
    spawnDamage(0.2, '+' + state.hero.character.heal + ' HP', '#22c55e');
    $('heal-btn').classList.remove('visible');
    updateHud();
  }

  /* ============================================================
     HUD
     ============================================================ */
  function updateHud() {
    const heroPct = (state.heroHp / state.heroMaxHp) * 100;
    const bossPct = (state.bossHp / state.bossMaxHp) * 100;
    $('hero-hp').style.width = heroPct + '%';
    $('boss-hp').style.width = bossPct + '%';
    $('hero-hp-text').textContent = state.heroHp + ' / ' + state.heroMaxHp;
    $('boss-hp-text').textContent = state.bossHp + ' / ' + state.bossMaxHp;
    $('score-display').textContent = state.score;
    $('streak-display').textContent = state.streak;
    const acc = state.totalAnswered ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;
    $('accuracy-display').textContent = acc + '%';
  }

  function updateBossSprite() {
    const pct = state.bossHp / state.bossMaxHp;
    const stage = BOSS_STAGES.find(function (s) { return pct >= s.minHp; });
    const bossEl = $('boss-sprite-arena');
    bossEl.textContent = BOSS.emoji;
    bossEl.style.filter = pct < 0.4
      ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) hue-rotate(-20deg) brightness(0.8)'
      : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))';
    $('boss-stage-tag').textContent = 'Stage ' + stage.stage + ' — ' + stage.label;
  }

  /* ============================================================
     RESOLVE — Sudden Death or normal end
     ============================================================ */
  function resolveSuddenDeath() {
    // Called when the question queue is empty
    // Win = boss HP is 0 or player has higher HP ratio
    if (state.bossHp <= 0) {
      return endGame(true);
    }

    // Boss survived. Compare HP ratios to decide.
    const heroRatio = state.heroHp / state.heroMaxHp;
    const bossRatio = state.bossHp / state.bossMaxHp;

    if (heroRatio > bossRatio) {
      // Player wins by HP advantage
      state.bossHp = 0;      // for the epilogue
      return endGame(true);
    } else {
      // Boss wins
      state.heroHp = 0;      // for the epilogue
      return endGame(false);
    }
  }

  function endGame(heroWon) {
    stopTimer();
    buildEndings();
    const ending = heroWon ? ENDINGS.win : ENDINGS.lose;
    const accuracy = state.totalAnswered ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;

    const flash = $('end-flash');
    flash.className = 'end-flash ' + (heroWon ? 'win' : 'lose');
    void flash.offsetWidth;

    if (heroWon) Audio.sfxWin(); else Audio.sfxLose();

    const endScreen = $('end-screen');
    endScreen.innerHTML =
      '<div style="display:flex; align-items:center; gap:12px; margin-bottom:8px; flex-shrink:0;">' +
        '<div class="story-emoji" style="margin:0; animation:none;">' + ending.emoji + '</div>' +
        '<div style="text-align:left;">' +
          '<h1 style="color:' + (heroWon ? '#7ee787' : '#ff6b6b') + '; font-size:22px; margin:0;">' +
            (heroWon ? '🏆 VICTORY!' : '💀 DEFEATED') +
          '</h1>' +
          '<div class="story-title" style="font-size:13px; margin:0; text-align:left;">' + ending.title + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ending-text">' + ending.text + '</div>' +
      '<div class="score-big">' + state.score + ' pts</div>' +
      '<div class="stats-grid">' +
        '<div class="stat-box"><div class="stat-label">Accuracy</div><div class="stat-value">' + accuracy + '%</div></div>' +
        '<div class="stat-box"><div class="stat-label">Best Streak</div><div class="stat-value">🔥 ' + state.bestStreak + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">Correct</div><div class="stat-value">' + state.totalCorrect + '/' + state.totalAnswered + '</div></div>' +
        '<div class="stat-box"><div class="stat-label">HP Left</div><div class="stat-value">' + state.heroHp + '</div></div>' +
      '</div>' +
      '<div class="screen-actions">' +
        '<button class="btn" id="play-again-btn" type="button">PLAY AGAIN</button>' +
      '</div>';

    showScreen('end-screen');
    $('play-again-btn').addEventListener('click', restartGame);
  }

  /* ============================================================
     EVENT WIRING
     ============================================================ */
  function wireEvents() {
    $('music-btn').addEventListener('click', function () {
      const on = Audio.toggleMusic();
      $('music-btn').textContent = on ? '🎵 Music: ON' : '🔇 Music: OFF';
    });

    $('forge-btn').addEventListener('click', showCreator);
    $('confirm-hero-btn').addEventListener('click', confirmHero);
    $('story-skip-btn').addEventListener('click', finishTyping);
    $('story-begin-btn').addEventListener('click', beginBattle);
    $('heal-btn').addEventListener('click', useHeal);

    document.addEventListener('click', unlockAudioOnce);
    document.addEventListener('keydown', unlockAudioOnce);
    document.addEventListener('touchstart', unlockAudioOnce);
  }

  /* ============================================================
     BOOT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    $('hero-name-hud').textContent = state.hero.name;
    $('hero-sigil-hud').textContent = state.hero.character.emoji;
    $('hero-sprite').textContent = state.hero.character.emoji;
    wireEvents();

    window.addEventListener('error', function (e) {
      console.warn('Game warning:', e.message);
    });
  });

})();