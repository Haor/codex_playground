const STORAGE_KEYS = {
  theme: 'fret-compass-theme',
  settings: 'fret-compass-settings',
  history: 'fret-compass-history',
  mistakes: 'fret-compass-mistakes',
};

const DEFAULT_SETTINGS = {
  questionCount: 10,
  includeNoteLetter: true,
  includeScaleDegree: true,
  includeSolfege: true,
  includeOctave: false,
  showFretHint: true,
  enableTimer: true,
  shuffleOptions: true,
  key: 'C 大调',
};

const KEY_LIBRARY = buildKeyLibrary();

const SOLFEGE_LABELS = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];

const OPTION_FALLBACKS = {
  noteLetter: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'F#', 'G#', 'Bb'],
  scaleDegree: ['1', '2', '3', '4', '5', '6', '7'],
  solfege: SOLFEGE_LABELS,
};

const STRINGS_META = [
  { name: '一弦', openNote: 'E4', pitchClass: 4 },
  { name: '二弦', openNote: 'B3', pitchClass: 11 },
  { name: '三弦', openNote: 'G3', pitchClass: 7 },
  { name: '四弦', openNote: 'D3', pitchClass: 2 },
  { name: '五弦', openNote: 'A2', pitchClass: 9 },
  { name: '六弦', openNote: 'E2', pitchClass: 4 },
];

const state = {
  theme: 'light',
  settings: { ...DEFAULT_SETTINGS },
  history: [],
  mistakes: {},
  session: null,
  hoverPause: false,
  pendingCustomStart: false,
};

const dom = {};

function buildKeyLibrary() {
  const NOTE_TO_PITCH = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    'E#': 5,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
    'B#': 0,
  };
  const definitions = {
    'C 大调': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G 大调': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'D 大调': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'A 大调': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'E 大调': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    'B 大调': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
    'F# 大调': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
    'C# 大调': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
  };
  const result = {};
  Object.entries(definitions).forEach(([key, notes]) => {
    result[key] = notes.map((note, index) => ({
      id: `${key}-${note}-${index}`,
      noteLetter: note,
      scaleDegree: String(index + 1),
      solfege: SOLFEGE_LABELS[index],
      octave: index < 3 ? 4 : index < 5 ? 5 : 6,
      pitchClass: NOTE_TO_PITCH[note],
    }));
  });
  return result;
}

function initDom() {
  dom.body = document.body;
  dom.html = document.documentElement;
  dom.themeToggle = document.querySelector('#themeToggle');
  dom.keySelect = document.querySelector('#keySelect');
  dom.historyButton = document.querySelector('#historyButton');
  dom.settingsButton = document.querySelector('#settingsButton');
  dom.dataButton = document.querySelector('#dataButton');
  dom.endSessionButton = document.querySelector('#endSessionButton');
  dom.workspace = document.querySelector('#workspace');
  dom.summaryToggle = document.querySelector('#summaryToggle');
  dom.lastSummary = document.querySelector('#lastSummary');
  dom.toastContainer = document.querySelector('#toastContainer');
  dom.settingsDrawer = document.querySelector('#settingsDrawer');
  dom.settingsForm = document.querySelector('#settingsForm');
  dom.customQuantity = document.querySelector('#customQuantity');
  dom.historyModal = document.querySelector('#historyModal');
  dom.historyList = document.querySelector('#historyList');
  dom.dataModal = document.querySelector('#dataModal');
  dom.dataStats = document.querySelector('#dataStats');
  dom.dataPreview = document.querySelector('#dataPreview');
  dom.importInput = document.querySelector('#importInput');
  dom.exportButton = document.querySelector('#exportButton');
  dom.viewMistakesButton = document.querySelector('#viewMistakesButton');
  dom.viewHistoryButton = document.querySelector('#viewHistoryButton');
  dom.clearMistakesButton = document.querySelector('#clearMistakesButton');
  dom.seedMistakesButton = document.querySelector('#seedMistakesButton');
  dom.clearHistoryButton = document.querySelector('#clearHistoryButton');
  dom.clearAllButton = document.querySelector('#clearAllButton');
  dom.sessionSummary = document.querySelector('#sessionSummary');
  dom.questionTag = document.querySelector('#questionTag');
  dom.questionTimer = document.querySelector('#questionTimer');
  dom.questionPrompt = document.querySelector('#questionPrompt');
  dom.optionButtons = Array.from(document.querySelectorAll('.option-button'));
  dom.questionFeedback = document.querySelector('#questionFeedback');
  dom.fretboard = document.querySelector('#fretboard');
  dom.fretboardCard = document.querySelector('.fretboard-card');
  dom.fretboardHint = document.querySelector('#fretboardHint');
  dom.fretboardCaption = document.querySelector('#fretboardCaption');
  dom.mistakeList = document.querySelector('#mistakeList');
  dom.markMastered = document.querySelector('#markMastered');
  dom.sessionMode = document.querySelector('#sessionMode');
  dom.sessionProgress = document.querySelector('#sessionProgress');
  dom.sessionKey = document.querySelector('#sessionKey');
  dom.sessionAccuracy = document.querySelector('#sessionAccuracy');
  dom.sessionStreak = document.querySelector('#sessionStreak');
  dom.sessionAverage = document.querySelector('#sessionAverage');
}

