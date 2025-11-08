import { quizzes, initialReports } from './data.js';

const state = {
  route: 'dashboard',
  quizzes: [...quizzes],
  reports: [...initialReports],
  activeQuiz: null,
  quizProgress: {
    currentIndex: 0,
    answers: {},
    startedAt: null,
    timerId: null,
    remainingSeconds: 0
  },
  theme: localStorage.getItem('quizarc-theme') || 'light'
};

document.documentElement.dataset.theme = state.theme;

const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav__item');
const themeToggle = document.getElementById('themeToggle');
const newQuizBtn = document.getElementById('newQuizBtn');

const formatDate = (value) => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  return formatter.format(new Date(value));
};

const averageScore = (reports) => {
  if (!reports.length) return 0;
  return Math.round(reports.reduce((sum, report) => sum + report.score, 0) / reports.length);
};

const totalAttempts = (quizId) => state.reports.filter((report) => report.quizId === quizId).length;

const totalTimeSpent = (reports) => reports.reduce((sum, report) => sum + report.durationMinutes, 0);

const createElement = (markup) => {
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
};

const setRoute = (route) => {
  state.route = route;
  navButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.route === route));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
};

const toggleTheme = () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('quizarc-theme', state.theme);
};

const openModal = ({ title, body }) => {
  const template = document.getElementById('modalTemplate');
  const modal = template.content.firstElementChild.cloneNode(true);
  modal.querySelector('.modal__title').textContent = title;
  modal.querySelector('.modal__body').append(body);

  const close = () => {
    modal.remove();
    document.removeEventListener('keydown', onEsc);
  };

  const onEsc = (event) => {
    if (event.key === 'Escape') close();
  };

  modal.querySelector('.modal__overlay').addEventListener('click', close);
  modal.querySelector('.modal__close').addEventListener('click', close);
  document.addEventListener('keydown', onEsc);
  document.body.append(modal);
};

const createQuizForm = () => {
  const form = createElement(`
    <form class="section-grid">
      <label class="field">
        <span class="field__label">Quiz title</span>
        <input class="field__input" name="title" required placeholder="Example: TypeScript Essentials" />
      </label>
      <label class="field">
        <span class="field__label">Description</span>
        <textarea class="field__textarea" name="description" rows="3" required placeholder="Short summary for learners"></textarea>
      </label>
      <label class="field">
        <span class="field__label">Tags (comma separated)</span>
        <input class="field__input" name="tags" placeholder="Frontend, Backend" />
      </label>
      <label class="field">
        <span class="field__label">Estimated time (minutes)</span>
        <input class="field__input" name="estimatedTime" type="number" min="1" step="1" value="8" />
      </label>
    </form>
  `);

  form.addEventListener('submit', (event) => event.preventDefault());
  return form;
};

const injectFieldStyles = () => {
  if (document.getElementById('fieldStyles')) return;
  const style = document.createElement('style');
  style.id = 'fieldStyles';
  style.textContent = `
    .field { display: grid; gap: 8px; }
    .field__label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 600; }
    .field__input, .field__textarea { padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface-alt); color: var(--text); font: inherit; transition: border var(--transition), box-shadow var(--transition); }
    .field__input:focus, .field__textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
  `;
  document.head.append(style);
};

