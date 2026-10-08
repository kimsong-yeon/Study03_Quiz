// === 모드 규칙 ===
const MODES = {
  practice: { label: "연습", timeLimit: null, hint: false, ranked: false, retryWrong: true },
  speed: { label: "스피드", timeLimit: 15, hint: false, ranked: true, retryWrong: false },
  hint: { label: "힌트", timeLimit: null, hint: true, ranked: true, retryWrong: false },
};

// === 순수 로직 ===
const QUESTIONS_PER_CATEGORY = 10;
const CHOICE_COUNT = 4;

const isBlank = value => typeof value !== "string" || value.trim() === "";

// 문항 형식 검사. 오류 문장 배열을 돌려주고, 빈 배열이면 통과예요.
function validateQuestions(questions, categories) {
  const errors = [];
  const total = categories.length * QUESTIONS_PER_CATEGORY;
  if (questions.length !== total) errors.push(`전체 문항이 ${total}개가 아님 (${questions.length}개)`);

  const seenIds = new Set();
  questions.forEach((q, i) => {
    const label = isBlank(q.id) ? `#${i}` : q.id;
    const fail = reason => errors.push(`${label}: ${reason}`);
    if (isBlank(q.id)) fail("id가 비어 있음");
    else if (seenIds.has(q.id)) fail("id가 겹침");
    else seenIds.add(q.id);
    if (!categories.includes(q.category)) fail(`알 수 없는 카테고리 (${q.category})`);
    if (isBlank(q.question)) fail("question이 비어 있음");
    if (!Array.isArray(q.choices) || q.choices.length !== CHOICE_COUNT) {
      fail(`보기가 ${CHOICE_COUNT}개가 아님`);
    } else if (q.choices.some(isBlank)) {
      fail("빈 보기가 있음");
    } else if (new Set(q.choices.map(c => c.trim())).size !== CHOICE_COUNT) {
      fail("보기가 서로 다르지 않음");
    }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= CHOICE_COUNT) {
      fail(`answer가 0~${CHOICE_COUNT - 1} 정수가 아님 (${q.answer})`);
    }
    if (isBlank(q.explanation)) fail("explanation이 비어 있음");
    if (isBlank(q.source)) fail("source가 비어 있음");
  });

  for (const c of categories) {
    const n = questions.filter(q => q.category === c).length;
    if (n !== QUESTIONS_PER_CATEGORY) errors.push(`${c} 문항이 ${QUESTIONS_PER_CATEGORY}개가 아님 (${n}개)`);
  }
  return errors;
}

// 피셔-예이츠 방식으로 섞은 새 배열을 돌려줘요. 원본은 바꾸지 않아요.
function shuffle(array, rng = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 그 카테고리 문항의 순서와 각 문항의 보기 순서를 섞은 RoundItem 목록이에요.
// 보기마다 원래 위치(original)를 들고 다니고, 채점은 answer와 비교해요.
function buildRound(questions, category, rng = Math.random) {
  return shuffle(questions.filter(q => q.category === category), rng).map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    choices: shuffle(q.choices.map((text, original) => ({ text, original })), rng),
    answer: q.answer,
    explanation: q.explanation,
    source: q.source,
  }));
}

// 틀린 문항(wrongIds)만으로 문항 순서와 보기 순서를 다시 섞어요.
function buildRetryRound(questions, category, wrongIds, rng = Math.random) {
  return buildRound(questions.filter(q => wrongIds.includes(q.id)), category, rng);
}

// 정답 보기의 화면 위치
function correctPosition(item) {
  return item.choices.findIndex(c => c.original === item.answer);
}

function scoreAnswer(isCorrect, usedHint) {
  if (!isCorrect) return 0;
  return usedHint ? 0.5 : 1;
}

// 정답이 아닌 화면 위치 중 서로 다른 2개를 골라요.
function pickHintRemovals(item, rng = Math.random) {
  const right = correctPosition(item);
  const wrong = item.choices.map((_, position) => position).filter(p => p !== right);
  return shuffle(wrong, rng).slice(0, 2);
}