const toast = (() => {
  let timer;
  return {
    show(message, duration = 3200) {
      clearTimeout(timer);
      const el = document.createElement('div');
      el.className = 'toast show';
      el.textContent = message;
      dom.toastContainer.innerHTML = '';
      dom.toastContainer.appendChild(el);
      timer = setTimeout(() => this.hide(), duration);
    },
    hide() {
      dom.toastContainer.innerHTML = '';
    },
  };
})();

function loadPersistedState() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme) state.theme = savedTheme;
    const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || 'null');
    if (savedSettings) state.settings = { ...DEFAULT_SETTINGS, ...savedSettings };
    if (!state.settings.key) state.settings.key = 'C 大调';
    const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    if (Array.isArray(savedHistory)) state.history = savedHistory.slice(0, 30);
    const savedMistakes = JSON.parse(localStorage.getItem(STORAGE_KEYS.mistakes) || '{}');
    if (savedMistakes && typeof savedMistakes === 'object') state.mistakes = savedMistakes;
  } catch (error) {
    console.warn('读取本地数据失败，使用默认值。', error);
    state.settings = { ...DEFAULT_SETTINGS };
    state.history = [];
    state.mistakes = {};
  }
}

function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function persistHistory() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history.slice(0, 30)));
}

function persistMistakes() {
  localStorage.setItem(STORAGE_KEYS.mistakes, JSON.stringify(state.mistakes));
}

function persistTheme() {
  localStorage.setItem(STORAGE_KEYS.theme, state.theme);
}

