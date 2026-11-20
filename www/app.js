window.Diffequa = window.Diffequa || {};

window.Diffequa.App = (function() {
  var Cfg = window.Diffequa.Config;
  var Eng = window.Diffequa.Engine;
  var S = Eng.state;

  var currentLang = 'en';
  var soundEnabled = true;
  var hapticsEnabled = true;
  var userColors = [Cfg.DEFAULT_COLORS[0], Cfg.DEFAULT_COLORS[1], Cfg.DEFAULT_COLORS[2]];
  var selectedShapes = [Cfg.DEFAULT_SHAPES[0], Cfg.DEFAULT_SHAPES[1], Cfg.DEFAULT_SHAPES[2]];
  var perfectGamesCount = 0;
  var royalMode = false;

  var statusTimeout = null;
  var flashTimeout = null;

  function detectDeviceLanguage() {
    try {
      var navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
      if (navLang.indexOf('cs') === 0 || navLang.indexOf('sk') === 0) {
        return 'cs';
      }
    } catch (e) {}
    return 'en';
  }

  function t(key) {
    var pack = Cfg.I18N[currentLang] || Cfg.I18N.en;
    return pack[key] !== undefined ? pack[key] : key;
  }

  function getShapeName(id) {
    var pack = Cfg.I18N[currentLang] || Cfg.I18N.en;
    return (pack.shapes && pack.shapes[id]) ? pack.shapes[id] : id;
  }

  function getShapeDefById(id) {
    for (var i = 0; i < Cfg.ALL_SHAPES.length; i++) {
      if (Cfg.ALL_SHAPES[i].id === id) return Cfg.ALL_SHAPES[i];
    }
    return Cfg.ALL_SHAPES[0];
  }

  // --- Dvojité úložiště (@capacitor/preferences + localStorage) ---
  function getNativePrefsPlugin() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences) {
        return window.Capacitor.Plugins.Preferences;
      }
    } catch (e) {}
    return null;
  }

  async function storageWrite(key, valueStr) {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(key, valueStr);
      }
    } catch (e) {}

    var nativePrefs = getNativePrefsPlugin();
    if (nativePrefs) {
      try {
        await nativePrefs.set({ key: key, value: valueStr });
      } catch (e) {}
    }
  }

  async function storageRead(key) {
    var nativePrefs = getNativePrefsPlugin();
    if (nativePrefs) {
      try {
        var res = await nativePrefs.get({ key: key });
        if (res && res.value !== null && res.value !== undefined) {
          try {
            if (window.localStorage) window.localStorage.setItem(key, res.value);
          } catch (e) {}
          return res.value;
        }
      } catch (e) {}
    }

    try {
      if (window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}

    return null;
  }

  // --- Hmatová odezva (@capacitor/haptics + Web Vibration API) ---
  function getNativeHapticsPlugin() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        return window.Capacitor.Plugins.Haptics;
      }
    } catch (e) {}
    return null;
  }

  function triggerHaptic(type) {
    if (!hapticsEnabled) return;
    var haptics = getNativeHapticsPlugin();
    if (haptics) {
      try {
        if (type === 'tap' || type === 'deselect') {
          haptics.impact({ style: 'LIGHT' });
        } else if (type === 'match') {
          haptics.notification({ type: 'SUCCESS' });
        } else if (type === 'error') {
          haptics.notification({ type: 'ERROR' });
        } else if (type === 'win') {
          haptics.notification({ type: 'SUCCESS' });
          setTimeout(function() {
            try { haptics.impact({ style: 'MEDIUM' }); } catch (e) {}
          }, 160);
        }
        return;
      } catch (e) {}
    }

    try {
      if (navigator && navigator.vibrate) {
        if (type === 'tap' || type === 'deselect') navigator.vibrate(12);
        else if (type === 'match') navigator.vibrate([20, 45, 35]);
        else if (type === 'error') navigator.vibrate([40, 30, 40]);
        else if (type === 'win') navigator.vibrate([30, 50, 30, 50, 70]);
      }
    } catch (e) {}
  }

  // --- Syntetické zvuky (Web Audio API s organickými mikro-variacemi) ---
  var audioCtx = null;
  var noiseBuffer = null;

  function getAudioContext() {
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      try { audioCtx.resume(); } catch (e) {}
    }
    return audioCtx;
  }

  function getNoiseBuffer(ctx) {
    if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
      var length = Math.floor(ctx.sampleRate * 0.5);
      noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return noiseBuffer;
  }

  function jitter(base, ratio) {
    return base * (1 + (Math.random() * 2 - 1) * ratio);
  }

  function playTone(ctx, freq, startOffset, duration, waveType, peakGain, slideToFreq, pitchRatio) {
    var pRatio = (pitchRatio !== undefined) ? pitchRatio : 0.03;
    var f = jitter(freq, pRatio);
    var dur = jitter(duration, 0.14);
    var atk = jitter(0.009, 0.35);
    var gPeak = jitter(peakGain, 0.15);

    var now = ctx.currentTime + startOffset;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = waveType || 'sine';
    osc.frequency.setValueAtTime(f, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(jitter(slideToFreq, pRatio), now + dur);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gPeak, now + atk);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function playPaperSwish(ctx, startOffset, intensity) {
    var scale = intensity || 1.0;
    var now = ctx.currentTime + (startOffset || 0);

    var src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer(ctx);

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    // Střední frekvence ~1750 Hz ±20 % (1400 - 2100 Hz)
    var centerFreq = jitter(1750, 0.20);
    filter.frequency.setValueAtTime(centerFreq, now);
    filter.frequency.exponentialRampToValueAtTime(centerFreq * jitter(1.15, 0.10), now + 0.06);
    filter.Q.setValueAtTime(jitter(2.2, 0.25), now);

    // Attack 6–14 ms, decay 45–75 ms
    var attack = 0.006 + Math.random() * 0.008;
    var decay = 0.045 + Math.random() * 0.030;
    var peakGain = jitter(0.085 * scale, 0.15);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Náhodný offset v šumovém bufferu, aby každý šust měl jiný mikro-vzorek
    var maxOffset = Math.max(0, src.buffer.duration - (attack + decay + 0.05));
    src.start(now, Math.random() * maxOffset, attack + decay + 0.03);
  }

  function playSound(type, stepIndex) {
    if (!soundEnabled) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;

      if (type === 'tap') {
        var notes = [523.25, 659.25, 783.99];
        var f = notes[(stepIndex || 0) % 3];
        playTone(ctx, f, 0, 0.075, 'triangle', 0.105, f * 0.72, 0.045);
        playPaperSwish(ctx, 0, 0.35);
      } else if (type === 'deselect') {
        playTone(ctx, 440, 0, 0.065, 'sine', 0.08, 349.23, 0.045);
        playPaperSwish(ctx, 0, 0.28);
      } else if (type === 'deal') {
        // Bohatší „hrst“ karet při rozdání nebo promíchání balíčku
        playPaperSwish(ctx, 0.00, 0.95);
        playPaperSwish(ctx, 0.045 + Math.random() * 0.02, 1.15);
        playPaperSwish(ctx, 0.095 + Math.random() * 0.025, 0.80);
      } else if (type === 'match') {
        playTone(ctx, 523.25, 0.00, 0.16, 'sine', 0.11, null, 0.012);
        playTone(ctx, 659.25, 0.06 + Math.random() * 0.01, 0.18, 'sine', 0.11, null, 0.012);
        playTone(ctx, 783.99, 0.12 + Math.random() * 0.012, 0.22, 'sine', 0.12, null, 0.012);
        playTone(ctx, 1046.5, 0.18 + Math.random() * 0.015, 0.30, 'sine', 0.10, null, 0.012);
        if (S.gameMode !== 'puzzle') {
          // Jemné došustnutí doplněných karet na prázdná místa
          playPaperSwish(ctx, 0.24, 0.65);
          playPaperSwish(ctx, 0.29, 0.55);
        }
      } else if (type === 'error') {
        playTone(ctx, 196.00, 0.00, 0.11, 'triangle', 0.10, 174.61, 0.025);
        playTone(ctx, 164.81, 0.09 + Math.random() * 0.015, 0.15, 'triangle', 0.10, 146.83, 0.025);
      } else if (type === 'win') {
        playTone(ctx, 523.25, 0.00, 0.18, 'triangle', 0.12, null, 0.01);
        playTone(ctx, 659.25, 0.08, 0.18, 'triangle', 0.12, null, 0.01);
        playTone(ctx, 783.99, 0.16, 0.20, 'triangle', 0.12, null, 0.01);
        playTone(ctx, 987.77, 0.24, 0.24, 'triangle', 0.11, null, 0.01);
        playTone(ctx, 1046.5, 0.32, 0.42, 'sine', 0.14, null, 0.01);
      }
    } catch (e) {}
  }
  
  // --- Načítání a ukládání předvoleb i partie ---
  async function loadPrefs() {
    currentLang = detectDeviceLanguage();
    try {
      var saved = await storageRead(Cfg.STORAGE_PREFS);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && (parsed.lang === 'cs' || parsed.lang === 'en')) {
          currentLang = parsed.lang;
        }
        if (parsed && (parsed.mode === 'classic' || parsed.mode === 'junior' || parsed.mode === 'puzzle')) {
          S.gameMode = parsed.mode;
        }
        if (parsed && typeof parsed.sound === 'boolean') {
          soundEnabled = parsed.sound;
        }
        if (parsed && typeof parsed.haptics === 'boolean') {
          hapticsEnabled = parsed.haptics;
        }
        if (parsed && parsed.colors && parsed.colors.length === 3) {
          userColors = [parsed.colors[0], parsed.colors[1], parsed.colors[2]];
        }
        if (parsed && parsed.shapes && parsed.shapes.length === 3) {
          selectedShapes = [parsed.shapes[0], parsed.shapes[1], parsed.shapes[2]];
        }
        if (parsed && typeof parsed.perfectGames === 'number') {
          perfectGamesCount = parsed.perfectGames;
        }
        if (parsed && typeof parsed.royalMode === 'boolean' && perfectGamesCount >= 3) {
          royalMode = parsed.royalMode;
        }
      }
    } catch (e) {}
  }

  function savePrefs() {
    try {
      storageWrite(Cfg.STORAGE_PREFS, JSON.stringify({
        lang: currentLang,
        mode: S.gameMode,
        sound: soundEnabled,
        haptics: hapticsEnabled,
        colors: userColors,
        shapes: selectedShapes,
        perfectGames: perfectGamesCount,
        royalMode: royalMode
      }));
    } catch (e) {}
  }

  function saveGameState() {
    try {
      storageWrite(Cfg.STORAGE_GAME, Eng.serialize());
    } catch (e) {}
  }

  async function loadGameState() {
    try {
      var raw = await storageRead(Cfg.STORAGE_GAME);
      return Eng.restoreFromJSON(raw);
    } catch (e) {}
    return false;
  }

  // --- UI a vykreslování ---
  function getDefaultStatusText() {
    if (S.isGameOver) return t('msgGameFinished');
    if (S.gameMode === 'junior') return t('defaultStatusJunior');
    if (S.gameMode === 'puzzle') return t('defaultStatusPuzzle').replace('{tot}', S.puzzleAllSets.length || 6);
    return t('defaultStatusClassic');
  }

  function setStatus(text, type) {
    var el = document.getElementById('status');
    if (!el) return;
    el.textContent = text;
    el.className = 'status-bar' + (type ? ' status-' + type : '');
    if (statusTimeout) clearTimeout(statusTimeout);
    if (type) {
      statusTimeout = setTimeout(function() {
        el.textContent = getDefaultStatusText();
        el.className = 'status-bar';
      }, 2600);
    }
  }

  function updateModeUI() {
    var modes = ['classic', 'junior', 'puzzle'];
    for (var i = 0; i < modes.length; i++) {
      var btn = document.getElementById('mode-' + modes[i]);
      if (btn) btn.className = 'mode-btn' + (S.gameMode === modes[i] ? ' active' : '');
    }
    var descBox = document.getElementById('mode-desc-box');
    if (descBox) {
      if (S.gameMode === 'junior') descBox.innerHTML = t('modeDescJunior');
      else if (S.gameMode === 'puzzle') descBox.innerHTML = t('modeDescPuzzle');
      else descBox.innerHTML = t('modeDescClassic');
    }
  }

  function updateFeedbackUI() {
    var sndBtn = document.getElementById('toggle-sound');
    var hapBtn = document.getElementById('toggle-haptics');
    if (sndBtn) {
      sndBtn.className = 'lang-btn' + (soundEnabled ? ' active' : '');
      sndBtn.innerHTML = soundEnabled ? t('soundOn') : t('soundOff');
    }
    if (hapBtn) {
      hapBtn.className = 'lang-btn' + (hapticsEnabled ? ' active' : '');
      hapBtn.innerHTML = hapticsEnabled ? t('hapticsOn') : t('hapticsOff');
    }
  }

  function getStrokePaint(colorIndex) {
    if (royalMode) return 'url(#metal-' + colorIndex + ')';
    return userColors[colorIndex];
  }

  function getFillPaint(colorIndex, fillType) {
    if (fillType === 0) return 'none';
    if (fillType === 1) return 'url(#hatch-' + colorIndex + ')';
    if (royalMode) return 'url(#metal-' + colorIndex + ')';
    return userColors[colorIndex];
  }

  function buildImpossibleLogoSVG() {
    var s0 = getShapeDefById(selectedShapes[0] || Cfg.DEFAULT_SHAPES[0]);
    var s1 = getShapeDefById(selectedShapes[1] || Cfg.DEFAULT_SHAPES[1]);
    var s2 = getShapeDefById(selectedShapes[2] || Cfg.DEFAULT_SHAPES[2]);

    return (
      '<svg viewBox="0 0 100 100" style="width: 100%; height: 100%; display: block;">' +
        '<g transform="translate(30, 4) scale(0.8)">' + s0.gen(getStrokePaint(0), 'none') + '</g>' +
        '<g transform="translate(8, 46) scale(0.8)">' + s1.gen(getStrokePaint(1), getFillPaint(1, 2)) + '</g>' +
        '<g transform="translate(52, 46) scale(0.8)">' + s2.gen(getStrokePaint(2), 'url(#hatch-2)') + '</g>' +
      '</svg>'
    );
  }

  function updateLogos() {
    var html = buildImpossibleLogoSVG();
    var headerLogo = document.getElementById('header-logo');
    if (headerLogo) headerLogo.innerHTML = html;
    var endLogo = document.getElementById('end-logo');
    if (endLogo) endLogo.innerHTML = html;
  }

  function applyThemeMode() {
    var metaTheme = document.getElementById('meta-theme-color');
    if (royalMode) {
      document.body.classList.add('royal-mode');
      if (metaTheme) metaTheme.setAttribute('content', '#0f172a');
    } else {
      document.body.classList.remove('royal-mode');
      if (metaTheme) metaTheme.setAttribute('content', '#f0f2f5');
    }
    var royalInfo = document.getElementById('royal-active-info');
    var customColorsBox = document.getElementById('custom-colors-box');
    if (royalInfo) royalInfo.style.display = royalMode ? 'block' : 'none';
    if (customColorsBox) customColorsBox.style.display = royalMode ? 'none' : 'block';
  }

  function updateUnlockUI() {
    var countEl = document.getElementById('perfect-count-display');
    if (countEl) countEl.textContent = perfectGamesCount;

    var goldBtn = document.getElementById('preset-gold');
    if (goldBtn) {
      goldBtn.style.display = (perfectGamesCount >= 3) ? 'inline-block' : 'none';
    }

    var hintBox = document.getElementById('unlock-hint-box');
    if (hintBox) {
      if (perfectGamesCount >= 3) {
        hintBox.style.display = 'none';
      } else {
        hintBox.style.display = 'block';
        hintBox.style.background = '';
        hintBox.style.borderColor = '';
        hintBox.style.color = '';
        hintBox.innerHTML = t('unlockHintDefault');
      }
    }

    applyThemeMode();
  }

  function updateHelpContent() {
    var bodyEl = document.getElementById('help-body');
    if (!bodyEl || selectedShapes.length < 3) return;
    var n0 = getShapeName(selectedShapes[0]).toLowerCase();
    var n1 = getShapeName(selectedShapes[1]).toLowerCase();
    var n2 = getShapeName(selectedShapes[2]).toLowerCase();
    var shapesListStr = n0 + ', ' + n1 + ' ' + t('helpOr') + ' ' + n2;
    var pack = Cfg.I18N[currentLang] || Cfg.I18N.en;
    bodyEl.innerHTML = pack.buildHelpHtml(shapesListStr);
  }

  function checkColorContrast() {
    var warnEl = document.getElementById('color-warning');
    if (!warnEl) return;
    if (royalMode) {
      warnEl.style.display = 'none';
      return;
    }

    function hexToRgb(hex) {
      var num = parseInt(hex.replace('#', ''), 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    var rgb = [hexToRgb(userColors[0]), hexToRgb(userColors[1]), hexToRgb(userColors[2])];
    var tooClose = false;
    var tooLight = false;

    for (var i = 0; i < 3; i++) {
      var brightness = (rgb[i].r * 299 + rgb[i].g * 587 + rgb[i].b * 114) / 1000;
      if (brightness > 225) tooLight = true;
    }

    var pairs = [[0, 1], [0, 2], [1, 2]];
    for (var p = 0; p < pairs.length; p++) {
      var a = rgb[pairs[p][0]];
      var b = rgb[pairs[p][1]];
      var dist = Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
      if (dist < 60) tooClose = true;
    }

    if (tooClose && tooLight) {
      warnEl.textContent = t('warnBoth');
      warnEl.style.display = 'block';
    } else if (tooClose) {
      warnEl.textContent = t('warnClose');
      warnEl.style.display = 'block';
    } else if (tooLight) {
      warnEl.textContent = t('warnLight');
      warnEl.style.display = 'block';
    } else {
      warnEl.style.display = 'none';
    }
  }

  function rebuildSvgPatterns() {
    var box = document.getElementById('svg-defs-box');
    if (!box) return;

    var h0 = royalMode ? Cfg.ROYAL_COLORS[0] : userColors[0];
    var h1 = royalMode ? Cfg.ROYAL_COLORS[1] : userColors[1];
    var h2 = royalMode ? Cfg.ROYAL_COLORS[2] : userColors[2];

    box.innerHTML =
      '<svg width="0" height="0"><defs>' +
        '<linearGradient id="metal-0" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#fef08a" />' +
          '<stop offset="45%" stop-color="#f59e0b" />' +
          '<stop offset="100%" stop-color="#b45309" />' +
        '</linearGradient>' +
        '<linearGradient id="metal-1" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#fce7f3" />' +
          '<stop offset="45%" stop-color="#f472b6" />' +
          '<stop offset="100%" stop-color="#be185d" />' +
        '</linearGradient>' +
        '<linearGradient id="metal-2" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" stop-color="#ffffff" />' +
          '<stop offset="50%" stop-color="#cbd5e1" />' +
          '<stop offset="100%" stop-color="#64748b" />' +
        '</linearGradient>' +
        '<pattern id="hatch-0" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="4" stroke="' + h0 + '" stroke-width="2" /></pattern>' +
        '<pattern id="hatch-1" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="4" stroke="' + h1 + '" stroke-width="2" /></pattern>' +
        '<pattern id="hatch-2" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="4" stroke="' + h2 + '" stroke-width="2" /></pattern>' +
      '</defs></svg>';

    for (var i = 0; i < 3; i++) {
      var p = document.getElementById('col-pick-' + i);
      if (p) p.value = userColors[i];
    }
    checkColorContrast();
    updateLogos();
  }

  function renderShapesPicker() {
    var grid = document.getElementById('shapes-grid');
    var counter = document.getElementById('shapes-counter');
    var closeBtn = document.getElementById('btn-close-settings');
    if (!grid) return;

    grid.innerHTML = '';

    for (var i = 0; i < Cfg.ALL_SHAPES.length; i++) {
      (function(sh) {
        var isBonus = (sh.unlockLevel > 0);
        var locked = (perfectGamesCount < sh.unlockLevel);
        var isSelected = (!locked && selectedShapes.indexOf(sh.id) !== -1);
        var item = document.createElement('div');
        var sName = getShapeName(sh.id);

        var cls = 'shape-opt';
        if (locked) {
          cls += ' locked';
        } else {
          if (isBonus) cls += ' bonus-unlocked';
          if (isSelected) cls += ' active';
        }
        item.className = cls;

        var strokeCol;
        if (royalMode) {
          strokeCol = isSelected ? '#fde68a' : (isBonus && !locked ? '#f59e0b' : '#94a3b8');
        } else {
          strokeCol = isSelected ? (isBonus ? '#78350f' : '#1d4ed8') : (isBonus && !locked ? '#d97706' : '#64748b');
        }
        var fillCol = (isSelected && isBonus) ? (royalMode ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.35)') : 'none';
        var labelText = locked
          ? '&#128274; ' + sh.unlockLevel + t('winSuffix')
          : (isBonus ? '&#128081; ' + sName : sName);
        var checkBadge = isSelected ? '<span class="shape-check">&#10003;</span>' : '';

        item.innerHTML =
          checkBadge +
          '<svg viewBox="0 0 50 50">' + sh.gen(strokeCol, fillCol) + '</svg>' +
          '<span>' + labelText + '</span>';

        if (locked) {
          item.onclick = function() {
            triggerHaptic('error');
            var hintBox = document.getElementById('unlock-hint-box');
            if (hintBox && perfectGamesCount < 3) {
              hintBox.style.background = royalMode ? 'rgba(245, 158, 11, 0.18)' : '#fef3c7';
              hintBox.style.borderColor = '#f59e0b';
              hintBox.style.color = royalMode ? '#fde68a' : '#92400e';
              var extraTxt = (sh.id === 'crown') ? t('unlockHintCrownExtra') : '';
              hintBox.innerHTML = t('unlockHintLockedShape')
                .replace('{name}', sName)
                .replace('{level}', sh.unlockLevel)
                .replace('{extra}', extraTxt);
            }
          };
        } else {
          item.onclick = function() {
            triggerHaptic('tap');
            var idx = selectedShapes.indexOf(sh.id);
            if (idx !== -1) {
              selectedShapes.splice(idx, 1);
              playSound('deselect');
            } else {
              if (selectedShapes.length >= 3) {
                selectedShapes.shift();
              }
              selectedShapes.push(sh.id);
              playSound('tap', selectedShapes.length - 1);
            }
            renderShapesPicker();
            if (selectedShapes.length === 3) {
              savePrefs();
              updateHelpContent();
              updateLogos();
              renderBoard();
            }
          };
        }

        grid.appendChild(item);
      })(Cfg.ALL_SHAPES[i]);
    }

    if (counter) {
      counter.textContent = t('selectedCounter').replace('{n}', selectedShapes.length);
      if (royalMode) {
        counter.style.color = (selectedShapes.length === 3) ? '#fde68a' : '#f87171';
      } else {
        counter.style.color = (selectedShapes.length === 3) ? '#16a34a' : '#dc2626';
      }
    }
    if (closeBtn) {
      closeBtn.disabled = (selectedShapes.length !== 3);
    }
  }

  function applyLanguageToUI() {
    document.documentElement.lang = currentLang;
    document.title = t('pageTitle');

    document.getElementById('lbl-found').textContent = t('found');
    document.getElementById('btn-settings').title = t('settingsTooltip');

    document.getElementById('btn-undo').innerHTML = t('btnUndo');
    document.getElementById('btn-undo').title = t('btnUndoTitle');
    document.getElementById('btn-help').textContent = t('btnHelp');
    document.getElementById('btn-hint').textContent = t('btnHint');
    document.getElementById('btn-new').textContent = t('btnNew');

    document.getElementById('confirm-new-title').textContent = t('confirmNewTitle');
    document.getElementById('btn-confirm-cancel').textContent = t('btnConfirmCancel');
    document.getElementById('btn-confirm-yes').textContent = t('btnConfirmYes');

    document.getElementById('settings-title').textContent = t('settingsTitle');
    document.getElementById('lbl-trophies').innerHTML = t('trophiesLabel');
    document.getElementById('lbl-mode-title').textContent = t('modeTitle');
    document.getElementById('mode-classic').innerHTML = t('modeClassicName') + '<small>' + t('modeClassicSub') + '</small>';
    document.getElementById('mode-junior').innerHTML = t('modeJuniorName') + '<small>' + t('modeJuniorSub') + '</small>';
    document.getElementById('mode-puzzle').innerHTML = t('modePuzzleName') + '<small>' + t('modePuzzleSub') + '</small>';

    document.getElementById('lbl-lang-title').textContent = t('langTitle');
    document.getElementById('lbl-feedback-title').textContent = t('feedbackTitle');
    document.getElementById('lbl-shapes-title').textContent = t('shapesTitle');
    document.getElementById('lbl-colors-title').textContent = t('colorsTitle');
    document.getElementById('royal-active-info').innerHTML = t('royalInfo');
    document.getElementById('lbl-puzzle-found').textContent = t('puzzleFoundTitle');

    document.getElementById('lbl-col-0').textContent = t('col0');
    document.getElementById('lbl-col-1').textContent = t('col1');
    document.getElementById('lbl-col-2').textContent = t('col2');

    document.getElementById('preset-0').textContent = t('preset0');
    document.getElementById('preset-1').textContent = t('preset1');
    document.getElementById('preset-2').textContent = t('preset2');
    document.getElementById('preset-gold').innerHTML = t('presetGold');
    document.getElementById('btn-close-settings').textContent = t('btnSaveClose');

    document.getElementById('help-title').textContent = t('helpTitle');
    document.getElementById('btn-close-help').textContent = t('helpClose');
    document.getElementById('btn-end-undo').innerHTML = t('btnEndUndo');
    document.getElementById('btn-play-again').textContent = t('btnPlayAgain');
    document.getElementById('btn-end-close').textContent = t('btnEndClose');

    var csBtn = document.getElementById('lang-cs');
    var enBtn = document.getElementById('lang-en');
    if (csBtn) csBtn.className = 'lang-btn' + (currentLang === 'cs' ? ' active' : '');
    if (enBtn) enBtn.className = 'lang-btn' + (currentLang === 'en' ? ' active' : '');

    updateModeUI();
    updateFeedbackUI();
    updateHelpContent();
    updateUnlockUI();
    checkColorContrast();
    renderShapesPicker();
  }

  function renderSingleSVG(card) {
    var strokePaint = getStrokePaint(card.color);
    var fillPaint = getFillPaint(card.color, card.fill);
    var shapeId = selectedShapes[card.shape] || Cfg.DEFAULT_SHAPES[card.shape];
    var shapeDef = getShapeDefById(shapeId);
    var shapeEl = shapeDef.gen(strokePaint, fillPaint);
    return '<svg class="sym" viewBox="0 0 50 50">' + shapeEl + '</svg>';
  }

  function renderCardContent(card) {
    var s = renderSingleSVG(card);
    if (card.count === 1) {
      return '<div class="symbols-row">' + s + '</div>';
    } else if (card.count === 2) {
      return '<div class="symbols-row">' + s + '</div><div class="symbols-row">' + s + '</div>';
    } else {
      return '<div class="symbols-row">' + s + '</div><div class="symbols-row">' + s + s + '</div>';
    }
  }

  function renderMiniCardHTML(card) {
    var single = renderSingleSVG(card);
    var inner = '';
    for (var c = 0; c < card.count; c++) inner += single;
    return '<div class="mini-card cnt-' + card.count + '">' + inner + '</div>';
  }

  function renderPuzzlePanel() {
    var panel = document.getElementById('puzzle-found-panel');
    var slotsEl = document.getElementById('puzzle-slots');
    var ratioEl = document.getElementById('puzzle-found-ratio');
    if (!panel || !slotsEl || !ratioEl) return;

    if (S.gameMode !== 'puzzle') {
      panel.style.display = 'none';
      return;
    }

    panel.style.display = 'block';
    var total = S.puzzleAllSets.length;
    ratioEl.textContent = S.puzzleFoundSets.length + ' / ' + total;
    slotsEl.innerHTML = '';

    for (var i = 0; i < total; i++) {
      var slotDiv = document.createElement('div');
      if (i < S.puzzleFoundSets.length) {
        slotDiv.className = 'puzzle-slot filled';
        var triple = S.puzzleFoundSets[i];
        slotDiv.innerHTML =
          renderMiniCardHTML(S.board[triple[0]]) +
          renderMiniCardHTML(S.board[triple[1]]) +
          renderMiniCardHTML(S.board[triple[2]]);
      } else {
        slotDiv.className = 'puzzle-slot';
        slotDiv.innerHTML = '<span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">#' + (i + 1) + '</span>';
      }
      slotsEl.appendChild(slotDiv);
    }
  }

  function syncCardHeights() {
    var boardEl = document.getElementById('board');
    if (!boardEl) return;
    var cards = boardEl.getElementsByClassName('card');
    if (cards.length > 0) {
      var w = cards[0].getBoundingClientRect().width;
      if (w > 0) {
        for (var i = 0; i < cards.length; i++) {
          cards[i].style.height = w + 'px';
        }
      }
    }
  }

  function renderBoard() {
    var boardEl = document.getElementById('board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    boardEl.className = 'board' + (S.gameMode === 'junior' ? ' grid-3x3' : '');

    var slotCount = Eng.getBoardSlotCount();
    for (var i = 0; i < slotCount; i++) {
      (function(idx) {
        var card = S.board[idx];
        var div = document.createElement('div');

        if (!card) {
          div.className = 'card empty';
        } else {
          var cls = 'card';
          if (S.flashOkIndices.indexOf(idx) !== -1) {
            cls += ' flash-ok';
          } else if (S.hintIndices.indexOf(idx) !== -1) {
            cls += ' hint';
          } else if (S.selectedIndices.indexOf(idx) !== -1) {
            cls += ' selected';
          }
          div.className = cls;

          var wrap = document.createElement('div');
          wrap.className = 'symbols-wrap';
          wrap.innerHTML = renderCardContent(card);
          div.appendChild(wrap);

          div.onclick = function() { onCardClick(idx); };
        }

        boardEl.appendChild(div);
      })(i);
    }

    syncCardHeights();

    var rightStatEl = document.getElementById('header-right-stat');
    if (S.gameMode === 'puzzle') {
      document.getElementById('score').textContent = S.score + '/' + S.puzzleAllSets.length;
      if (rightStatEl) {
        rightStatEl.innerHTML = '<span>' + t('puzzleCards') + '</span>: <span>16</span>';
      }
    } else {
      document.getElementById('score').textContent = S.score;
      if (rightStatEl) {
        rightStatEl.innerHTML = '<span id="lbl-deck">' + t('deck') + '</span>: <span id="deck-count">' + S.deck.length + '</span>';
      }
    }

    renderPuzzlePanel();

    var undoBtn = document.getElementById('btn-undo');
    if (undoBtn) {
      undoBtn.disabled = (S.isGameOver || S.historyStack.length === 0);
    }
  }

  function launchSymbolConfetti() {
    var layer = document.getElementById('confetti-layer');
    if (!layer) return;
    layer.innerHTML = '';
    for (var i = 0; i < 36; i++) {
      var shId = selectedShapes[i % 3] || Cfg.DEFAULT_SHAPES[i % 3];
      var shDef = getShapeDefById(shId);
      var cIdx = (i + 1) % 3;
      var stroke = getStrokePaint(cIdx);
      var fill = getFillPaint(cIdx, i % 3);

      var div = document.createElement('div');
      div.className = 'confetti-sym';
      div.style.left = Math.floor(Math.random() * 94) + '%';
      div.style.animationDuration = (2.2 + Math.random() * 2.2) + 's';
      div.style.animationDelay = (Math.random() * 0.8) + 's';
      div.innerHTML = '<svg viewBox="0 0 50 50" style="width:100%;height:100%;">' + shDef.gen(stroke, fill) + '</svg>';
      layer.appendChild(div);
    }
  }

  function closeEndModal() {
    document.getElementById('end-overlay').style.display = 'none';
    document.getElementById('confetti-layer').innerHTML = '';
    if (S.isGameOver) {
      setStatus(t('msgGameFinished'));
    }
  }

  function showEndModal(isPerfect, remainingCount) {
    S.isGameOver = true;
    S.historyStack = [];
    saveGameState();
    renderBoard();

    updateLogos();
    var logoBox = document.getElementById('end-logo');
    var badge = document.getElementById('end-perfect-badge');
    var title = document.getElementById('end-title');
    var subtitle = document.getElementById('end-subtitle');
    var scoreLine = document.getElementById('end-score-line');
    var rewardBox = document.getElementById('end-reward-box');
    var endUndoBtn = document.getElementById('btn-end-undo');

    var maxScore = Eng.getMaxPossibleScore();
    scoreLine.textContent = t('endScoreLine').replace('{score}', S.score).replace('{max}', maxScore);
    if (endUndoBtn) endUndoBtn.style.display = 'none';

    if (S.gameMode === 'puzzle') {
      triggerHaptic('win');
      playSound('win');
      logoBox.className = 'end-logo-box perfect';
      badge.innerHTML = t('endPuzzleBadge');
      badge.style.display = 'inline-block';
      title.textContent = t('endPuzzleTitle');
      subtitle.textContent = t('endPuzzleSub').replace('{tot}', maxScore);
      rewardBox.style.display = 'none';
      launchSymbolConfetti();
    } else if (S.gameMode === 'junior') {
      if (isPerfect) {
        triggerHaptic('win');
        playSound('win');
        logoBox.className = 'end-logo-box perfect';
        badge.innerHTML = t('endJuniorPerfectBadge');
        badge.style.display = 'inline-block';
        title.textContent = t('endJuniorPerfectTitle');
        subtitle.textContent = t('endJuniorPerfectSub');
        rewardBox.style.display = 'block';
        rewardBox.innerHTML = t('endJuniorNote');
        launchSymbolConfetti();
      } else {
        logoBox.className = 'end-logo-box';
        badge.style.display = 'none';
        title.textContent = t('endNormalTitle');
        subtitle.textContent = t('endNormalSub').replace('{n}', remainingCount);
        rewardBox.style.display = 'none';
      }
    } else {
      if (isPerfect) {
        triggerHaptic('win');
        playSound('win');
        perfectGamesCount++;
        savePrefs();
        updateUnlockUI();

        logoBox.className = 'end-logo-box perfect';
        badge.innerHTML = t('endPerfectBadge');
        badge.style.display = 'inline-block';
        title.textContent = t('endPerfectTitle');
        subtitle.textContent = t('endPerfectSub');

        rewardBox.style.display = 'block';
        if (perfectGamesCount === 1) {
          rewardBox.innerHTML = t('reward1');
        } else if (perfectGamesCount === 2) {
          rewardBox.innerHTML = t('reward2');
        } else if (perfectGamesCount === 3) {
          rewardBox.innerHTML = t('reward3');
        } else {
          rewardBox.innerHTML = t('rewardMore').replace('{n}', perfectGamesCount);
        }

        launchSymbolConfetti();
      } else {
        logoBox.className = 'end-logo-box';
        badge.style.display = 'none';
        title.textContent = t('endNormalTitle');
        subtitle.textContent = t('endNormalSub').replace('{n}', remainingCount);
        rewardBox.style.display = 'none';
      }
    }

    document.getElementById('end-overlay').style.display = 'flex';
  }

  function handleBoardValidationResult(res) {
    if (!res) return;
    if (res.reshuffled) {
      playSound('deal');
      setStatus(t('msgReshuffle'), 'info');
    }
    if (res.ended) {
      showEndModal(res.isPerfect, res.remainingCount);
    }
  }
  
  function onCardClick(index) {
    if (S.isGameOver) return;
    var pos = S.selectedIndices.indexOf(index);
    if (pos !== -1) {
      S.selectedIndices.splice(pos, 1);
      S.hintIndices = S.hintIndices.filter(function(h) { return h !== index; });
      triggerHaptic('deselect');
      playSound('deselect');
      renderBoard();
      return;
    }

    S.selectedIndices.push(index);

    if (S.selectedIndices.length < 3) {
      triggerHaptic('tap');
      playSound('tap', S.selectedIndices.length - 1);
      renderBoard();
      return;
    }

    if (S.selectedIndices.length === 3) {
      var i1 = S.selectedIndices[0];
      var i2 = S.selectedIndices[1];
      var i3 = S.selectedIndices[2];

      if (Eng.isSet(S.board[i1], S.board[i2], S.board[i3])) {
        if (S.gameMode === 'puzzle') {
          var sortedTriple = Eng.sortTriple([i1, i2, i3]);
          if (Eng.isPuzzleTripleAlreadyFound(sortedTriple)) {
            triggerHaptic('deselect');
            playSound('deselect');
            setStatus(t('msgPuzzleAlready'), 'info');
            S.selectedIndices = [];
            S.hintIndices = [];
          } else {
            Eng.pushHistorySnapshot();
            S.puzzleFoundSets.push(sortedTriple);
            S.score = S.puzzleFoundSets.length;
            S.selectedIndices = [];
            S.hintIndices = [];
            S.hintCursor = -1;

            S.flashOkIndices = [i1, i2, i3];
            if (flashTimeout) clearTimeout(flashTimeout);
            flashTimeout = setTimeout(function() {
              S.flashOkIndices = [];
              renderBoard();
            }, 550);

            if (S.puzzleFoundSets.length >= S.puzzleAllSets.length) {
              showEndModal(true, 0);
            } else {
              triggerHaptic('match');
              playSound('match');
              setStatus(
                t('msgPuzzleFoundOk').replace('{cur}', S.puzzleFoundSets.length).replace('{tot}', S.puzzleAllSets.length),
                'ok'
              );
              saveGameState();
            }
          }
        } else {
          Eng.pushHistorySnapshot();
          S.score++;
          S.board[i1] = null;
          S.board[i2] = null;
          S.board[i3] = null;
          S.selectedIndices = [];
          S.hintIndices = [];
          S.hintCursor = -1;

          var valRes = Eng.ensureValidBoard();
          if (!valRes.ended) {
            triggerHaptic('match');
            playSound('match');
            if (valRes.reshuffled) {
              setStatus(t('msgReshuffle'), 'info');
            } else {
              setStatus(t('msgSetOk'), 'ok');
            }
          } else {
            showEndModal(valRes.isPerfect, valRes.remainingCount);
          }
          saveGameState();
        }
      } else {
        triggerHaptic('error');
        playSound('error');
        setStatus(t('msgSetErr'), 'err');
        S.selectedIndices = [];
        S.hintIndices = [];
      }
    }

    renderBoard();
  }

  function startNewGame() {
    document.getElementById('confirm-new-overlay').style.display = 'none';
    closeEndModal();
    var res = Eng.startNewGame();
    playSound('deal');
    setStatus(getDefaultStatusText());
    handleBoardValidationResult(res);
    saveGameState();
    renderBoard();
  }
  
  function requestNewGame() {
    triggerHaptic('tap');
    if (!S.isGameOver && S.score > 0) {
      var maxScore = Eng.getMaxPossibleScore();
      document.getElementById('confirm-new-text').textContent = t('confirmNewText')
        .replace('{score}', S.score)
        .replace('{max}', maxScore);
      document.getElementById('confirm-new-overlay').style.display = 'flex';
    } else {
      startNewGame();
    }
  }

  function undoLastMove() {
    if (!Eng.undoLastMove()) return;
    triggerHaptic('deselect');
    playSound('deselect');
    closeEndModal();
    setStatus(t('msgUndo'), 'info');
    saveGameState();
    renderBoard();
  }

  function switchGameMode(newMode) {
    if (S.gameMode === newMode) return;
    triggerHaptic('tap');
    playSound('tap', 1);
    S.gameMode = newMode;
    savePrefs();
    updateModeUI();
    startNewGame();
  }

  function bindEvents() {
    document.getElementById('mode-classic').onclick = function() { switchGameMode('classic'); };
    document.getElementById('mode-junior').onclick = function() { switchGameMode('junior'); };
    document.getElementById('mode-puzzle').onclick = function() { switchGameMode('puzzle'); };

    document.getElementById('lang-cs').onclick = function() {
      triggerHaptic('tap');
      currentLang = 'cs';
      savePrefs();
      applyLanguageToUI();
      setStatus(getDefaultStatusText());
      renderBoard();
    };

    document.getElementById('lang-en').onclick = function() {
      triggerHaptic('tap');
      currentLang = 'en';
      savePrefs();
      applyLanguageToUI();
      setStatus(getDefaultStatusText());
      renderBoard();
    };

    document.getElementById('toggle-sound').onclick = function() {
      soundEnabled = !soundEnabled;
      savePrefs();
      updateFeedbackUI();
      if (soundEnabled) playSound('tap', 2);
    };

    document.getElementById('toggle-haptics').onclick = function() {
      hapticsEnabled = !hapticsEnabled;
      savePrefs();
      updateFeedbackUI();
      if (hapticsEnabled) triggerHaptic('match');
    };

    for (var cIdx = 0; cIdx < 3; cIdx++) {
      (function(colorIdx) {
        var picker = document.getElementById('col-pick-' + colorIdx);
        if (picker) {
          picker.oninput = function(e) {
            royalMode = false;
            userColors[colorIdx] = e.target.value;
            applyThemeMode();
            rebuildSvgPatterns();
            renderShapesPicker();
            savePrefs();
            renderBoard();
          };
        }
      })(cIdx);
    }

    for (var pIdx = 0; pIdx < 3; pIdx++) {
      (function(presetIdx) {
        var btn = document.getElementById('preset-' + presetIdx);
        if (btn) {
          btn.onclick = function() {
            triggerHaptic('tap');
            royalMode = false;
            var pal = Cfg.PRESET_PALETTES[presetIdx];
            userColors = [pal[0], pal[1], pal[2]];
            applyThemeMode();
            rebuildSvgPatterns();
            renderShapesPicker();
            savePrefs();
            renderBoard();
          };
        }
      })(pIdx);
    }

    var goldBtn = document.getElementById('preset-gold');
    if (goldBtn) {
      goldBtn.onclick = function() {
        triggerHaptic('match');
        playSound('match');
        royalMode = true;
        applyThemeMode();
        rebuildSvgPatterns();
        renderShapesPicker();
        savePrefs();
        renderBoard();
      };
    }

    var secretTapCount = 0;
    var secretTapTimer = null;
    document.getElementById('settings-title').onclick = function() {
      secretTapCount++;
      clearTimeout(secretTapTimer);
      secretTapTimer = setTimeout(function() { secretTapCount = 0; }, 1500);
      if (secretTapCount >= 5) {
        secretTapCount = 0;
        document.getElementById('settings-overlay').style.display = 'none';
        S.gameMode = 'classic';
        savePrefs();
        updateModeUI();
        S.score = 27;
        S.deck = [];
        S.board = [];
        for (var i = 0; i < 16; i++) S.board.push(null);
        showEndModal(true, 0);
      }
    };

    var resetTapCount = 0;
    var resetTapTimer = null;
    document.getElementById('trophy-banner').onclick = function() {
      resetTapCount++;
      clearTimeout(resetTapTimer);
      resetTapTimer = setTimeout(function() { resetTapCount = 0; }, 1500);
      if (resetTapCount >= 5) {
        resetTapCount = 0;
        triggerHaptic('error');
        perfectGamesCount = 0;
        royalMode = false;
        selectedShapes = [Cfg.DEFAULT_SHAPES[0], Cfg.DEFAULT_SHAPES[1], Cfg.DEFAULT_SHAPES[2]];
        savePrefs();
        updateUnlockUI();
        rebuildSvgPatterns();
        renderShapesPicker();
        updateHelpContent();
        updateLogos();
        renderBoard();
      }
    };

    document.getElementById('btn-settings').onclick = function() {
      triggerHaptic('tap');
      rebuildSvgPatterns();
      updateModeUI();
      updateFeedbackUI();
      updateUnlockUI();
      renderShapesPicker();
      document.getElementById('settings-overlay').style.display = 'flex';
    };

    document.getElementById('btn-close-settings').onclick = function() {
      if (selectedShapes.length === 3) {
        triggerHaptic('tap');
        document.getElementById('settings-overlay').style.display = 'none';
      }
    };

    document.getElementById('settings-overlay').onclick = function(e) {
      if (e.target === this && selectedShapes.length === 3) {
        this.style.display = 'none';
      }
    };

    document.getElementById('btn-undo').onclick = undoLastMove;
    document.getElementById('btn-end-undo').onclick = undoLastMove;

    document.getElementById('btn-hint').onclick = function() {
      if (S.isGameOver) return;
      var sets = (S.gameMode === 'puzzle') ? Eng.getRemainingPuzzleSets() : Eng.findAllSetsOnBoard();
      if (sets.length > 0) {
        triggerHaptic('tap');
        playSound('tap', 1);
        S.hintCursor = (S.hintCursor + 1) % sets.length;
        var currentSet = sets[S.hintCursor];
        S.hintIndices = [currentSet[0], currentSet[1]];
        S.selectedIndices = [currentSet[0], currentSet[1]];
        setStatus(
          t('msgHint').replace('{cur}', S.hintCursor + 1).replace('{tot}', sets.length),
          'info'
        );
        renderBoard();
      }
    };

    document.getElementById('btn-help').onclick = function() {
      triggerHaptic('tap');
      updateHelpContent();
      document.getElementById('help-overlay').style.display = 'flex';
    };

    document.getElementById('btn-close-help').onclick = function() {
      triggerHaptic('tap');
      document.getElementById('help-overlay').style.display = 'none';
    };

    document.getElementById('help-overlay').onclick = function(e) {
      if (e.target === this) this.style.display = 'none';
    };

    document.getElementById('btn-new').onclick = requestNewGame;
    document.getElementById('btn-confirm-yes').onclick = function() {
      triggerHaptic('tap');
      startNewGame();
    };
    document.getElementById('btn-confirm-cancel').onclick = function() {
      triggerHaptic('tap');
      document.getElementById('confirm-new-overlay').style.display = 'none';
    };
    document.getElementById('confirm-new-overlay').onclick = function(e) {
      if (e.target === this) this.style.display = 'none';
    };

    document.getElementById('btn-play-again').onclick = function() {
      triggerHaptic('tap');
      startNewGame();
    };
    document.getElementById('btn-end-close').onclick = function() {
      triggerHaptic('tap');
      closeEndModal();
    };
    document.getElementById('end-overlay').onclick = function(e) {
      if (e.target === this) closeEndModal();
    };

    window.onresize = syncCardHeights;
  }

  async function init() {
    bindEvents();
    await loadPrefs();
    applyLanguageToUI();
    rebuildSvgPatterns();

    if (await loadGameState()) {
      if (!S.isGameOver) {
        setStatus(t('msgResume'), 'info');
      } else {
        setStatus(getDefaultStatusText());
      }
      if (S.gameMode !== 'puzzle') {
        var res = Eng.ensureValidBoard();
        handleBoardValidationResult(res);
      }
      renderBoard();
    } else {
      startNewGame();
    }
  }

  return {
    init: init
  };
})();

window.onload = function() {
  window.Diffequa.App.init();
};