function createRoundState(mode, category, items, retry = false) {
  return {
    mode,
    category,
    items,
    index: 0,
    score: 0,
    correctCount: 0,
    wrongIds: [],
    answered: false,
    usedHint: false,
    removed: [],
    result: null,
    retry,
  };
}

function isFinished(state) {
  return state.index >= state.items.length;
}

// picked는 보기의 화면 위치(0~3)예요. 이미 답했거나 무시할 입력이면 받은 객체를 그대로 돌려줘요.
function answerCurrent(state, picked) {
  if (state.answered || isFinished(state)) return state;
  const item = state.items[state.index];
  if (!Number.isInteger(picked) || picked < 0 || picked >= item.choices.length) return state;
  if (state.removed.includes(picked)) return state;
  const correct = picked === correctPosition(item);
  const points = scoreAnswer(correct, state.usedHint);
  return {
    ...state,
    answered: true,
    score: state.score + points,
    correctCount: state.correctCount + (correct ? 1 : 0),
    wrongIds: correct ? state.wrongIds : [...state.wrongIds, item.id],
    result: { correct, picked, timedOut: false, points },
  };
}

// 힌트 모드에서 문항마다 1번, 답하기 전에만 오답 2개를 흐려요.
function useHint(state, rng = Math.random) {
  if (!MODES[state.mode].hint || state.usedHint || state.answered || isFinished(state)) return state;
  return { ...state, usedHint: true, removed: pickHintRemovals(state.items[state.index], rng) };
}

// 이미 답했으면 그대로 돌려줘요. 먼저 일어난 쪽(답 또는 시간 초과)만 반영돼요.
function timeoutCurrent(state) {
  if (state.answered || isFinished(state)) return state;
  const item = state.items[state.index];
  return {
    ...state,
    answered: true,
    wrongIds: [...state.wrongIds, item.id],
    result: { correct: false, picked: null, timedOut: true, points: 0 },
  };
}

// 시작 시각 기준으로 남은 초를 계산해서, 화면 갱신이 늦어도 오차가 쌓이지 않아요.
function remainingSeconds(startedAt, now, limit) {
  return Math.max(0, Math.ceil(limit - (now - startedAt) / 1000));
}

// 답하기 전이면 그대로 돌려줘요.
function nextQuestion(state) {
  if (!state.answered) return state;
  return { ...state, index: state.index + 1, answered: false, usedHint: false, removed: [], result: null };
}

// === 순위표 저장 ===

// === 화면 ===
const UNRANKED_NOTE = "순위표에 기록되지 않음";
const SCREENS = ["start", "mode", "quiz", "result", "board"];

const app = { mode: "practice", category: null, round: null, firstResult: null, timer: null, timerStartedAt: null };

const $ = id => document.getElementById(id);

// 문제 화면이 아닌 화면으로 가면 타이머를 멈춰서, 떠난 판의 시간 초과가 처리되지 않게 해요.
function showScreen(name) {
  if (name !== "quiz") stopTimer();
  for (const s of SCREENS) $(`${s}-screen`).hidden = s !== name;
}

function initApp() {
  renderCategoryOptions();
  renderModeOptions();

  const errors = validateQuestions(QUESTIONS, CATEGORIES);
  const list = $("validation-errors");
  list.replaceChildren(...errors.map(text => {
    const li = document.createElement("li");
    li.textContent = text;
    return li;
  }));
  list.hidden = errors.length === 0;
  $("start-button").disabled = errors.length > 0;

  $("start-button").addEventListener("click", () => {
    const picked = document.querySelector('input[name="category"]:checked');
    if (!picked) return;
    app.category = picked.value;
    $("mode-category").textContent = `카테고리: ${picked.value}`;
    showScreen("mode");
  });
  $("mode-back-button").addEventListener("click", () => showScreen("start"));
  $("hint-button").addEventListener("click", onHint);
  $("next-button").addEventListener("click", () => {
    app.round = nextQuestion(app.round);
    if (isFinished(app.round)) renderResult();
    else renderQuestion();
  });
  $("retry-button").addEventListener("click", () => {
    const { mode, category, wrongIds } = app.round;
    startRound(mode, category, buildRetryRound(QUESTIONS, category, wrongIds), true);
  });
  $("again-button").addEventListener("click", () => startRound(app.mode, app.category));
  $("home-button").addEventListener("click", () => showScreen("start"));

  showScreen("start");
}