function applyTheme(theme) {
  state.theme = theme;
  dom.html.setAttribute('data-theme', theme);
  dom.body.setAttribute('data-theme', theme);
  dom.themeToggle.setAttribute('aria-pressed', theme === 'dark');
  dom.themeToggle.textContent = theme === 'dark' ? '日间模式' : '夜间模式';
  persistTheme();
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function populateSettingsForm() {
  const { settings } = state;
  const form = dom.settingsForm;
  form.reset();
  if (settings.key) {
    dom.keySelect.value = settings.key;
  }
  const radios = form.elements['questionCount'];
  Array.from(radios).forEach((radio) => {
    radio.checked = Number(radio.value) === Number(settings.questionCount);
  });
  if (![10, 20, 30].includes(settings.questionCount)) {
    dom.customQuantity.value = settings.questionCount;
  }
  ['includeNoteLetter', 'includeScaleDegree', 'includeSolfege', 'includeOctave', 'showFretHint', 'enableTimer', 'shuffleOptions'].forEach((name) => {
    form.elements[name].checked = !!settings[name];
  });
}

function closeDrawer(resetPending = true) {
  dom.settingsDrawer.setAttribute('aria-hidden', 'true');
  dom.settingsButton.setAttribute('aria-expanded', 'false');
  if (resetPending) {
    state.pendingCustomStart = false;
  }
}

function openDrawer() {
  dom.settingsDrawer.setAttribute('aria-hidden', 'false');
  dom.settingsButton.setAttribute('aria-expanded', 'true');
}

function bindEvents() {
  dom.themeToggle.addEventListener('click', toggleTheme);
  dom.keySelect.addEventListener('change', (event) => {
    const key = event.target.value;
    state.settings.key = key;
    persistSettings();
    if (state.session) {
      updateSessionKey(key);
    } else {
      toast.show(`已切换到 ${key}`);
    }
  });

  document.querySelectorAll('.mode-trigger').forEach((btn) => {
    btn.addEventListener('click', () => handleModeTrigger(btn.closest('.mode-card').dataset.mode));
  });

  dom.summaryToggle.addEventListener('click', () => {
    const expanded = dom.summaryToggle.getAttribute('aria-expanded') === 'true';
    dom.summaryToggle.setAttribute('aria-expanded', String(!expanded));
    dom.lastSummary.hidden = expanded;
  });

  dom.settingsButton.addEventListener('click', openDrawer);
  dom.settingsDrawer.addEventListener('click', (event) => {
    if (event.target === dom.settingsDrawer || event.target.dataset.close === 'settingsDrawer') {
      closeDrawer();
    }
  });

  dom.settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(dom.settingsForm);
    let questionCount = Number(formData.get('questionCount'));
    const customValue = Number(dom.customQuantity.value);
    if (!Number.isNaN(customValue) && customValue >= 5 && customValue <= 200 && customValue % 5 === 0) {
      questionCount = customValue;
    }
    const includes = ['includeNoteLetter', 'includeScaleDegree', 'includeSolfege'];
    const activeFields = includes.filter((name) => formData.get(name) === 'on');
    if (activeFields.length < 2) {
      toast.show('请至少保留两种题目内容。');
      return;
    }
    state.settings = {
      ...state.settings,
      questionCount,
      includeNoteLetter: formData.get('includeNoteLetter') === 'on',
      includeScaleDegree: formData.get('includeScaleDegree') === 'on',
      includeSolfege: formData.get('includeSolfege') === 'on',
      includeOctave: formData.get('includeOctave') === 'on',
      showFretHint: formData.get('showFretHint') === 'on',
      enableTimer: formData.get('enableTimer') === 'on',
      shuffleOptions: formData.get('shuffleOptions') === 'on',
    };
    persistSettings();
    toast.show('设置已保存。');
    if (state.pendingCustomStart) {
      state.pendingCustomStart = false;
      startSession({ mode: '定制模式', questionCount: state.settings.questionCount });
    }
    closeDrawer(false);
  });

  dom.historyButton.addEventListener('click', () => {
    updateHistoryModal();
    dom.historyModal.showModal();
  });

  dom.dataButton.addEventListener('click', () => {
    updateDataStats();
    dom.dataModal.showModal();
  });

  dom.importInput.addEventListener('change', handleImportData);
  dom.exportButton.addEventListener('click', handleExportData);
  dom.viewMistakesButton.addEventListener('click', () => showDataPreview('mistakes'));
  dom.viewHistoryButton.addEventListener('click', () => showDataPreview('history'));
  dom.clearMistakesButton.addEventListener('click', clearMistakes);
  dom.seedMistakesButton.addEventListener('click', seedTestMistakes);
  dom.clearHistoryButton.addEventListener('click', clearHistory);
  dom.clearAllButton.addEventListener('click', clearAllData);

  dom.endSessionButton.addEventListener('click', () => {
    if (state.session) {
      endSession({ aborted: true });
    } else {
      toast.show('当前没有正在进行的练习。');
    }
  });

  dom.markMastered.addEventListener('click', () => {
    const key = getCurrentKey();
    const list = state.mistakes[key] || [];
    if (!list.length) {
      toast.show('当前调性暂无错题。');
      return;
    }
    if (confirm('确认将当前调性的错题标记为已掌握吗？')) {
      state.mistakes[key] = [];
      persistMistakes();
      updateMistakePreview();
      toast.show('已清空当前调性的错题。');
    }
  });

  dom.optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleAnswer(btn.dataset.index));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!dom.settingsDrawer.getAttribute('aria-hidden') || dom.settingsDrawer.getAttribute('aria-hidden') === 'false') {
        closeDrawer();
        return;
      }
      if (dom.dataModal.open) {
        dom.dataModal.close();
        return;
      }
      if (dom.historyModal.open) {
        dom.historyModal.close();
      }
    }
  });

  dom.fretboardCard.addEventListener('mouseenter', () => {
    state.hoverPause = true;
  });
  dom.fretboardCard.addEventListener('mouseleave', () => {
    state.hoverPause = false;
    if (state.session && state.session.pendingAdvance) {
      state.session.resumeCountdownAt = performance.now() + 500;
    }
  });
}

