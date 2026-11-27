// app.js — логика тренажёра
// Копия DevOps-тренажёра для курса «Веб-аналитика». Вопросы — questions.js (40 шт.).
// Вопросы должны быть загружены ДО этого скрипта (из questions.js)
// и доступны через глобальную переменную QUESTIONS.

(function () {
  'use strict';

  if (!Array.isArray(window.QUESTIONS) || window.QUESTIONS.length === 0) {
    document.getElementById('app').innerHTML =
      '<p style="color: red; padding: 20px;">Ошибка: не загружены вопросы. Проверь, что questions.js подключён до app.js.</p>';
    return;
  }

  const QUESTIONS = window.QUESTIONS;
  const QUESTIONS_PER_QUIZ = QUESTIONS.length; // все 40 вопросов в случайном порядке

  // Состояние приложения
  const state = {
    screen: 'start', // start | quiz | result
    quizQuestions: [], // вопросы попытки с перемешанными вариантами
    currentIdx: 0,
    answers: [], // { selectedIdx, isCorrect }
  };

  // ==== УТИЛИТЫ ====

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandomQuestions(n) {
    const shuffled = shuffle(QUESTIONS);
    return shuffled.slice(0, n).map((q) => {
      const indexed = q.options.map((opt, i) => ({
        opt,
        isCorrect: i === q.correct,
      }));
      const shuffledOpts = shuffle(indexed);
      return {
        id: q.id,
        topic: q.topic,
        q: q.q,
        options: shuffledOpts.map((o) => o.opt),
        correct: shuffledOpts.findIndex((o) => o.isCorrect),
        explain: q.explain,
      };
    });
  }

  function topicCounts() {
    const counts = {};
    QUESTIONS.forEach((q) => {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    });
    return counts;
  }

  function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==== ОТРИСОВКА ====

  const app = document.getElementById('app');

  function render() {
    if (state.screen === 'start') renderStart();
    else if (state.screen === 'quiz') renderQuiz();
    else if (state.screen === 'result') renderResult();
  }

  function renderStart() {
    const tc = topicCounts();
    const topicEntries = Object.entries(tc).sort((a, b) => b[1] - a[1]);
    app.innerHTML = `
      <div class="start-screen">
        <div class="card">
          <h2>Тест по веб-аналитике</h2>
          <p>Все ${QUESTIONS.length} вопросов в случайном порядке. Варианты ответов перемешиваются, чтобы нельзя было запомнить позицию правильного.</p>
          <div class="stats-grid">
            <div class="stat">
              <div class="stat-label">Всего вопросов</div>
              <div class="stat-value">${QUESTIONS.length}</div>
            </div>
            <div class="stat">
              <div class="stat-label">За попытку</div>
              <div class="stat-value">${QUESTIONS_PER_QUIZ}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Тем</div>
              <div class="stat-value">${Object.keys(tc).length}</div>
            </div>
          </div>
          <ul class="topics-list">
            ${topicEntries.map(([t, c]) => `<li><span>${escapeHtml(t)}</span><span>${c}</span></li>`).join('')}
          </ul>
        </div>
        <div class="card">
          <h2>Как это работает</h2>
          <p>На каждом вопросе выбираешь один вариант. После ответа сразу видишь правильность и объяснение. По окончании — итоговый балл, разбивка по темам и список ошибок с разъяснениями.</p>
          <div class="btn-row">
            <button class="btn btn-primary" data-action="start">Начать тест →</button>
          </div>
          <div class="keyboard-hint">Подсказка: на клавиатуре можно жать <kbd>1</kbd>–<kbd>4</kbd> для выбора и <kbd>Enter</kbd> для перехода.</div>
        </div>
      </div>
    `;
  }

  function renderQuiz() {
    const q = state.quizQuestions[state.currentIdx];
    const answer = state.answers[state.currentIdx];
    const answered = !!answer;
    const total = state.quizQuestions.length;
    const progress = ((state.currentIdx + (answered ? 1 : 0)) / total) * 100;
    app.innerHTML = `
      <div class="quiz-header">
        <div class="progress-info">Вопрос <strong>${state.currentIdx + 1}</strong> из ${total}</div>
        <span class="topic-tag">${escapeHtml(q.topic)}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
      <div class="question-card">
        <p class="question-text">${escapeHtml(q.q)}</p>
        <div class="options">
          ${q.options
            .map((opt, i) => {
              let cls = 'option';
              let mark = '';
              if (answered) {
                cls += ' disabled';
                if (i === q.correct) {
                  cls += ' correct';
                  mark = '<span class="option-mark"></span>';
                } else if (i === answer.selectedIdx) {
                  cls += ' incorrect';
                  mark = '<span class="option-mark"></span>';
                }
              }
              const letter = String.fromCharCode(65 + i);
              const dataAttr = !answered ? `data-action="select" data-idx="${i}"` : '';
              return `
                <div class="${cls}" ${dataAttr}>
                  <span class="option-letter">${letter}</span>
                  <span class="option-text">${escapeHtml(opt)}</span>
                  ${mark}
                </div>
              `;
            })
            .join('')}
        </div>
        ${
          answered
            ? `
          <div class="explanation">
            <span class="label">${answer.isCorrect ? 'Верно' : 'Разбор'}</span>
            ${escapeHtml(q.explain)}
          </div>
          <div class="actions-bottom">
            <button class="btn btn-primary" data-action="next">
              ${state.currentIdx < total - 1 ? 'Следующий вопрос →' : 'Показать результаты →'}
            </button>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  function renderResult() {
    const total = state.quizQuestions.length;
    const correct = state.answers.filter((a) => a.isCorrect).length;
    const percent = Math.round((correct / total) * 100);
    let verdict, verdictClass;
    if (percent >= 90) {
      verdict = 'Отлично';
      verdictClass = 'excellent';
    } else if (percent >= 75) {
      verdict = 'Хорошо';
      verdictClass = 'good';
    } else if (percent >= 60) {
      verdict = 'Удовлетворительно — есть пробелы';
      verdictClass = 'medium';
    } else {
      verdict = 'Стоит повторить материал';
      verdictClass = 'weak';
    }

    const byTopic = {};
    state.quizQuestions.forEach((q, i) => {
      if (!byTopic[q.topic]) byTopic[q.topic] = { total: 0, correct: 0 };
      byTopic[q.topic].total++;
      if (state.answers[i].isCorrect) byTopic[q.topic].correct++;
    });
    const topicRows = Object.entries(byTopic).sort((a, b) => b[1].total - a[1].total);

    const mistakes = state.quizQuestions
      .map((q, i) => ({ q, ans: state.answers[i], idx: i }))
      .filter((m) => !m.ans.isCorrect);

    app.innerHTML = `
      <div class="result-summary">
        <div class="score-big">${correct} / ${total}</div>
        <div class="score-percentage">${percent}%</div>
        <div class="verdict ${verdictClass}">${verdict}</div>
      </div>

      <div class="by-topic">
        <h3>Разбивка по темам</h3>
        ${topicRows
          .map(([topic, s]) => {
            const p = Math.round((s.correct / s.total) * 100);
            let bcls = '';
            if (p < 60) bcls = 'weak';
            else if (p < 80) bcls = 'medium';
            return `
              <div class="topic-row">
                <span class="topic-name">${escapeHtml(topic)}</span>
                <span class="topic-stat">${s.correct}/${s.total} · ${p}%</span>
                <div class="topic-bar"><div class="topic-bar-fill ${bcls}" style="width: ${p}%"></div></div>
              </div>
            `;
          })
          .join('')}
      </div>

      ${
        mistakes.length > 0
          ? `
        <div class="mistakes">
          <h3>Ошибки (${mistakes.length})</h3>
          ${mistakes
            .map(
              (m) => `
            <div class="mistake-item">
              <div class="mistake-meta">${escapeHtml(m.q.topic)} · вопрос #${m.q.id}</div>
              <div class="mistake-q">${escapeHtml(m.q.q)}</div>
              <div class="mistake-yours"><strong>Твой ответ:</strong> ${escapeHtml(m.q.options[m.ans.selectedIdx])}</div>
              <div class="mistake-correct"><strong>Правильно:</strong> ${escapeHtml(m.q.options[m.q.correct])}</div>
              <div class="mistake-explain">${escapeHtml(m.q.explain)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : `
        <div class="mistakes">
          <h3>Идеально</h3>
          <p style="color: var(--text-muted); margin: 0;">Ни одной ошибки. Так держать.</p>
        </div>
      `
      }

      <div class="actions-bottom">
        <button class="btn btn-primary" data-action="start">Новая попытка →</button>
        <button class="btn btn-secondary" data-action="goStart">На главную</button>
      </div>
    `;
  }

  // ==== ДЕЙСТВИЯ ====

  function startQuiz() {
    state.quizQuestions = pickRandomQuestions(QUESTIONS_PER_QUIZ);
    state.currentIdx = 0;
    state.answers = [];
    state.screen = 'quiz';
    render();
    window.scrollTo(0, 0);
  }

  function selectAnswer(idx) {
    if (state.answers[state.currentIdx]) return;
    const q = state.quizQuestions[state.currentIdx];
    state.answers[state.currentIdx] = {
      selectedIdx: idx,
      isCorrect: idx === q.correct,
    };
    render();
  }

  function nextQuestion() {
    if (state.currentIdx < state.quizQuestions.length - 1) {
      state.currentIdx++;
      render();
      window.scrollTo(0, 0);
    } else {
      state.screen = 'result';
      render();
      window.scrollTo(0, 0);
    }
  }

  function goToStart() {
    state.screen = 'start';
    state.quizQuestions = [];
    state.currentIdx = 0;
    state.answers = [];
    render();
  }

  // ==== ОБРАБОТКА СОБЫТИЙ ====
  // Делегирование — слушаем только корневой элемент, чтобы при перерисовке
  // не приходилось переподключать обработчики

  app.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    if (action === 'start') startQuiz();
    else if (action === 'next') nextQuestion();
    else if (action === 'goStart') goToStart();
    else if (action === 'select') {
      const idx = parseInt(target.getAttribute('data-idx'), 10);
      selectAnswer(idx);
    }
  });

  // Клавиатурные шорткаты
  document.addEventListener('keydown', (e) => {
    if (state.screen !== 'quiz') return;
    const q = state.quizQuestions[state.currentIdx];
    const answered = !!state.answers[state.currentIdx];
    if (!answered && /^[1-9]$/.test(e.key)) {
      const i = parseInt(e.key, 10) - 1;
      if (i < q.options.length) selectAnswer(i);
    } else if (answered && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      nextQuestion();
    }
  });

  // Запуск
  render();
})();