// 모드마다 버튼 하나. 누르면 고른 카테고리로 바로 10문제를 시작해요.
// 순위표에 기록되지 않는 모드는 버튼 아래에 안내를 붙여요.
function renderModeOptions() {
  $("mode-options").replaceChildren(...Object.entries(MODES).map(([key, mode]) => {
    const wrap = document.createElement("div");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary";
    button.dataset.mode = key;
    button.textContent = mode.label;
    button.addEventListener("click", () => startRound(key, app.category));
    wrap.append(button);
    if (!mode.ranked) {
      const note = document.createElement("p");
      note.className = "note";
      note.textContent = UNRANKED_NOTE;
      wrap.append(note);
    }
    return wrap;
  }));
}

function renderCategoryOptions() {
  $("category-options").replaceChildren(...CATEGORIES.map((category, i) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "category";
    input.value = category;
    input.checked = i === 0;
    label.append(input, document.createTextNode(category));
    return label;
  }));
}

// 다시 풀기 판(retry)이면 처음 판 결과(firstResult)를 그대로 둬요.
function startRound(mode, category, items = buildRound(QUESTIONS, category), retry = false) {
  app.mode = mode;
  app.category = category;
  app.round = createRoundState(mode, category, items, retry);
  if (!retry) app.firstResult = null;
  renderQuestion();
  showScreen("quiz");
}

function renderStatus() {
  const round = app.round;
  $("quiz-status").textContent = `${round.category} · ${round.index + 1}/${round.items.length} · 점수 ${round.score}`;
}

function renderQuestion() {
  const round = app.round;
  const item = round.items[round.index];
  const rules = MODES[round.mode];
  renderStatus();
  $("question-text").textContent = item.question;

  $("choices").replaceChildren(...item.choices.map((choice, position) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = choice.text;
    button.addEventListener("click", () => onChoice(position));
    return button;
  }));

  const hint = $("hint-button");
  hint.hidden = !rules.hint;
  hint.disabled = false;

  $("feedback").hidden = true;
  $("next-button").hidden = true;

  $("timer").hidden = rules.timeLimit === null;
  if (rules.timeLimit === null) stopTimer();
  else startTimer();
}

function onHint() {
  const before = app.round;
  app.round = useHint(before);
  if (app.round === before) return;
  $("hint-button").disabled = true;
  const buttons = $("choices").children;
  for (const position of app.round.removed) {
    buttons[position].classList.add("removed");
    buttons[position].disabled = true;
  }
}

function onChoice(position) {
  const before = app.round;
  app.round = answerCurrent(before, position);
  if (app.round === before) return;
  stopTimer();
  renderAnswer();
}

// 스피드 타이머. 남은 시간은 시작 시각을 기준으로 200ms마다 다시 계산해요.
function startTimer() {
  stopTimer();
  app.timerStartedAt = Date.now();
  tickTimer();
  app.timer = setInterval(tickTimer, 200);
}

function stopTimer() {
  if (app.timer !== null) clearInterval(app.timer);
  app.timer = null;
}

function tickTimer() {
  const left = remainingSeconds(app.timerStartedAt, Date.now(), MODES[app.round.mode].timeLimit);
  $("timer").textContent = `남은 시간 ${left}초`;
  if (left > 0) return;
  stopTimer();
  const before = app.round;
  app.round = timeoutCurrent(before);
  if (app.round !== before) renderAnswer();
}