function handleModeTrigger(mode) {
  switch (mode) {
    case 'sprint':
      startSession({ mode: '冲刺模式', questionCount: 10 });
      break;
    case 'endless':
      startSession({ mode: '无限模式', questionCount: Infinity });
      break;
    case 'custom':
      state.pendingCustomStart = true;
      openDrawer();
      toast.show('请在设置中保存后开始定制练习。');
      break;
    case 'mistakes':
      startMistakeSession();
      break;
    default:
      break;
  }
}

function startMistakeSession() {
  const key = getCurrentKey();
  const list = state.mistakes[key] || [];
  if (!list.length) {
    toast.show('暂无错题可回放。');
    return;
  }
  startSession({ mode: '错题回放', questionCount: list.length, source: 'mistakes' });
}

function getCurrentKey() {
  return state.settings.key || dom.keySelect.value;
}

function startSession({ mode, questionCount, source }) {
  if (state.session) {
    endSession({ aborted: true, silent: true });
  }
  const key = getCurrentKey();
  state.settings.key = key;
  persistSettings();
  const activeFields = getActiveFields();
  if (activeFields.length < 2) {
    toast.show('请在设置中至少启用两种题目内容。');
    return;
  }
  const total = Number.isFinite(questionCount) ? questionCount : Infinity;
  const queue = buildQuestionQueue({ key, total, mode, source });
  const session = {
    mode,
    key,
    total,
    queue,
    asked: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    responseTimes: [],
    currentQuestion: null,
    awaitingAnswer: false,
    pendingAdvance: false,
    resumeCountdownAt: null,
    questionStart: null,
    showTimer: state.settings.enableTimer,
    startTime: performance.now(),
    source,
  };
  state.session = session;
  dom.workspace.hidden = false;
  dom.body.classList.add('session-active');
  updateSessionUI();
  presentNextQuestion();
  toast.show(`${mode} 已开始，当前调性 ${key}`);
}

function buildQuestionQueue({ key, total, mode, source }) {
  const notes = KEY_LIBRARY[key] || [];
  if (!notes.length) return [];
  if (source === 'mistakes') {
    const mistakes = (state.mistakes[key] || []).map((item) => ({ ...item }));
    for (let i = mistakes.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [mistakes[i], mistakes[j]] = [mistakes[j], mistakes[i]];
    }
    return mistakes;
  }
  if (!Number.isFinite(total)) {
    return [];
  }
  const pool = [];
  while (pool.length < total) {
    pool.push({ ...notes[Math.floor(Math.random() * notes.length)] });
  }
  return pool;
}

function getActiveFields() {
  const fields = [];
  if (state.settings.includeNoteLetter) fields.push('noteLetter');
  if (state.settings.includeScaleDegree) fields.push('scaleDegree');
  if (state.settings.includeSolfege) fields.push('solfege');
  return fields;
}

function presentNextQuestion() {
  if (!state.session) return;
  const { session } = state;
  if (Number.isFinite(session.total) && session.asked >= session.total) {
    endSession({ aborted: false });
    return;
  }
  session.pendingAdvance = false;
  session.resumeCountdownAt = null;
  dom.questionFeedback.textContent = '';
  dom.fretboard.setAttribute('aria-hidden', 'true');
  if (state.settings.showFretHint) {
    dom.fretboardHint.textContent = '回答后将显示对应位置。';
    dom.fretboardCaption.textContent = '悬停音符查看位置详情';
  } else {
    dom.fretboardHint.textContent = '指板提示已关闭。';
    dom.fretboardCaption.textContent = '在设置中开启提示以查看指板位置。';
  }
  dom.optionButtons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove('correct', 'incorrect');
    btn.textContent = '';
  });

  const note = pickNoteForQuestion();
  if (!note) {
    endSession({ aborted: false });
    return;
  }
  const { prompt, answerField, options, label } = buildQuestion(note);
  session.currentQuestion = {
    note,
    prompt,
    answerField,
    correctAnswer: String(note[answerField]),
    options,
    tag: label,
  };
  session.awaitingAnswer = true;
  session.asked += 1;
  updateSessionUI();
  renderQuestion(session.currentQuestion);
  startQuestionTimer();
}

function pickNoteForQuestion() {
  const { session } = state;
  if (!session) return null;
  if (session.source === 'mistakes') {
    if (!session.queue.length) return null;
    const note = session.queue.shift();
    return note ? { ...note } : null;
  }
  if (!Number.isFinite(session.total)) {
    const notes = KEY_LIBRARY[session.key] || [];
    return { ...notes[Math.floor(Math.random() * notes.length)] };
  }
  if (!session.queue.length) return null;
  const note = session.queue.shift();
  return note ? { ...note } : null;
}