const handleNewQuiz = () => {
  injectFieldStyles();
  const form = createQuizForm();
  const submitBtn = createElement('<button class="btn btn--primary" type="submit">Create quiz</button>');
  form.append(submitBtn);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const quiz = {
      id: `${formData.get('title').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      title: formData.get('title'),
      description: formData.get('description'),
      tags: formData.get('tags') ? formData.get('tags').split(',').map((tag) => tag.trim()) : [],
      difficulty: 'Custom',
      estimatedTime: Number(formData.get('estimatedTime')) || 5,
      questions: []
    };

    state.quizzes.unshift(quiz);
    setRoute('library');
    renderToast(`${quiz.title} created. Add questions from the dashboard.`);
    document.querySelector('.modal')?.remove();
  });

  openModal({
    title: 'Create new quiz',
    body: form
  });
};

const renderToast = (message) => {
  const toast = createElement(`<div class="toast" role="status">${message}</div>`);
  toast.addEventListener('click', () => toast.remove());
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => toast.remove(), 4200);
};

const ensureToastStyles = () => {
  if (document.getElementById('toastStyles')) return;
  const style = document.createElement('style');
  style.id = 'toastStyles';
  style.textContent = `
    .toast { position: fixed; bottom: 32px; right: 32px; padding: 16px 20px; background: var(--surface); color: var(--text); border-radius: var(--radius-sm); box-shadow: var(--shadow); transform: translateY(16px); opacity: 0; transition: transform var(--transition), opacity var(--transition); }
    .toast.is-visible { transform: translateY(0); opacity: 1; }
  `;
  document.head.append(style);
};

const renderDashboard = () => {
  const totalLearners = state.reports.length;
  const avgScore = averageScore(state.reports);
  const totalMinutes = totalTimeSpent(state.reports);

  return `
    <header class="header">
      <div>
        <h1 class="header__title">Insight Dashboard</h1>
        <p class="header__subtitle">Monitor cohort performance, trending quizzes, and live participation health.</p>
      </div>
      <button class="pill-button" data-action="launch-session">Start Live Session</button>
    </header>
    <section class="section-grid section-grid--cols-3">
      <article class="card stat">
        <p class="card__title">Active Learners</p>
        <p class="stat__value">${totalLearners}</p>
        <p class="card__meta">Tracked across latest quiz attempts.</p>
      </article>
      <article class="card stat">
        <p class="card__title">Average score</p>
        <p class="stat__value">${avgScore}<span class="stat__trend">▲ 6%</span></p>
        <p class="card__meta">vs. last 7 days of cohort data.</p>
      </article>
      <article class="card stat">
        <p class="card__title">Minutes engaged</p>
        <p class="stat__value">${totalMinutes}</p>
        <p class="card__meta">Aggregate focus time across quizzes.</p>
      </article>
    </section>
    <section class="section-grid section-grid--cols-2" style="margin-top: 24px;">
      <article class="card">
        <header class="quiz-card__header">
          <div>
            <h2 class="card__title">Fastest growing quizzes</h2>
            <p class="card__meta">Based on enrollment velocity in the past week.</p>
          </div>
          <span class="badge">Live</span>
        </header>
        <div class="quiz-list" style="margin-top: 20px;">
          ${state.quizzes
            .slice(0, 3)
            .map(
              (quiz) => `
                <div class="quiz-card">
                  <div class="quiz-card__header">
                    <h3 class="quiz-card__title">${quiz.title}</h3>
                    <button class="pill-button" data-action="launch-quiz" data-quiz="${quiz.id}">
                      Open
                    </button>
                  </div>
                  <p class="card__meta">${quiz.description}</p>
                  <div class="quiz-card__tags">
                    ${quiz.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
                  </div>
                  <div class="quiz-progress">
                    <span>${totalAttempts(quiz.id)} attempts</span>
                    <div class="progress-bar quiz-progress__bar">
                      <span class="progress-bar__value" style="width: ${Math.min(totalAttempts(quiz.id) * 12, 100)}%;"></span>
                    </div>
                    <span>${quiz.estimatedTime} min</span>
                  </div>
                </div>
              `
            )
            .join('')}
        </div>
      </article>
      <article class="card">
        <header class="quiz-card__header">
          <div>
            <h2 class="card__title">Latest assessment runs</h2>
            <p class="card__meta">Sorted by most recent submissions from your learners.</p>
          </div>
        </header>
        ${state.reports.length
          ? `<table class="table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                ${state.reports
                  .slice(0, 5)
                  .map(
                    (report) => `
                      <tr>
                        <td>${report.learner}</td>
                        <td>${state.quizzes.find((quiz) => quiz.id === report.quizId)?.title ?? 'Unknown quiz'}</td>
                        <td>${report.score}%</td>
                        <td>${formatDate(report.submittedAt)}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>`
          : `<div class="empty-state">
              <h3 class="empty-state__title">No attempts yet</h3>
              <p class="empty-state__description">Once learners submit a quiz, analytics will populate here with their performance metrics.</p>
              <button class="pill-button" data-action="launch-session">Launch a session</button>
            </div>`}
      </article>
    </section>
  `;
};

const renderLibrary = () => `
  <header class="header">
    <div>
      <h1 class="header__title">Quiz library</h1>
      <p class="header__subtitle">Curated catalog of reusable assessments for your teams.</p>
    </div>
    <button class="pill-button" id="libraryNewQuiz">Create quiz</button>
  </header>
  <section class="quiz-list">
    ${state.quizzes
      .map(
        (quiz) => `
          <article class="card quiz-card">
            <div class="quiz-card__header">
              <div>
                <h2 class="quiz-card__title">${quiz.title}</h2>
                <p class="card__meta">${quiz.difficulty} · ${quiz.estimatedTime} min</p>
              </div>
              <div>
                <button class="pill-button" data-action="launch-quiz" data-quiz="${quiz.id}">Launch</button>
              </div>
            </div>
            <p class="card__meta">${quiz.description}</p>
            ${quiz.tags.length ? `<div class="quiz-card__tags">${quiz.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            <div class="quiz-progress">
              <span>${totalAttempts(quiz.id)} attempts</span>
              <div class="progress-bar quiz-progress__bar">
                <span class="progress-bar__value" style="width: ${Math.min(totalAttempts(quiz.id) * 10, 100)}%;"></span>
              </div>
              <span>${quiz.questions.length} questions</span>
            </div>
          </article>
        `
      )
      .join('')}
  </section>
`;

const renderReports = () => `
  <header class="header">
    <div>
      <h1 class="header__title">Performance reports</h1>
      <p class="header__subtitle">Filter attempts by quiz to identify retention gaps.</p>
    </div>
    <div class="pill-group">
      <button class="pill-button" data-action="export-reports">Export CSV</button>
    </div>
  </header>
  ${state.reports.length
    ? `<table class="table">
        <thead>
          <tr>
            <th>Learner</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Duration</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          ${state.reports
            .map(
              (report) => `
                <tr>
                  <td>${report.learner}</td>
                  <td>${state.quizzes.find((quiz) => quiz.id === report.quizId)?.title ?? 'Unknown quiz'}</td>
                  <td>${report.score}%</td>
                  <td>${report.durationMinutes} min</td>
                  <td>${formatDate(report.submittedAt)}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>`
    : `<div class="empty-state">
        <h3 class="empty-state__title">No reports generated</h3>
        <p class="empty-state__description">Once learners finish a quiz, their analytics show up here for pattern analysis.</p>
        <button class="pill-button" data-action="launch-session">Schedule a session</button>
      </div>`}
`;

const renderSessions = () => `
  <header class="header">
    <div>
      <h1 class="header__title">Live session controller</h1>
      <p class="header__subtitle">Activate timer-based sessions and monitor participant flow.</p>
    </div>
    <button class="pill-button" data-action="launch-session">Start session</button>
  </header>
  <section class="section-grid section-grid--cols-2">
    <article class="card">
      <h2 class="card__title">Session blueprint</h2>
      <p class="card__meta">Select a quiz, configure duration, and share the join code with participants.</p>
      <div class="section-grid" style="margin-top: 20px;">
        <label class="field">
          <span class="field__label">Quiz</span>
          <select class="field__input" id="sessionQuiz">
            ${state.quizzes.map((quiz) => `<option value="${quiz.id}">${quiz.title}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span class="field__label">Duration (minutes)</span>
          <input class="field__input" id="sessionDuration" type="number" min="5" step="5" value="20" />
        </label>
        <label class="field">
          <span class="field__label">Participant limit</span>
          <input class="field__input" id="sessionLimit" type="number" min="5" step="5" value="30" />
        </label>
      </div>
      <button class="pill-button" data-action="create-session" style="margin-top: 20px;">Generate session</button>
      <div id="sessionOutput" class="section-grid" style="margin-top: 20px;"></div>
    </article>
    <article class="card">
      <h2 class="card__title">Engagement timeline</h2>
      <p class="card__meta">Simulated trend of learners joining the live quiz over time.</p>
      <div class="progress-bar" style="margin-top: 24px; height: 12px;">
        <span class="progress-bar__value" style="width: 68%;"></span>
      </div>
      <p class="card__meta" style="margin-top: 12px;">68% seats reserved · 14 waiting for approval</p>
    </article>
  </section>
`;

const renderSettings = () => `
  <header class="header">
    <div>
      <h1 class="header__title">Platform settings</h1>
      <p class="header__subtitle">Control brand accents, notifications, and automation rules.</p>
    </div>
    <button class="pill-button" data-action="save-settings">Save changes</button>
  </header>
  <section class="section-grid section-grid--cols-2">
    <article class="card">
      <h2 class="card__title">Brand identity</h2>
      <div class="section-grid" style="margin-top: 16px;">
        <label class="field">
          <span class="field__label">Primary color</span>
          <input class="field__input" type="color" id="brandColor" value="#1f66ff" />
        </label>
        <label class="field">
          <span class="field__label">Brand voice</span>
          <select class="field__input" id="brandVoice">
            <option value="mentor">Mentor</option>
            <option value="coach">Coach</option>
            <option value="challenger">Challenger</option>
          </select>
        </label>
      </div>
    </article>
    <article class="card">
      <h2 class="card__title">Notification cadence</h2>
      <div class="section-grid" style="margin-top: 16px;">
        <label class="field">
          <span class="field__label">Reminder frequency</span>
          <select class="field__input" id="reminderFrequency">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label">Digest email</span>
          <select class="field__input" id="digestMode">
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
            <option value="off">Off</option>
          </select>
        </label>
      </div>
    </article>
  </section>
`;

const renderQuizPlayer = (quiz) => {
  const currentQuestion = quiz.questions[state.quizProgress.currentIndex];
  const totalQuestions = quiz.questions.length;

  if (!totalQuestions) {
    return `
      <div class="card empty-state">
        <h2 class="empty-state__title">This quiz does not have questions yet</h2>
        <p class="empty-state__description">Add questions from the library or import a question bank to play this quiz.</p>
        <button class="pill-button" data-action="exit-quiz">Go back</button>
      </div>
    `;
  }

  const renderOptions = () =>
    currentQuestion.options
      .map((option) => {
        const isSelected = state.quizProgress.answers[currentQuestion.id] === option.id;
        return `<button class="option ${isSelected ? 'is-selected' : ''}" data-option="${option.id}">${option.label}</button>`;
      })
      .join('');

  const completed = Object.keys(state.quizProgress.answers).length;
  const progressPercent = Math.round((completed / totalQuestions) * 100);

  return `
    <div class="quiz-player">
      <header class="quiz-player__header">
        <div>
          <h1 class="header__title">${quiz.title}</h1>
          <p class="header__subtitle">${quiz.description}</p>
        </div>
        <div class="quiz-player__timer" id="quizTimer" aria-live="polite"></div>
      </header>
      <section class="card question-card" data-question="${currentQuestion.id}">
        <div class="quiz-progress">
          <span>Question ${state.quizProgress.currentIndex + 1} of ${totalQuestions}</span>
          <div class="progress-bar quiz-progress__bar">
            <span class="progress-bar__value" style="width: ${progressPercent}%;"></span>
          </div>
          <span>${progressPercent}%</span>
        </div>
        <h2 class="question-card__title">${currentQuestion.text}</h2>
        <div class="option-list">${renderOptions()}</div>
        <div class="question-card__actions" style="display:flex; gap:12px;">
          <button class="pill-button" data-action="prev-question" ${state.quizProgress.currentIndex === 0 ? 'disabled' : ''}>Previous</button>
          <button class="pill-button" data-action="next-question">${state.quizProgress.currentIndex === totalQuestions - 1 ? 'Submit' : 'Next'}</button>
        </div>
      </section>
    </div>
  `;
};

const render = () => {
  ensureToastStyles();

  const views = {
    dashboard: renderDashboard,
    library: renderLibrary,
    reports: renderReports,
    sessions: renderSessions,
    settings: renderSettings,
    quiz: () => renderQuizPlayer(state.activeQuiz)
  };

  mainEl.innerHTML = views[state.route]();
  attachInteractions();

  if (state.route === 'quiz') {
    startQuizTimer();
  } else {
    stopQuizTimer();
  }
};

const attachInteractions = () => {
  mainEl.querySelectorAll('[data-action="launch-quiz"]').forEach((button) => {
    button.addEventListener('click', () => {
      const quiz = state.quizzes.find((item) => item.id === button.dataset.quiz);
      if (!quiz) return;
      state.activeQuiz = quiz;
      state.quizProgress = {
        currentIndex: 0,
        answers: {},
        startedAt: new Date(),
        timerId: null,
        remainingSeconds: quiz.estimatedTime * 60
      };
      setRoute('quiz');
    });
  });

  const sessionButton = mainEl.querySelector('[data-action="create-session"]');
  if (sessionButton) {
    sessionButton.addEventListener('click', () => {
      const quizId = mainEl.querySelector('#sessionQuiz').value;
      const duration = Number(mainEl.querySelector('#sessionDuration').value);
      const limit = Number(mainEl.querySelector('#sessionLimit').value);
      const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase();
      const output = mainEl.querySelector('#sessionOutput');
      output.innerHTML = `
        <div class="badge">Session ready</div>
        <p class="card__meta">Quiz: ${state.quizzes.find((quiz) => quiz.id === quizId)?.title ?? 'Unknown'} · Duration: ${duration} min</p>
        <p class="card__meta">Share join code <strong>${joinCode}</strong> with learners (max ${limit} participants).</p>
      `;
      renderToast('Live session prepared. Copy the join code for your learners.');
    });
  }

  const exportButton = mainEl.querySelector('[data-action="export-reports"]');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      const csv = ['Learner,Quiz,Score,Duration,Submitted'];
      state.reports.forEach((report) => {
        const quizTitle = state.quizzes.find((quiz) => quiz.id === report.quizId)?.title ?? 'Unknown quiz';
        csv.push(`${report.learner},${quizTitle},${report.score},${report.durationMinutes},${formatDate(report.submittedAt)}`);
      });

      const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'quizarc-reports.csv';
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      renderToast('Reports exported as CSV.');
    });
  }

  const launchSessionButtons = mainEl.querySelectorAll('[data-action="launch-session"]');
  launchSessionButtons.forEach((button) => button.addEventListener('click', () => setRoute('sessions')));

  const libraryNewQuiz = document.getElementById('libraryNewQuiz');
  if (libraryNewQuiz) libraryNewQuiz.addEventListener('click', handleNewQuiz);

  if (state.route === 'quiz') {
    const exitQuizBtn = mainEl.querySelector('[data-action="exit-quiz"]');
    if (exitQuizBtn) {
      exitQuizBtn.addEventListener('click', () => {
        stopQuizTimer();
        setRoute('library');
      });
    }

    mainEl.querySelectorAll('.option').forEach((optionBtn) => {
      optionBtn.addEventListener('click', () => {
        const questionId = mainEl.querySelector('.question-card').dataset.question;
        state.quizProgress.answers[questionId] = optionBtn.dataset.option;
        render();
      });
    });

    const prevBtn = mainEl.querySelector('[data-action="prev-question"]');
    const nextBtn = mainEl.querySelector('[data-action="next-question"]');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.quizProgress.currentIndex > 0) {
          state.quizProgress.currentIndex -= 1;
          render();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const questionId = state.activeQuiz.questions[state.quizProgress.currentIndex].id;
        if (!state.quizProgress.answers[questionId]) {
          renderToast('Select an option to continue.');
          return;
        }

        if (state.quizProgress.currentIndex === state.activeQuiz.questions.length - 1) {
          finalizeQuiz();
        } else {
          state.quizProgress.currentIndex += 1;
          render();
        }
      });
    }
  }
};

const finalizeQuiz = () => {
  stopQuizTimer();

  const quiz = state.activeQuiz;
  const answers = state.quizProgress.answers;
  const correctAnswers = quiz.questions.filter((question) => answers[question.id] === question.answerId);
  const score = Math.round((correctAnswers.length / quiz.questions.length) * 100);
  const durationMinutes = Math.round((quiz.estimatedTime * 60 - state.quizProgress.remainingSeconds) / 60);

  const report = {
    id: `rep-${Date.now()}`,
    learner: 'You',
    quizId: quiz.id,
    score,
    submittedAt: new Date().toISOString(),
    durationMinutes
  };

  state.reports.unshift(report);
  setRoute('reports');
  renderToast(`Quiz submitted • Score ${score}%`);
};

const updateTimerDisplay = () => {
  const timerEl = document.getElementById('quizTimer');
  if (!timerEl) return;
  const minutes = String(Math.floor(state.quizProgress.remainingSeconds / 60)).padStart(2, '0');
  const seconds = String(state.quizProgress.remainingSeconds % 60).padStart(2, '0');
  timerEl.textContent = `${minutes}:${seconds}`;
};

const startQuizTimer = () => {
  if (state.quizProgress.timerId) {
    updateTimerDisplay();
    return;
  }

  const tick = () => {
    if (state.quizProgress.remainingSeconds <= 0) {
      finalizeQuiz();
      return;
    }
    state.quizProgress.remainingSeconds -= 1;
    updateTimerDisplay();
  };

  updateTimerDisplay();
  state.quizProgress.timerId = setInterval(tick, 1000);
};

const stopQuizTimer = () => {
  if (state.quizProgress.timerId) {
    clearInterval(state.quizProgress.timerId);
    state.quizProgress.timerId = null;
  }
};

navButtons.forEach((button) => button.addEventListener('click', () => setRoute(button.dataset.route)));

themeToggle.addEventListener('click', toggleTheme);
newQuizBtn.addEventListener('click', handleNewQuiz);

const init = () => {
  injectFieldStyles();
  render();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