function renderAnswer() {
  const round = app.round;
  const item = round.items[round.index];
  const { correct, picked, timedOut } = round.result;
  const right = correctPosition(item);

  renderStatus();
  $("hint-button").disabled = true;
  [...$("choices").children].forEach((button, position) => {
    button.disabled = true;
    button.classList.toggle("correct", position === right);
    button.classList.toggle("wrong", position === picked && !correct);
  });

  const verdict = $("feedback-verdict");
  verdict.textContent = timedOut ? "시간 초과(오답)" : correct ? "정답!" : "오답";
  verdict.className = `verdict ${correct ? "is-correct" : "is-wrong"}`;
  $("feedback-explanation").textContent = `${item.explanation} (출처: ${item.source})`;
  $("feedback").hidden = false;

  const next = $("next-button");
  next.textContent = round.index === round.items.length - 1 ? "결과 보기" : "다음";
  next.hidden = false;
  next.focus();
}

function renderResult() {
  const round = app.round;
  const rules = MODES[round.mode];
  if (!round.retry) app.firstResult = { score: round.score, total: round.items.length };

  const counts = $("result-counts");
  const summary = $("retry-summary");
  if (round.retry) {
    $("result-score").textContent = `처음 점수: ${app.firstResult.score} / ${app.firstResult.total}`;
    summary.textContent = `다시 풀기: ${round.items.length}문제 중 ${round.correctCount}문제 맞힘`;
  } else {
    $("result-score").textContent = `${round.score} / ${round.items.length}`;
    counts.textContent = `맞힘 ${round.correctCount} · 틀림 ${round.wrongIds.length}`;
  }
  counts.hidden = round.retry;
  summary.hidden = !round.retry;

  const retry = $("retry-button");
  retry.hidden = !(rules.retryWrong && round.wrongIds.length > 0);
  retry.textContent = round.retry ? "남은 문제 다시 풀기" : "틀린 문제 다시 풀기";

  const note = $("result-unranked-note");
  note.textContent = UNRANKED_NOTE;
  note.hidden = rules.ranked;
  showScreen("result");
}

// === 자체 점검 ===
const SELF_TESTS = [];

function selfTest(name, fn) {
  SELF_TESTS.push({ name, fn });
}

function runSelfTests(questions, categories, assert, log = console.log) {
  let passed = 0;
  let failed = 0;
  for (const { name, fn } of SELF_TESTS) {
    try {
      fn({ questions, categories, assert });
      passed++;
      log(`PASS ${name}`);
    } catch (err) {
      failed++;
      log(`FAIL ${name} — ${err && err.message}`);
    }
  }
  log(`결과: ${passed}개 통과, ${failed}개 실패`);
  return { passed, failed };
}

// 점검용 가짜 문항. 카테고리마다 10개이고 id는 t-<카테고리번호>-<번호>예요.
function makeValidQuestions(categories) {
  const questions = [];
  categories.forEach((category, ci) => {
    for (let n = 1; n <= QUESTIONS_PER_CATEGORY; n++) {
      const id = `t-${ci}-${n}`;
      questions.push({
        id,
        category,
        question: `${id} 문제`,
        choices: ["가", "나", "다", "라"].map(c => `${id} ${c}`),
        answer: n % CHOICE_COUNT,
        explanation: `${id} 해설`,
        source: `${id} 출처`,
      });
    }
  });
  return questions;
}