function buildQuestion(note) {
  const fields = getActiveFields();
  const giveField = fields[Math.floor(Math.random() * fields.length)];
  let answerField = fields[Math.floor(Math.random() * fields.length)];
  if (answerField === giveField) {
    const others = fields.filter((f) => f !== giveField);
    answerField = others[Math.floor(Math.random() * others.length)] || answerField;
  }
  const prompt = `已知 ${fieldLabel(giveField)} ${note[giveField]}，对应的${fieldLabel(answerField)}是？`;
  const label = `${fieldLabel(giveField)} → ${fieldLabel(answerField)}`;
  const options = buildOptions(note, answerField);
  return { prompt, answerField, options, label };
}

function fieldLabel(field) {
  switch (field) {
    case 'noteLetter':
      return '音名';
    case 'scaleDegree':
      return '数字';
    case 'solfege':
      return '唱名';
    default:
      return field;
  }
}

function buildOptions(note, field) {
  const keyNotes = KEY_LIBRARY[getCurrentKey()] || [];
  const values = new Set();
  values.add(String(note[field]));
  keyNotes.forEach((item) => values.add(String(item[field])));
  const pool = Array.from(values);
  while (pool.length < 4) {
    const fallback = OPTION_FALLBACKS[field] || OPTION_FALLBACKS.noteLetter;
    pool.push(fallback[Math.floor(Math.random() * fallback.length)]);
    const unique = [...new Set(pool)];
    pool.length = 0;
    pool.push(...unique);
  }
  if (state.settings.shuffleOptions) {
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  return pool.slice(0, 4);
}

function renderQuestion(question) {
  dom.questionTag.textContent = question.tag;
  dom.questionPrompt.textContent = question.prompt;
  dom.optionButtons.forEach((btn, index) => {
    const text = question.options[index];
    btn.textContent = text || '';
    btn.dataset.value = text;
  });
  dom.questionFeedback.textContent = '';
}

function startQuestionTimer() {
  const { session } = state;
  if (!session) return;
  session.questionStart = performance.now();
  if (!session.showTimer) {
    dom.questionTimer.textContent = '未开启';
    return;
  }
  const update = (timestamp) => {
    if (!state.session || state.session !== session || !session.awaitingAnswer) return;
    const elapsed = (timestamp - session.questionStart) / 1000;
    dom.questionTimer.textContent = `${elapsed.toFixed(1)}s`;
    session.timerId = requestAnimationFrame(update);
  };
  if (session.timerId) cancelAnimationFrame(session.timerId);
  session.timerId = requestAnimationFrame(update);
}

function handleAnswer(index) {
  if (!state.session || !state.session.awaitingAnswer) return;
  const { session } = state;
  const question = session.currentQuestion;
  const selected = dom.optionButtons[index];
  if (!selected) return;
  session.awaitingAnswer = false;
  if (session.timerId) cancelAnimationFrame(session.timerId);
  const responseTime = session.showTimer ? (performance.now() - session.questionStart) / 1000 : null;
  dom.optionButtons.forEach((btn) => {
    btn.disabled = true;
    const value = btn.dataset.value;
    if (value === question.correctAnswer) {
      btn.classList.add('correct');
    }
    if (btn === selected && value !== question.correctAnswer) {
      btn.classList.add('incorrect');
    }
  });

  const correct = selected.dataset.value === question.correctAnswer;
  if (correct) {
    session.correct += 1;
    session.streak += 1;
    session.bestStreak = Math.max(session.bestStreak, session.streak);
    dom.questionFeedback.textContent = `回答正确：${formatNoteInfo(question.note)}`;
  } else {
    session.streak = 0;
    dom.questionFeedback.textContent = `正确答案是 ${question.correctAnswer}。${formatNoteInfo(question.note)}`;
    recordMistake(question.note);
  }
  if (responseTime !== null) {
    session.responseTimes.push(responseTime);
  }
  if (state.settings.showFretHint) {
    revealFretboardHint(question.note);
  }
  scheduleNextQuestion();
  updateSessionUI();
}

function scheduleNextQuestion() {
  const { session } = state;
  if (!session) return;
  session.pendingAdvance = true;
  session.resumeCountdownAt = null;
  session.advanceStart = performance.now();
  const step = (timestamp) => {
    if (!state.session || state.session !== session) return;
    if (!session.pendingAdvance) return;
    if (state.hoverPause) {
      session.resumeCountdownAt = null;
      requestAnimationFrame(step);
      return;
    }
    if (session.resumeCountdownAt) {
      if (timestamp < session.resumeCountdownAt) {
        requestAnimationFrame(step);
        return;
      }
      session.resumeCountdownAt = null;
      session.advanceStart = performance.now();
    }
    if (timestamp - session.advanceStart >= 1000) {
      session.pendingAdvance = false;
      presentNextQuestion();
      return;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function revealFretboardHint(note) {
  dom.fretboard.setAttribute('aria-hidden', 'false');
  const display = state.settings.includeOctave && note.octave ? `${note.noteLetter}${note.octave}` : note.noteLetter;
  dom.fretboardHint.textContent = `${display} 位置信息如下：`;
  dom.fretboardCaption.textContent = `${display} - 悬停音符查看位置详情`;
  populateFretboardHighlights(note);
}

function populateFretboard() {
  dom.fretboard.innerHTML = '';
  STRINGS_META.forEach((stringMeta, index) => {
    const row = document.createElement('div');
    row.className = 'fret-row';
    row.dataset.stringIndex = index;
    for (let fret = 0; fret <= 12; fret += 1) {
      const fretCell = document.createElement('div');
      fretCell.className = 'fret';
      if (fret === 0) fretCell.classList.add('is-open');
      fretCell.dataset.pitchClass = (stringMeta.pitchClass + fret) % 12;
      fretCell.dataset.fret = fret;
      const tooltip = document.createElement('span');
      tooltip.className = 'tooltip';
      tooltip.textContent = `${stringMeta.name} ${fret} 品`;
      fretCell.appendChild(tooltip);
      row.appendChild(fretCell);
    }
    dom.fretboard.appendChild(row);
  });
}

function populateFretboardHighlights(note) {
  const pitch = note.pitchClass;
  const value = `${note.noteLetter}${state.settings.includeOctave ? note.octave : ''}`;
  dom.fretboard.querySelectorAll('.fret').forEach((cell) => {
    cell.innerHTML = '';
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    const stringName = STRINGS_META[cell.parentElement.dataset.stringIndex].name;
    tooltip.textContent = `${stringName} ${cell.dataset.fret} 品`;
    cell.appendChild(tooltip);
    if (Number(cell.dataset.pitchClass) === pitch) {
      const label = document.createElement('span');
      label.className = 'note-label';
      label.textContent = value;
      cell.appendChild(label);
    }
  });
}

function formatNoteInfo(note) {
  const parts = [
    `音名 ${note.noteLetter}`,
    `数字 ${note.scaleDegree}`,
    `唱名 ${note.solfege}`,
  ];
  if (state.settings.includeOctave && note.octave) {
    parts.push(`八度 ${note.octave}`);
  }
  return parts.join(' · ');
}

function recordMistake(note) {
  const key = getCurrentKey();
  const list = state.mistakes[key] || [];
  const exists = list.some((item) => item.noteLetter === note.noteLetter && item.scaleDegree === note.scaleDegree);
  if (!exists) {
    list.push({ ...note });
  }
  state.mistakes[key] = list;
  persistMistakes();
  updateMistakePreview();
}

function updateSessionUI() {
  if (!state.session) {
    dom.sessionMode.textContent = '—';
    dom.sessionProgress.textContent = '—';
    dom.sessionKey.textContent = getCurrentKey();
    dom.sessionAccuracy.textContent = '—';
    dom.sessionStreak.textContent = '—';
    dom.sessionAverage.textContent = '—';
    return;
  }
  const { session } = state;
  dom.sessionMode.textContent = session.mode;
  dom.sessionKey.textContent = session.key;
  const totalLabel = Number.isFinite(session.total) ? session.total : '∞';
  dom.sessionProgress.textContent = `题目 ${session.asked} / ${totalLabel}`;
  const accuracy = session.asked ? ((session.correct / session.asked) * 100).toFixed(0) : 0;
  dom.sessionAccuracy.textContent = `${accuracy}%`;
  dom.sessionStreak.textContent = `${session.bestStreak}`;
  if (session.responseTimes.length) {
    const avg = session.responseTimes.reduce((sum, v) => sum + v, 0) / session.responseTimes.length;
    dom.sessionAverage.textContent = `${avg.toFixed(1)}s`;
  } else {
    dom.sessionAverage.textContent = session.showTimer ? '暂未统计' : '未开启';
  }
  updateMistakePreview();
}

function updateMistakePreview() {
  const key = getCurrentKey();
  const list = state.mistakes[key] || [];
  dom.mistakeList.innerHTML = '';
  if (!list.length) {
    dom.mistakeList.parentElement.style.display = 'none';
    return;
  }
  dom.mistakeList.parentElement.style.display = '';
  list.slice(0, 6).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.noteLetter} / ${item.scaleDegree} / ${item.solfege}`;
    dom.mistakeList.appendChild(li);
  });
}

function endSession({ aborted, silent } = {}) {
  if (!state.session) return;
  const { session } = state;
  if (session.timerId) cancelAnimationFrame(session.timerId);
  const asked = session.asked;
  const elapsed = (performance.now() - session.startTime) / 1000;
  const average = session.responseTimes.length
    ? session.responseTimes.reduce((sum, v) => sum + v, 0) / session.responseTimes.length
    : null;
  dom.workspace.hidden = true;
  if (!silent) {
    showSessionSummary({ session, average, elapsed, aborted });
  }
  dom.body.classList.remove('session-active');
  if (asked > 0) {
    const record = {
      mode: session.mode,
      key: session.key,
      total: session.total,
      asked,
      correct: session.correct,
      bestStreak: session.bestStreak,
      average,
      elapsed,
      aborted,
      completed: !aborted && (Number.isFinite(session.total) ? asked >= session.total : true),
      timestamp: new Date().toISOString(),
    };
    state.history.unshift(record);
    state.history = state.history.slice(0, 30);
    persistHistory();
    dom.lastSummary.innerHTML = formatSummaryHtml(record);
    dom.lastSummary.hidden = false;
    if (!silent) {
      toast.show('练习已结束，可在记录中查看。');
    }
  }
  state.session = null;
  updateSessionUI();
}

function formatSummaryHtml(record) {
  const accuracy = record.asked ? ((record.correct / record.asked) * 100).toFixed(0) : 0;
  return `
    <strong>${record.mode}</strong> · ${record.key}<br>
    题量：${Number.isFinite(record.total) ? record.total : '∞'} · 已答：${record.asked} · 正确率：${accuracy}%<br>
    最长连对：${record.bestStreak} · 用时：${record.elapsed.toFixed(1)}s · 平均反应：${record.average ? record.average.toFixed(1) : '未开启'}s
  `;
}

function showSessionSummary({ session, average, elapsed, aborted }) {
  const accuracy = session.asked ? ((session.correct / session.asked) * 100).toFixed(0) : 0;
  dom.sessionSummary.innerHTML = `
    <h3>${session.mode} 总结</h3>
    <p>${aborted ? '练习已中止' : '练习完成'} · 调性：${session.key}</p>
    <ul>
      <li>题量：${Number.isFinite(session.total) ? session.total : '∞'}</li>
      <li>已答：${session.asked}，正确率 ${accuracy}%</li>
      <li>最长连对：${session.bestStreak}</li>
      <li>平均反应：${average ? average.toFixed(1) : '未开启'}s</li>
      <li>总用时：${elapsed.toFixed(1)}s</li>
    </ul>
  `;
  dom.sessionSummary.hidden = false;
  dom.sessionSummary.classList.add('show');
  setTimeout(() => {
    dom.sessionSummary.classList.remove('show');
    dom.sessionSummary.hidden = true;
  }, 7000);
}

function updateHistoryModal() {
  dom.historyList.innerHTML = '';
  if (!state.history.length) {
    dom.historyList.innerHTML = '<p>暂无练习记录，开始练习以积累数据。</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  state.history.slice(0, 30).forEach((item) => {
    const row = document.createElement('article');
    row.className = 'history-row';
    const accuracy = item.asked ? ((item.correct / item.asked) * 100).toFixed(0) : 0;
    row.innerHTML = `
      <h4>${item.mode} · ${item.key}</h4>
      <p>正确率 ${accuracy}% · 连对 ${item.bestStreak} · 用时 ${item.elapsed.toFixed(1)}s</p>
      <p>${item.completed ? '已完成' : '未完成'} · ${new Date(item.timestamp).toLocaleString()}</p>
    `;
    fragment.appendChild(row);
  });
  dom.historyList.appendChild(fragment);
}

function updateDataStats() {
  const historySize = JSON.stringify(state.history).length / 1024;
  const mistakesSize = JSON.stringify(state.mistakes).length / 1024;
  const settingsSize = JSON.stringify(state.settings).length / 1024;
  const totalItems = state.history.length + Object.values(state.mistakes).reduce((sum, list) => sum + list.length, 0);
  dom.dataStats.innerHTML = `
    <li>练习次数：${state.history.length}</li>
    <li>错题数：${Object.values(state.mistakes).reduce((sum, list) => sum + list.length, 0)}</li>
    <li>数据大小：${(historySize + mistakesSize + settingsSize).toFixed(2)} KB</li>
    <li>存储项目数：${totalItems}</li>
  `;
  dom.dataPreview.value = '';
}

function showDataPreview(type) {
  if (type === 'mistakes') {
    dom.dataPreview.value = JSON.stringify(state.mistakes, null, 2);
  } else if (type === 'history') {
    dom.dataPreview.value = JSON.stringify(state.history, null, 2);
  }
}

function handleExportData() {
  const payload = {
    settings: state.settings,
    history: state.history,
    mistakes: state.mistakes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fret-compass-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.show('已导出当前数据。');
}

function handleImportData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.settings) state.settings = { ...DEFAULT_SETTINGS, ...data.settings };
      if (Array.isArray(data.history)) state.history = data.history.slice(0, 30);
      if (data.mistakes && typeof data.mistakes === 'object') state.mistakes = data.mistakes;
      persistSettings();
      persistHistory();
      persistMistakes();
      populateSettingsForm();
      updateMistakePreview();
      toast.show('导入成功，正在重新应用状态。');
      location.reload();
    } catch (error) {
      console.error(error);
      toast.show('导入失败，请检查文件格式。');
    }
  };
  reader.readAsText(file);
}

function clearMistakes() {
  if (!confirm('确定要清除所有错题吗？')) return;
  state.mistakes = {};
  persistMistakes();
  updateMistakePreview();
  toast.show('所有错题已清除。');
}

function seedTestMistakes() {
  const key = getCurrentKey();
  const samples = KEY_LIBRARY[key].slice(0, 2).map((note, idx) => ({ ...note, id: `${note.id}-seed-${idx}` }));
  state.mistakes[key] = samples;
  persistMistakes();
  updateMistakePreview();
  toast.show('已添加测试错题。');
}

function clearHistory() {
  if (!confirm('确定要清除练习历史吗？')) return;
  state.history = [];
  persistHistory();
  updateHistoryModal();
  toast.show('练习历史已清除。');
}

function clearAllData() {
  if (!confirm('确定要清除所有本地数据吗？此操作不可撤销。')) return;
  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.history);
  localStorage.removeItem(STORAGE_KEYS.mistakes);
  localStorage.removeItem(STORAGE_KEYS.theme);
  toast.show('所有数据已清除，页面将刷新。');
  setTimeout(() => location.reload(), 600);
}

function ensureMistakeSamples() {
  const key = getCurrentKey();
  if (!state.mistakes[key] || !state.mistakes[key].length) {
    state.mistakes[key] = KEY_LIBRARY[key].slice(0, 2).map((note) => ({ ...note, id: `${note.id}-sample` }));
    persistMistakes();
  }
}

function updateSessionKey(key) {
  state.session.key = key;
  state.session.queue = buildQuestionQueue({ key, total: state.session.total, mode: state.session.mode, source: state.session.source });
  dom.sessionKey.textContent = key;
  toast.show(`已切换到 ${key}，队列已更新。`);
}

function defaultStart() {
  dom.keySelect.value = getCurrentKey();
  ensureMistakeSamples();
  populateSettingsForm();
  updateMistakePreview();
  startSession({ mode: '冲刺模式', questionCount: 10 });
}

document.addEventListener('DOMContentLoaded', () => {
  initDom();
  loadPersistedState();
  applyTheme(state.theme);
  dom.keySelect.value = getCurrentKey();
  populateFretboard();
  populateSettingsForm();
  updateMistakePreview();
  bindEvents();
  ensureMistakeSamples();
  console.info('Fret Compass 初始化完毕。', {
    theme: state.theme,
    settings: state.settings,
  });
  defaultStart();
});
