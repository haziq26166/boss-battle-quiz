/* ============================================================
   BOSS BATTLE QUIZ — AUDIO ENGINE
   ------------------------------------------------------------
   Handles all sound effects and background music.
   Uses Web Audio API (no audio files needed).
   Exposes a global `Audio` object with methods:
     Audio.unlock()      — call on first user gesture
     Audio.sfxClick()    — UI button
     Audio.sfxAnswer()   — answer button
     Audio.sfxCorrect()  — correct answer
     Audio.sfxWrong()    — wrong answer
     Audio.sfxHeroHit()  — hero attack
     Audio.sfxBossHit()  — boss attack
     Audio.sfxHeal()     — heal
     Audio.sfxTick()     — timer tick
     Audio.sfxType()     — typewriter
     Audio.sfxWin()      — victory
     Audio.sfxLose()     — defeat
     Audio.startMusic()  — start ambient music
     Audio.stopMusic()   — stop ambient music
     Audio.toggleMusic() — toggle state
     Audio.isMusicOn()   — returns bool
   ============================================================ */

const Audio = (function () {
  let ctx = null;
  let musicOn = true;
  let musicStarted = false;
  let soundOn = true;
  let musicNodes = [];

  /* ---------- CORE ---------- */
  function init() {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    } catch (e) {
      return false;
    }
  }

  function tone(freq, duration, type, volume, delay) {
    type = type || 'sine';
    volume = volume || 0.15;
    delay = delay || 0;
    if (!soundOn) return;
    try {
      if (!init()) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    } catch (e) {}
  }

  function noise(duration, volume, filterFreq, delay) {
    volume = volume || 0.15;
    filterFreq = filterFreq || 1000;
    delay = delay || 0;
    if (!soundOn) return;
    try {
      if (!init()) return;
      const start = ctx.currentTime + delay;
      const bufSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(start);
      src.stop(start + duration);
    } catch (e) {}
  }

  function sweep(startFreq, endFreq, duration, type, volume, delay) {
    type = type || 'sine';
    volume = volume || 0.15;
    delay = delay || 0;
    if (!soundOn) return;
    try {
      if (!init()) return;
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), start + duration);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    } catch (e) {}
  }

  /* ---------- PUBLIC SFX ---------- */
  function sfxClick()      { tone(880, 0.05, 'sine', 0.12); tone(1320, 0.04, 'sine', 0.06, 0.03); }
  function sfxAnswer()     { tone(660, 0.06, 'triangle', 0.1); tone(990, 0.05, 'triangle', 0.05, 0.03); }
  function sfxCorrect()    { tone(660, 0.1, 'sine', 0.15, 0); tone(880, 0.12, 'sine', 0.13, 0.08); tone(1174, 0.15, 'sine', 0.12, 0.16); }
  function sfxWrong()      { tone(280, 0.1, 'sawtooth', 0.15, 0); tone(200, 0.15, 'sawtooth', 0.13, 0.08); tone(140, 0.2, 'sawtooth', 0.1, 0.16); }

  function sfxHeroHit() {
    sweep(900, 200, 0.18, 'sawtooth', 0.14, 0);
    noise(0.12, 0.18, 1800, 0.15);
    tone(180, 0.15, 'square', 0.16, 0.15);
  }
  function sfxBossHit() {
    sweep(300, 80, 0.25, 'sawtooth', 0.16, 0);
    noise(0.18, 0.2, 900, 0.1);
    tone(90, 0.25, 'square', 0.18, 0.15);
  }
  function sfxHeal() {
    tone(523, 0.1, 'sine', 0.14, 0);
    tone(659, 0.1, 'sine', 0.14, 0.08);
    tone(784, 0.15, 'sine', 0.14, 0.16);
    tone(1047, 0.2, 'sine', 0.12, 0.24);
  }
  function sfxTick()   { tone(900, 0.04, 'sine', 0.07); }
  function sfxType()   { tone(1400, 0.008, 'sine', 0.02); }

  function sfxWin() {
    tone(523, 0.15, 'sine', 0.18, 0);
    tone(659, 0.15, 'sine', 0.18, 0.12);
    tone(784, 0.15, 'sine', 0.18, 0.24);
    tone(1047, 0.4, 'sine', 0.2, 0.36);
    tone(659, 0.4, 'triangle', 0.12, 0.36);
    tone(880, 0.5, 'triangle', 0.12, 0.5);
    tone(1318, 0.6, 'sine', 0.1, 0.7);
    noise(0.3, 0.08, 3000, 0.36);
  }
  function sfxLose() {
    tone(392, 0.25, 'sine', 0.16, 0);
    tone(349, 0.25, 'sine', 0.16, 0.2);
    tone(294, 0.35, 'sine', 0.16, 0.4);
    tone(220, 0.6, 'sine', 0.18, 0.65);
    tone(196, 0.7, 'triangle', 0.1, 0.9);
    sweep(300, 100, 1.2, 'sawtooth', 0.08, 0.65);
  }

  /* ---------- MUSIC ---------- */
  function startMusic() {
    if (!musicOn || musicStarted) return;
    try { if (!init()) return; } catch (e) { return; }
    try {
      // Ambient pad
      [110, 164.81, 220].forEach(function (freq) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.value = 0;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 3);
        musicNodes.push({ osc: osc, gain: gain });
      });

      // Slow arpeggio melody
      const notes = [440, 523.25, 659.25, 523.25, 493.88, 587.33, 739.99, 587.33];
      let idx = 0;
      musicNodes.melodyInterval = setInterval(function () {
        if (!musicOn || !ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = notes[idx % notes.length];
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 3);
          idx++;
        } catch (e) {}
      }, 2200);

      musicStarted = true;
    } catch (e) {
      musicStarted = false;
    }
  }

  function stopMusic() {
    try {
      musicNodes.forEach(function (n) {
        try {
          if (n.gain) n.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
          if (n.osc) setTimeout(function () { try { n.osc.stop(); } catch (e) {} }, 1200);
        } catch (e) {}
      });
      if (musicNodes.melodyInterval) clearInterval(musicNodes.melodyInterval);
      musicNodes = [];
      musicStarted = false;
    } catch (e) {}
  }

  function toggleMusic() {
    musicOn = !musicOn;
    if (musicOn) startMusic(); else stopMusic();
    sfxClick();
    return musicOn;
  }

  function unlock() {
    init();
    if (musicOn) startMusic();
  }

  function setSoundEnabled(on) { soundOn = !!on; }
  function isMusicOn() { return musicOn; }

  /* ---------- PUBLIC API ---------- */
  return {
    unlock: unlock,
    setSoundEnabled: setSoundEnabled,
    isMusicOn: isMusicOn,
    toggleMusic: toggleMusic,
    startMusic: startMusic,
    stopMusic: stopMusic,
    sfxClick: sfxClick,
    sfxAnswer: sfxAnswer,
    sfxCorrect: sfxCorrect,
    sfxWrong: sfxWrong,
    sfxHeroHit: sfxHeroHit,
    sfxBossHit: sfxBossHit,
    sfxHeal: sfxHeal,
    sfxTick: sfxTick,
    sfxType: sfxType,
    sfxWin: sfxWin,
    sfxLose: sfxLose
  };
})();