selfTest("validateQuestions: 올바른 40문항은 통과", ({ categories, assert }) => {
  assert.deepStrictEqual(validateQuestions(makeValidQuestions(categories), categories), []);
});
selfTest("validateQuestions: 잘못된 문항을 id와 함께 잡아냄", ({ categories, assert }) => {
  const cases = [
    q => { q.choices = q.choices.slice(0, 3); },           // 보기 3개
    q => { q.choices[1] = q.choices[0]; },                 // 보기 중복
    q => { q.choices[2] = " "; },                          // 빈 보기
    q => { q.answer = 4; },                                // 범위 밖
    q => { q.answer = 1.5; },                              // 정수 아님
    q => { q.explanation = ""; },
    q => { q.source = ""; },
    q => { q.question = ""; },
    q => { q.category = "역사"; },
  ];
  for (const breakIt of cases) {
    const qs = makeValidQuestions(categories);
    breakIt(qs[0]);
    const errors = validateQuestions(qs, categories);
    assert.ok(errors.some(e => e.startsWith(qs[0].id + ":")), breakIt.toString());
  }
});
selfTest("validateQuestions: 중복 id와 개수 오류", ({ categories, assert }) => {
  const dup = makeValidQuestions(categories);
  dup[1].id = dup[0].id;
  assert.ok(validateQuestions(dup, categories).some(e => e.includes("id")));
  const short = makeValidQuestions(categories).slice(1);
  const errors = validateQuestions(short, categories);
  assert.ok(errors.includes("전체 문항이 40개가 아님 (39개)"));
  assert.ok(errors.includes("한국사 문항이 10개가 아님 (9개)"));
});
selfTest("실제 문항: 형식 검사 통과", ({ questions, categories, assert }) => {
  assert.deepStrictEqual(validateQuestions(questions, categories), []);
});
selfTest("실제 문항: '가장'을 쓴 문항은 기준과 연도를 적음", ({ questions, assert }) => {
  for (const q of questions.filter(q => q.question.includes("가장"))) {
    assert.match(q.question, /기준/, q.id);
    assert.match(q.question, /\d{4}년/, q.id);
  }
});
selfTest("shuffle: 원소 유지, 원본 불변", ({ assert }) => {
  const a = [1, 2, 3, 4, 5];
  const s = shuffle(a);
  assert.deepStrictEqual(a, [1, 2, 3, 4, 5]);
  assert.deepStrictEqual([...s].sort(), [1, 2, 3, 4, 5]);
});
selfTest("buildRound: 그 카테고리 10문항, 섞어도 정답 판정 유지", ({ questions, categories, assert }) => {
  for (let n = 0; n < 50; n++) {
    for (const c of categories) {
      const items = buildRound(questions, c);
      assert.strictEqual(items.length, 10);
      for (const it of items) {
        assert.strictEqual(it.category, c);
        const src = questions.find(q => q.id === it.id);
        assert.strictEqual(it.choices[correctPosition(it)].text, src.choices[src.answer]);
      }
    }
  }
});
selfTest("scoreAnswer: 정답 1, 오답 0", ({ assert }) => {
  assert.strictEqual(scoreAnswer(true, false), 1);
  assert.strictEqual(scoreAnswer(false, false), 0);
});
selfTest("answerCurrent: 정답·오답 반영, 두 번째 선택은 무시", ({ questions, categories, assert }) => {
  let s = createRoundState("practice", categories[0], buildRound(questions, categories[0]));
  const right = correctPosition(s.items[0]);
  s = answerCurrent(s, right);
  assert.strictEqual(s.score, 1);
  assert.strictEqual(s.correctCount, 1);
  const again = answerCurrent(s, (right + 1) % 4);
  assert.strictEqual(again, s);                      // 연타·다른 보기 무시
  s = nextQuestion(s);
  const wrong = (correctPosition(s.items[1]) + 1) % 4;
  s = answerCurrent(s, wrong);
  assert.strictEqual(s.score, 1);
  assert.deepStrictEqual(s.wrongIds, [s.items[1].id]);
  assert.deepStrictEqual(s.result, { correct: false, picked: wrong, timedOut: false, points: 0 });
});
selfTest("nextQuestion·isFinished: 답하기 전에는 넘어가지 않고, 10번째 뒤 끝", ({ questions, categories, assert }) => {
  let s = createRoundState("practice", categories[0], buildRound(questions, categories[0]));
  assert.strictEqual(nextQuestion(s), s);
  for (let i = 0; i < 10; i++) s = nextQuestion(answerCurrent(s, 0));
  assert.ok(isFinished(s));
  assert.strictEqual(s.correctCount + s.wrongIds.length, 10);
});
selfTest("scoreAnswer: 힌트 쓴 정답 0.5, 힌트 쓴 오답 0", ({ assert }) => {
  assert.strictEqual(scoreAnswer(true, true), 0.5);
  assert.strictEqual(scoreAnswer(false, true), 0);
});
selfTest("pickHintRemovals: 서로 다른 오답 2개, 정답 제외", ({ questions, categories, assert }) => {
  for (let n = 0; n < 200; n++) {
    const item = buildRound(questions, categories[n % 4])[0];
    const r = pickHintRemovals(item);
    assert.strictEqual(r.length, 2);
    assert.notStrictEqual(r[0], r[1]);
    assert.ok(!r.includes(correctPosition(item)));
  }
  const item = buildRound(questions, categories[0])[0];
  for (const fixed of [0, 0.999]) assert.ok(!pickHintRemovals(item, () => fixed).includes(correctPosition(item)));
});
selfTest("useHint: 힌트 모드에서 1번만, 다른 모드·답한 뒤에는 무시", ({ questions, categories, assert }) => {
  const items = buildRound(questions, categories[0]);
  let s = useHint(createRoundState("hint", categories[0], items));
  assert.strictEqual(s.usedHint, true);
  assert.strictEqual(s.removed.length, 2);
  assert.strictEqual(useHint(s), s);
  const p = createRoundState("practice", categories[0], items);
  assert.strictEqual(useHint(p), p);
  const answered = answerCurrent(createRoundState("hint", categories[0], items), 0);
  assert.strictEqual(useHint(answered), answered);
});
selfTest("answerCurrent: 흐려진 보기는 무시, 힌트 쓴 정답 0.5", ({ questions, categories, assert }) => {
  let s = useHint(createRoundState("hint", categories[0], buildRound(questions, categories[0])));
  assert.strictEqual(answerCurrent(s, s.removed[0]), s);
  s = answerCurrent(s, correctPosition(s.items[0]));
  assert.strictEqual(s.score, 0.5);
});
selfTest("timeoutCurrent: 오답 처리, 답한 뒤 시간 초과와 시간 초과 뒤 답은 무시", ({ questions, categories, assert }) => {
  const s0 = createRoundState("speed", categories[0], buildRound(questions, categories[0]));
  const t = timeoutCurrent(s0);
  assert.deepStrictEqual(t.result, { correct: false, picked: null, timedOut: true, points: 0 });
  assert.deepStrictEqual(t.wrongIds, [s0.items[0].id]);
  assert.strictEqual(answerCurrent(t, correctPosition(t.items[0])), t);
  const a = answerCurrent(s0, correctPosition(s0.items[0]));
  assert.strictEqual(timeoutCurrent(a), a);
});
selfTest("remainingSeconds: 15에서 0까지, 음수 없음", ({ assert }) => {
  assert.strictEqual(remainingSeconds(0, 0, 15), 15);
  assert.strictEqual(remainingSeconds(0, 14001, 15), 1);
  assert.strictEqual(remainingSeconds(0, 15000, 15), 0);
  assert.strictEqual(remainingSeconds(0, 99999, 15), 0);
});
selfTest("buildRetryRound: 틀린 문항만, 섞여서", ({ questions, categories, assert }) => {
  const ids = questions.filter(q => q.category === categories[1]).slice(0, 3).map(q => q.id);
  const items = buildRetryRound(questions, categories[1], ids);
  assert.deepStrictEqual(items.map(i => i.id).sort(), [...ids].sort());
});

// === 시작 ===
if (typeof document !== "undefined") {
  initApp();
} else {
  const { CATEGORIES, QUESTIONS } = require("./questions.js");
  const { failed } = runSelfTests(QUESTIONS, CATEGORIES, require("node:assert/strict"));
  process.exitCode = failed === 0 ? 0 : 1;
}
