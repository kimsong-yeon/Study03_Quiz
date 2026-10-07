# 상식 퀴즈 웹 앱 구현 계획

> **에이전트 작업자용:** 필수 하위 스킬: 이 계획은 superpowers:subagent-driven-development(추천) 또는 superpowers:executing-plans로 작업 단위별로 실행해요. 단계는 체크박스(`- [ ]`)로 진행 상황을 표시해요.

**목표:** 서버 없이 `index.html`을 열면 동작하는 4지선다 상식 퀴즈(연습, 스피드, 힌트 모드와 순위표)를 3단계로 만들어요.

**구조:** 앱은 일반 `<script>` 파일 4개예요. `script.js`는 4층으로 나눠요.
- 모드 규칙표(`MODES`)
- 화면을 건드리지 않는 순수 함수(한 판 진행 상태를 새 객체로 돌려주는 방식)
- 화면 코드(순수 함수를 불러 화면만 그림)
- 자체 점검(`node script.js`로 실행)

**기술:** HTML, CSS, 순수 JavaScript(외부 라이브러리 없음), `localStorage`, 자체 점검용 Node.js v24.21.0의 `node:assert/strict`

**명세:** [PRD.md](PRD.md). 실행하는 사람은 이 계획과 PRD를 함께 읽어요.

**버전 관리:** git 저장소예요(2026-10-07 `git init`, 브랜치 `master`). 단계마다 **체크포인트**(자체 점검 통과와 사용자 브라우저 확인)를 두고, 사용자가 확인하면 그 단계를 커밋해요.

**실행 방식:** 직접 실행이에요. Claude가 이 세션에서 작업 1~10을 차례로 구현하고, 마지막에 새 검토 에이전트가 전체를 한 번 검토해요.

## 전역 제약

- 앱 파일은 `index.html`, `style.css`, `script.js`, `questions.js` 4개뿐이에요. 다른 파일과 폴더(테스트 폴더 포함)는 만들지 않아요. 문서 `PRD.md`, `IMPL-PLAN.md`는 예외예요.
- `index.html`을 더블클릭(`file://`)해서 열면 동작해야 해요.
  - ES 모듈(`import`, `export`, `type="module"`)은 쓰지 않아요.
  - 스크립트는 `<body>` 끝에서 `questions.js` → `script.js` 순서로 불러와요.
- 외부 라이브러리, CDN, 웹 폰트는 쓰지 않아요.
- 대상 브라우저는 Windows의 최신 Chrome과 Edge예요.
- 카테고리는 `["한국사", "세계지리", "과학", "예술과 문화"]`예요. 카테고리마다 10문항, 모두 40문항이에요.
- 채점은 정답 1점, 힌트 쓴 정답 0.5점, 오답과 시간 초과 0점이에요. 만점은 10점이에요.
- 스피드 모드는 문항마다 15초예요.
- 순위표 저장 키는 `quiz.leaderboard.v1`이에요. 표마다 상위 5건을 남겨요. 이름은 앞뒤 공백을 뺀 뒤 1~10자예요.
- 화면 문구는 PRD 그대로 써요.
  - 안내와 판정: "순위표에 기록되지 않음", "정답!", "오답", "시간 초과(오답)", "이 브라우저에서는 기록을 저장할 수 없어요", "다시 풀기: N문제 중 M문제 맞힘"
  - 버튼: [시작], [다음], [결과 보기], [같은 설정으로 다시], [처음으로], [틀린 문제 다시 풀기], [남은 문제 다시 풀기], [힌트], [저장], [순위표 보기]
- 해설 줄 형식은 `${explanation} (출처: ${source})`예요.
- 사용자 입력(이름)과 문항 텍스트는 `textContent`로만 화면에 넣어요. `innerHTML`에 넣지 않아요.
- 자체 점검 명령은 `node script.js`예요.
  - 통과하면 마지막 줄이 `결과: N개 통과, 0개 실패`이고 종료 코드는 0이에요.
  - 이번 세션에서 `node`를 찾지 못하면 `"C:\Program Files\nodejs\node.exe" script.js`로 실행해요. 새 터미널에서는 `node`로 바로 실행돼요.

## 검토 중점

명세에 직접 적혀 있지 않지만 실제로 쓰다 보면 부딪히기 쉬운 상황이에요. 각 항목을 막는 점검이 어느 작업에 있는지 함께 적었어요.

1. **답을 고른 뒤 다른 보기를 또 누르거나 연타해요.** 첫 선택만 반영되고 점수가 두 번 오르지 않아야 해요. → 작업 3 `answerCurrent` 점검
2. **스피드 모드에서 0초가 되는 순간과 클릭이 겹쳐요.** 먼저 처리된 쪽만 반영돼야 해요. 시간 초과 뒤의 클릭이나 클릭 뒤의 시간 초과는 무시해요. → 작업 5 `timeoutCurrent` 점검
3. **힌트로 흐려진 보기를 누르거나, 힌트를 두 번 눌러요.** 아무 일도 일어나지 않아야 해요. → 작업 5 `answerCurrent`와 `useHint` 점검
4. **`localStorage`가 막혀 있거나 저장된 값이 손상됐어요.** 퀴즈는 계속되고, 막힌 경우에는 안내만 보여야 해요. → 작업 9 `loadBoard`와 `saveBoard` 점검
5. **[같은 설정으로 다시]나 [처음으로]로 스피드 판을 떠났는데 이전 타이머가 남아요.** 다른 화면에서 시간 초과가 처리되면 안 돼요. → 작업 7 `stopTimer` 호출 규칙과 브라우저 확인

---

## 파일 구조

| 파일 | 맡는 일 | 만드는 작업 |
|---|---|---|
| `questions.js` | `CATEGORIES`, `QUESTIONS`, 끝에 `module.exports` 한 줄 | 작업 1(틀), 작업 2(40문항) |
| `script.js` | 아래 순서로 구역을 나눔 | 작업 1부터 계속 |
| `index.html` | 화면 4개 섹션과 스크립트 태그 | 작업 4, 이후 확장 |
| `style.css` | 모든 스타일 | 작업 4, 이후 확장 |

`script.js`의 구역 순서는 이래요.
1. `// === 모드 규칙 ===`
2. `// === 순수 로직 ===`
3. `// === 순위표 저장 ===`
4. `// === 화면 ===`
5. `// === 자체 점검 ===`
6. `// === 시작 ===`

**공통 자료형**(작업 3에서 정하고 이후 모든 작업이 씀)
- `RoundItem` = `{ id, category, question, choices: [{ text, original }], answer, explanation, source }`
  - `choices`는 섞인 순서예요. `original`은 원래 위치(0~3)이고, `answer`는 원래 정답 위치예요.
- `RoundState` = `{ mode, category, items, index, score, correctCount, wrongIds, answered, usedHint, removed, result, retry }`
  - `removed`: 흐려진 보기의 화면 위치 배열
  - `result`: `null` 또는 `{ correct, picked, timedOut, points }`
  - `retry`: 다시 풀기 판인지 여부
- 상태를 바꾸는 순수 함수는 모두 **새 객체를 돌려줘요**. 무시해야 하는 입력이면 받은 객체를 **그대로** 돌려줘요.

---

# 단계 1. 연습 모드와 점수

**만들 것**
- 문항 형식 검사
- 40문항
- 한 판 진행 로직
- 시작, 문제, 결과 화면(연습 모드만, 모드 선택 없음)

**완료 기준**
- `node script.js`가 실패 0개로 끝나요.
- `file://`로 열면 콘솔 오류 없이 연습 한 판을 끝까지 할 수 있어요.
- 문항 내용 확인표 40줄을 대화에 남겨요.

**내가 브라우저에서 직접 확인할 항목**
- [ ] `index.html`을 더블클릭해서 열면 시작 화면이 나오고, 개발자 도구(F12) 콘솔에 빨간 오류가 없어요.
- [ ] 시작 화면에 카테고리 4개와 "연습 모드 · 순위표에 기록되지 않음"이 보이고, 모드 선택은 없어요.
- [ ] 카테고리를 고르고 [시작]을 누르면 그 카테고리 문제 10개가 차례로 나와요. 맨 위에 "카테고리 · n/10 · 점수"가 보여요.
- [ ] 답을 고르면 바로 보기가 잠기고, 정답은 초록색, 고른 오답은 빨간색으로 표시돼요. "정답!" 또는 "오답"과 "해설 … (출처: …)"가 나와요.
- [ ] 이미 답을 고른 뒤 다른 보기를 눌러도 아무 변화가 없어요.
- [ ] 10번째 문제에서는 버튼이 [결과 보기]이고, 결과 화면에 `X / 10`, 맞힌 수, 틀린 수, "순위표에 기록되지 않음"이 보여요.
- [ ] [같은 설정으로 다시]를 누르면 같은 카테고리로 새 판이 시작되고, 문제 순서와 보기 위치가 이전 판과 달라요.
- [ ] [처음으로]를 누르면 시작 화면으로 돌아가요.

### 작업 1: 자체 점검 틀과 문항 형식 검사

**파일:**
- 만들기: `script.js`(구역 주석, 순수 로직, 자체 점검, 시작 구역)
- 만들기: `questions.js`(`CATEGORIES`, 빈 `QUESTIONS`, `module.exports`)

**인터페이스:**
- 쓰는 것: 없음
- 만드는 것
  - `selfTest(name: string, fn: (ctx) => void)`: 점검 등록. `ctx = { questions, categories, assert }`
  - `runSelfTests(questions, categories, assert, log = console.log) → { passed: number, failed: number }`: 줄마다 `PASS 이름` 또는 `FAIL 이름 — 메시지`를 쓰고, 마지막 줄에 `결과: N개 통과, M개 실패`를 써요.
  - `makeValidQuestions(categories) → Question[]`: 점검용 가짜 문항. 카테고리마다 10개이고 `id`는 `t-<카테고리번호>-<번호>`예요.
  - `validateQuestions(questions, categories) → string[]`: 오류 문장 배열(빈 배열이면 통과).
    - 문항 하나의 오류는 `"<id>: <이유>"` 형식이에요. `id`가 없으면 `"#<배열 위치>: <이유>"`예요.
    - 개수 오류는 `"전체 문항이 40개가 아님 (N개)"`, `"<카테고리> 문항이 10개가 아님 (N개)"`예요.

- [ ] **1단계: `questions.js` 틀과 실패하는 점검 작성**

`questions.js`는 PRD 5.1 형식대로 만들어요. `QUESTIONS`는 빈 배열이에요. `script.js`에는 아래 점검과 시작 구역을 넣어요.

```js
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

// === 시작 ===
if (typeof document !== "undefined") {
  // 작업 4에서 initApp()을 부름
} else {
  const { CATEGORIES, QUESTIONS } = require("./questions.js");
  const { failed } = runSelfTests(QUESTIONS, CATEGORIES, require("node:assert/strict"));
  process.exitCode = failed === 0 ? 0 : 1;
}
```

- [ ] **2단계: 점검이 실패하는지 확인**

실행: `node script.js`
기대: `selfTest`나 `runSelfTests`가 정의되지 않았다는 오류로 끝나요.

- [ ] **3단계: `selfTest`, `runSelfTests`, `makeValidQuestions`, `validateQuestions` 구현**

- `runSelfTests`는 각 점검을 `try/catch`로 감싸요. 하나가 실패해도 나머지 점검은 계속 실행해요.
- `validateQuestions`는 PRD 5.3의 항목을 모두 검사해요. 보기 중복과 빈 값은 앞뒤 공백을 뺀 값으로 판단해요.

- [ ] **4단계: 점검 통과 확인**

실행: `node script.js`
기대: `PASS` 3줄, `결과: 3개 통과, 0개 실패`, 종료 코드 0

### 작업 2: 40문항 작성

**파일:**
- 고치기: `questions.js`(`QUESTIONS`에 40개 채우기)
- 고치기: `script.js`(자체 점검 구역에 점검 2개 추가)

**인터페이스:**
- 쓰는 것: `validateQuestions`(작업 1)
- 만드는 것: `QUESTIONS`. `id`는 `kh-01`~`kh-10`, `wg-01`~`wg-10`, `sc-01`~`sc-10`, `ac-01`~`ac-10`이에요.

- [ ] **1단계: 실패하는 점검 작성**

```js
selfTest("실제 문항: 형식 검사 통과", ({ questions, categories, assert }) => {
  assert.deepStrictEqual(validateQuestions(questions, categories), []);
});
selfTest("실제 문항: '가장'을 쓴 문항은 기준과 연도를 적음", ({ questions, assert }) => {
  for (const q of questions.filter(q => q.question.includes("가장"))) {
    assert.match(q.question, /기준/, q.id);
    assert.match(q.question, /\d{4}년/, q.id);
  }
});
```

- [ ] **2단계: 점검이 실패하는지 확인**

실행: `node script.js`
기대: `FAIL 실제 문항: 형식 검사 통과 — … 전체 문항이 40개가 아님 (0개) …`

- [ ] **3단계: 카테고리마다 10문항 작성 (한국사 → 세계지리 → 과학 → 예술과 문화)**

문항마다 PRD 5.2 규칙을 지켜요.
- 사실 하나하나를 웹 검색이나 페이지 읽기로 공신력 있는 출처와 직접 대조해요.
- 대조하지 못한 문항은 버리고 다른 문항으로 바꿔요.
- `source`에는 실제로 연 문서의 기관·문서명과 URL을 적어요.
- 오답 보기는 그럴듯하지만 명백히 틀린 것으로 골라요.
- 시점에 따라 답이 바뀌는 사실(인구, 면적 순위, 최고층 등)은 최상급을 쓰지 않는 문항으로 바꾸거나, 기준과 연도를 문제에 적어요.

- [ ] **4단계: 점검 통과 확인**

실행: `node script.js`
기대: `결과: 5개 통과, 0개 실패`

- [ ] **5단계: 문항 내용 확인표를 대화에 남기기**

40줄의 표로 남겨요. 칸은 `id | 정답 하나 ✓ | 출처 대조 ✓ | 최상급 기준·시점 ✓ 또는 해당 없음 | 출처`예요.

### 작업 3: 한 판 만들기와 진행 상태

**파일:**
- 고치기: `script.js`(순수 로직 구역과 자체 점검 구역)

**인터페이스:**
- 쓰는 것: `QUESTIONS` 형식(작업 1)
- 만드는 것(모두 순수 함수)
  - `shuffle(array, rng = Math.random) → array`: 새 배열을 돌려줘요. 피셔-예이츠 방식이고 `j = Math.floor(rng() * (i + 1))`예요.
  - `buildRound(questions, category, rng = Math.random) → RoundItem[]`: `category`에 맞는 문항만 골라 문항 순서와 보기 순서를 섞어요.
  - `correctPosition(item) → number`: 정답 보기의 화면 위치
  - `scoreAnswer(isCorrect, usedHint) → number`: 이 작업에서는 1 또는 0이에요. 0.5는 작업 5에서 넣어요.
  - `createRoundState(mode, category, items, retry = false) → RoundState`: `index 0`, 점수 0, `answered false`, `removed []`, `result null`
  - `answerCurrent(state, picked) → RoundState`: `picked`는 보기의 화면 위치(0~3)예요. 이미 답했으면 받은 객체를 그대로 돌려줘요. 오답이면 `wrongIds`에 현재 `id`를 넣어요.
  - `nextQuestion(state) → RoundState`: 답하기 전이면 그대로 돌려줘요. 다음으로 넘어가면 `index + 1`이 되고 `answered`, `usedHint`, `removed`, `result`를 초기화해요.
  - `isFinished(state) → boolean`: `state.index >= state.items.length`

- [ ] **1단계: 실패하는 점검 작성**

```js
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
```

- [ ] **2단계: 점검이 실패하는지 확인**

실행: `node script.js`
기대: 새 점검 5개가 `FAIL … is not defined`

- [ ] **3단계: 위 인터페이스대로 함수 구현**

- [ ] **4단계: 점검 통과 확인**

실행: `node script.js`
기대: `결과: 10개 통과, 0개 실패`

### 작업 4: 단계 1 화면 (연습 모드)

**파일:**
- 만들기: `index.html`, `style.css`
- 고치기: `script.js`(모드 규칙, 화면, 시작 구역)

**인터페이스:**
- 쓰는 것: 작업 1~3의 모든 순수 함수, 전역 `QUESTIONS`, `CATEGORIES`
- 만드는 것
  - `MODES = { practice: { label: "연습", timeLimit: null, hint: false, ranked: false, retryWrong: true } }`
  - 화면 상태 `app = { mode, category, round, firstResult }`. `firstResult`는 작업 8에서 써요.
  - `initApp()`: 형식 검사를 하고 시작 화면을 그려요. 오류가 있으면 `#validation-errors`에 목록을 보여 주고 [시작]을 비활성화해요.
  - `showScreen(name)`: `name`은 `"start"`, `"quiz"`, `"result"`, `"board"` 중 하나예요. 해당 `section#<name>-screen`만 보여요.
  - `startRound(mode, category)`, `renderQuestion()`, `renderResult()`
  - DOM id
    - 시작 화면
      - `#category-options`: `name="category"` 라디오 4개
      - `#start-mode-note`
      - `#start-button`
      - `#validation-errors`
    - 문제 화면
      - `#quiz-status`
      - `#question-text`
      - `#choices`: 보기 버튼 4개
      - `#feedback`: 그 안에 `#feedback-verdict`, `#feedback-explanation`
      - `#next-button`
    - 결과 화면
      - `#result-score`
      - `#result-counts`
      - `#result-unranked-note`
      - `#again-button`
      - `#home-button`
    - 순위표 화면: `#board-screen`은 이 작업에서 빈 섹션이에요.

- [ ] **1단계: `index.html`, `style.css` 작성**

- 4개 섹션과 위 id를 넣어요. 스크립트 태그는 `<script src="questions.js"></script><script src="script.js"></script>`를 `<body>` 끝에 둬요.
- 정답 보기는 `.correct`(초록), 고른 오답은 `.wrong`(빨강), 잠긴 보기는 `disabled`로 표시해요.
- 폭이 좁은 휴대폰 화면에서도 보기가 한 줄에 하나씩 보이게 해요.

- [ ] **2단계: 화면 코드 구현과 시작 구역 연결**

- 시작 구역의 브라우저 분기에서 `initApp()`을 불러요.
- 문구 규칙
  - `#start-mode-note`: "연습 모드 · 순위표에 기록되지 않음"
  - `#quiz-status`: `${category} · ${index + 1}/${items.length} · 점수 ${score}`
  - 판정: "정답!" 또는 "오답"
  - 해설 줄: `${explanation} (출처: ${source})`
  - 다음 버튼: 마지막 문제에서만 [결과 보기], 나머지는 [다음]
  - 결과: `#result-score` = `${score} / ${items.length}`, `#result-counts` = `맞힘 ${correctCount} · 틀림 ${wrongIds.length}`
  - `MODES[mode].ranked`가 `false`이면 `#result-unranked-note`에 "순위표에 기록되지 않음"을 보여 줘요.
- 텍스트는 모두 `textContent`로 넣어요.

- [ ] **3단계: 자체 점검 회귀 확인**

실행: `node script.js`
기대: `결과: 10개 통과, 0개 실패`. Node에는 `document`가 없으므로 화면 코드는 실행되지 않아요.

- [ ] **4단계: Claude가 브라우저로 미리 확인**

- 내장 브라우저로 `file:///C:/Users/user/OneDrive/문서/Study03_Quiz/index.html`을 열어요.
- 한 판을 끝까지 진행해요.
- 콘솔 오류가 0개이고, 위 "내가 브라우저에서 직접 확인할 항목"이 모두 맞는지 확인해요.

- [ ] **5단계: 체크포인트, 사용자 확인**

- 단계 1의 확인 항목을 사용자에게 건네요.
- 사용자가 확인을 마칠 때까지 단계 2를 시작하지 않아요.
- 확인이 끝나면 커밋해요: `git add -A && git commit -m "feat: 단계 1 연습 모드와 점수"`

---

# 단계 2. 스피드 모드, 힌트 모드, 모드 선택 화면, 틀린 문제 다시 풀기

**만들 것**
- 0.5점 채점, 힌트, 시간 초과의 순수 로직
- 모드 선택
- 힌트 화면
- 스피드 타이머
- 연습 모드의 틀린 문제 다시 풀기

**완료 기준**
- `node script.js`가 실패 0개로 끝나요.
- 3개 모드를 모두 끝까지 할 수 있어요.
- 단계 1 확인 항목도 그대로 통과해요.

**내가 브라우저에서 직접 확인할 항목**
- [ ] 시작 화면에서 모드 3개와 카테고리 4개를 고를 수 있어요. "순위표에 기록되지 않음"은 연습을 골랐을 때만 보여요.
- [ ] **스피드**: 문제마다 15부터 1초씩 줄어드는 숫자가 보여요.
- [ ] **스피드**: 아무것도 누르지 않고 0이 되면 "시간 초과(오답)"와 정답, 해설이 나오고 점수는 오르지 않아요.
- [ ] **스피드**: 답을 고르면 숫자가 그 자리에서 멈춰요. 해설을 몇 초 동안 읽어도 줄어들지 않아요. [다음]을 누르면 15부터 다시 세요.
- [ ] **스피드**: 판 도중 결과를 보고 [같은 설정으로 다시]나 [처음으로]를 누른 뒤 15초 넘게 기다려도, 엉뚱한 화면에 시간 초과가 뜨지 않아요.
- [ ] **힌트**: [힌트]를 누르면 오답 보기 2개가 흐려지고 눌리지 않아요. 정답 보기는 절대 흐려지지 않아요.
- [ ] **힌트**: [힌트]는 문제당 1번만 눌리고, 답을 고른 뒤에는 비활성화돼요.
- [ ] **힌트**: 힌트를 쓰고 맞히면 점수가 0.5 오르고(예: `점수 2.5`), 힌트를 쓰고 틀리면 그대로예요. 결과에 `7.5 / 10`처럼 소수가 나와요.
- [ ] **연습**: 틀린 문제가 있으면 결과 화면에 [틀린 문제 다시 풀기]가 나오고, 다 맞히면 나오지 않아요.
- [ ] **연습**: 다시 풀기는 틀렸던 문제만 나오고, 끝나면 "처음 점수: X / 10"과 "다시 풀기: N문제 중 M문제 맞힘"이 보여요.
- [ ] **연습**: 또 틀린 문제가 있으면 [남은 문제 다시 풀기]가 나오고, 남은 문제만으로 다시 진행돼요.
- [ ] 스피드와 힌트 결과 화면에는 [틀린 문제 다시 풀기]와 "순위표에 기록되지 않음"이 없어요.

### 작업 5: 모드 규칙 확장과 힌트·시간 초과 로직

**파일:**
- 고치기: `script.js`(모드 규칙, 순수 로직, 자체 점검)

**인터페이스:**
- 쓰는 것: `RoundState`, `answerCurrent`, `correctPosition`(작업 3)
- 만드는 것
  - `MODES`에 두 줄을 추가해요.
    - `speed: { label: "스피드", timeLimit: 15, hint: false, ranked: true, retryWrong: false }`
    - `hint: { label: "힌트", timeLimit: null, hint: true, ranked: true, retryWrong: false }`
  - `scoreAnswer(isCorrect, usedHint)`: 정답이면서 힌트를 썼으면 0.5
  - `pickHintRemovals(item, rng = Math.random) → number[]`: 정답이 아닌 화면 위치 중 서로 다른 2개를 돌려줘요. PRD 4.3의 `pickHintRemovals(choices)`를 구체화한 형태예요.
  - `useHint(state, rng = Math.random) → RoundState`
    - `MODES[mode].hint`가 `false`이거나, 이미 썼거나, 이미 답했으면 그대로 돌려줘요.
    - 아니면 `usedHint: true`로 바꾸고 `removed`를 채워요.
  - `answerCurrent` 보강: `picked`가 `removed`에 있으면 그대로 돌려줘요. 점수는 `scoreAnswer(correct, state.usedHint)`로 계산해요.
  - `timeoutCurrent(state) → RoundState`: 이미 답했으면 그대로 돌려줘요. 아니면 오답 처리하고 `result = { correct: false, picked: null, timedOut: true, points: 0 }`로 둬요.
  - `remainingSeconds(startedAt, now, limit) → number`: `Math.max(0, Math.ceil(limit - (now - startedAt) / 1000))`

- [ ] **1단계: 실패하는 점검 작성**

```js
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
```

- [ ] **2단계: 점검이 실패하는지 확인**

실행: `node script.js`
기대: 새 점검 6개가 `FAIL`

- [ ] **3단계: 위 인터페이스대로 구현**

- [ ] **4단계: 점검 통과 확인**

실행: `node script.js`
기대: `결과: 16개 통과, 0개 실패`

### 작업 6: 모드 선택 화면과 힌트 모드 화면

**파일:**
- 고치기: `index.html`, `style.css`, `script.js`(화면 구역)

**인터페이스:**
- 쓰는 것: `MODES`, `useHint`, `RoundState.removed`(작업 5)
- 만드는 것
  - DOM id
    - `#mode-options`: `name="mode"` 라디오 3개. 값은 `practice`, `speed`, `hint`이고 기본값은 `practice`예요.
    - `#hint-button`
  - `#start-mode-note` 규칙: 연습을 고르면 "순위표에 기록되지 않음"을 보여 주고, 다른 모드에서는 비워요.

- [ ] **1단계: 모드 라디오와 힌트 버튼 추가**

- `#hint-button`은 `MODES[mode].hint`일 때만 보여요.
- 버튼은 `usedHint`이거나 `answered`이면 `disabled`예요.
- `removed`에 든 보기는 `.removed`(흐림)와 `disabled`로 표시해요.

- [ ] **2단계: 자체 점검 회귀 확인**

실행: `node script.js`
기대: `결과: 16개 통과, 0개 실패`

- [ ] **3단계: 브라우저 확인**

- 내장 브라우저에서 힌트 모드 한 판을 진행해요.
- 단계 2 확인 항목 중 모드 선택, 힌트, 결과 소수 표시가 맞는지 봐요.

### 작업 7: 스피드 타이머

**파일:**
- 고치기: `index.html`(`#timer`), `style.css`, `script.js`(화면 구역)

**인터페이스:**
- 쓰는 것: `remainingSeconds`, `timeoutCurrent`(작업 5)
- 만드는 것
  - `startTimer()`: `app.timerStartedAt = Date.now()`로 기록하고 200ms 간격 `setInterval`을 시작해요. 시작 전에 항상 `stopTimer()`를 먼저 불러요.
  - `stopTimer()`: 인터벌을 지우고 핸들을 `null`로 둬요.
  - 매 틱마다 `remainingSeconds`를 `#timer`에 써요. 0이 되면 `stopTimer()`를 부르고, `app.round = timeoutCurrent(app.round)`로 바꾼 뒤 다시 그려요.
  - `stopTimer()` 호출 규칙: 답 선택 직후, 시간 초과 직후, `showScreen()`으로 문제 화면이 아닌 화면에 갈 때. `startTimer()`는 `MODES[mode].timeLimit`이 있고 새 문항을 그릴 때만 불러요.

- [ ] **1단계: 타이머 표시와 시작·정지 구현**

- 시간 초과일 때 판정 문구는 "시간 초과(오답)"이고, 정답 보기를 초록색으로 표시해요.
- `#timer`는 스피드 모드에서만 보여요.

- [ ] **2단계: 자체 점검 회귀 확인**

실행: `node script.js`
기대: `결과: 16개 통과, 0개 실패`

- [ ] **3단계: 브라우저 확인**

내장 브라우저에서 단계 2 확인 항목 중 스피드 4개를 확인해요. 특히 판을 떠난 뒤 15초 넘게 기다려 이전 타이머가 남지 않는지 봐요.

### 작업 8: 연습 모드 틀린 문제 다시 풀기

**파일:**
- 고치기: `index.html`, `script.js`(순수 로직, 화면, 자체 점검)

**인터페이스:**
- 쓰는 것: `buildRound`, `createRoundState(…, retry)`(작업 3)
- 만드는 것
  - `buildRetryRound(questions, category, wrongIds, rng = Math.random) → RoundItem[]`: `wrongIds`에 든 문항만 `buildRound`로 섞어요.
  - `app.firstResult = { score, total }`: 처음 판(`retry: false`)이 끝날 때 기록하고, 다시 풀기 중에는 바꾸지 않아요.
  - DOM id: `#retry-summary`, `#retry-button`

- [ ] **1단계: 실패하는 점검 작성**

```js
selfTest("buildRetryRound: 틀린 문항만, 섞여서", ({ questions, categories, assert }) => {
  const ids = questions.filter(q => q.category === categories[1]).slice(0, 3).map(q => q.id);
  const items = buildRetryRound(questions, categories[1], ids);
  assert.deepStrictEqual(items.map(i => i.id).sort(), [...ids].sort());
});
```

- [ ] **2단계: 점검이 실패하는지 확인**

실행: `node script.js`
기대: `FAIL buildRetryRound … is not defined`

- [ ] **3단계: `buildRetryRound`와 화면 구현**

- `MODES[mode].retryWrong`이 참이고 끝난 판의 `wrongIds`가 비어 있지 않을 때만 버튼이 보여요.
- 버튼 문구는 처음 판 뒤에는 [틀린 문제 다시 풀기], 다시 풀기 판 뒤에는 [남은 문제 다시 풀기]예요.
- 다시 풀기 판이 끝나면 결과 화면에 아래를 보여 줘요.
  - `#result-score` = `처음 점수: ${firstResult.score} / ${firstResult.total}`
  - `#retry-summary` = `다시 풀기: ${items.length}문제 중 ${correctCount}문제 맞힘`
- [같은 설정으로 다시]는 다시 풀기 판이 아닌 새 10문항 판을 시작해요.

- [ ] **4단계: 점검 통과 확인**

실행: `node script.js`
기대: `결과: 17개 통과, 0개 실패`

- [ ] **5단계: Claude가 브라우저로 미리 확인**

내장 브라우저에서 3개 모드를 한 판씩 하고, 단계 2와 단계 1 확인 항목을 모두 봐요. 콘솔 오류는 0개여야 해요.

- [ ] **6단계: 체크포인트, 사용자 확인**

- 단계 2의 확인 항목을 사용자에게 건네요.
- 사용자가 확인을 마칠 때까지 단계 3을 시작하지 않아요.
- 확인이 끝나면 커밋해요: `git add -A && git commit -m "feat: 단계 2 스피드·힌트 모드와 다시 풀기"`

---

# 단계 3. 점수 저장과 순위표 (`localStorage`)

**만들 것**
- 이름 검사, 기록 추가·정렬, 저장소 읽기·쓰기 로직
- 결과 화면의 이름 입력과 저장
- 순위표 화면
- 시작 화면의 [순위표 보기]

**완료 기준**
- `node script.js`가 실패 0개로 끝나요.
- 저장한 기록이 새로고침 뒤에도 순위표 8개에 남아요.
- 단계 1·2 확인 항목도 그대로 통과해요.

**내가 브라우저에서 직접 확인할 항목**
- [ ] 스피드나 힌트 판이 끝나면 결과 화면에 이름 입력란과 [저장]이 있어요. 연습 판에는 없어요.
- [ ] 빈 이름, 공백만 있는 이름, 11자 이상 이름은 저장되지 않고 이유가 보여요.
- [ ] 이름을 넣고 [저장]하면 그 모드·카테고리의 순위표가 보이고 방금 기록이 들어 있어요.
- [ ] 같은 판에서 저장은 한 번만 돼요. 저장 후 [저장]이 비활성화돼요.
- [ ] 시작 화면의 [순위표 보기]를 누르면 표 8개(스피드 4개, 힌트 4개)가 보이고, 각 표는 순위, 이름, 점수, 날짜(`YYYY-MM-DD`)를 보여 줘요.
- [ ] 같은 표에 6번 이상 저장해도 상위 5건만 보여요. 점수가 같으면 먼저 저장한 기록이 위에 있어요.
- [ ] 이름을 `<b>철수</b>`로 저장하면 굵은 글씨가 아니라 그 글자 그대로 보여요.
- [ ] 브라우저를 새로고침하거나 닫았다 다시 열어도 기록이 남아 있어요.
- [ ] (선택) 개발자 도구 콘솔에서 `localStorage.setItem("quiz.leaderboard.v1", "{깨짐")`를 실행한 뒤 새로고침하면, 순위표는 비어 보이고 퀴즈는 정상 동작해요.

### 작업 9: 순위표 로직과 저장소 처리

**파일:**
- 고치기: `script.js`(순위표 저장 구역과 자체 점검)

**인터페이스:**
- 쓰는 것: 없음(작업 10이 이 함수들을 써요)
- 만드는 것
  - `LEADERBOARD_KEY = "quiz.leaderboard.v1"`, `BOARD_SIZE = 5`
  - `boardKey(mode, category) → string`: `` `${mode}:${category}` ``
  - `normalizeName(raw) → string | null`: 앞뒤 공백을 빼고 1~10자면 그 문자열, 아니면 `null`
  - `addRecord(board, key, record) → board`: 원본은 바꾸지 않아요. `record = { name, score, savedAt }`(ISO 문자열)이고, `score` 내림차순 → `savedAt` 오름차순으로 정렬한 뒤 5건으로 잘라요.
  - `loadBoard(storage) → { board, ok }`
    - `storage.getItem`이 예외를 던지면 `{ board: {}, ok: false }`
    - 값이 없거나 JSON이 깨졌거나 객체가 아니면 `{ board: {}, ok: true }`
  - `saveBoard(storage, board) → boolean`: `setItem` 예외는 `false`
  - `formatDate(iso) → "YYYY-MM-DD"`: 로컬 시간 기준

- [ ] **1단계: 실패하는 점검 작성**

```js
const fakeStorage = (initial) => {
  const m = new Map(initial === undefined ? [] : [[LEADERBOARD_KEY, initial]]);
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
};
const brokenStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };

selfTest("normalizeName: 공백 제거, 1~10자", ({ assert }) => {
  assert.strictEqual(normalizeName("  철수 "), "철수");
  assert.strictEqual(normalizeName("   "), null);
  assert.strictEqual(normalizeName("가".repeat(10)), "가".repeat(10));
  assert.strictEqual(normalizeName("가".repeat(11)), null);
});
selfTest("addRecord: 점수 내림차순, 동점은 먼저 저장한 기록 위, 5건", ({ assert }) => {
  let b = {};
  const k = boardKey("hint", "과학");
  assert.strictEqual(k, "hint:과학");
  [["A", 7.5, "2026-10-07T01:00:00.000Z"], ["B", 9, "2026-10-07T02:00:00.000Z"],
   ["C", 7.5, "2026-10-07T00:30:00.000Z"], ["D", 3, "2026-10-07T03:00:00.000Z"],
   ["E", 10, "2026-10-07T04:00:00.000Z"], ["F", 5, "2026-10-07T05:00:00.000Z"]]
    .forEach(([name, score, savedAt]) => { b = addRecord(b, k, { name, score, savedAt }); });
  assert.deepStrictEqual(b[k].map(r => r.name), ["E", "B", "C", "A", "F"]);
  const before = JSON.stringify(b);
  addRecord(b, k, { name: "G", score: 1, savedAt: "2026-10-07T06:00:00.000Z" });
  assert.strictEqual(JSON.stringify(b), before);    // 원본 불변
});
selfTest("loadBoard·saveBoard: 정상 왕복, 손상·차단 처리", ({ assert }) => {
  const s = fakeStorage();
  assert.deepStrictEqual(loadBoard(s), { board: {}, ok: true });
  const b = addRecord({}, "speed:한국사", { name: "철수", score: 8, savedAt: "2026-10-07T01:00:00.000Z" });
  assert.strictEqual(saveBoard(s, b), true);
  assert.deepStrictEqual(loadBoard(s), { board: b, ok: true });
  assert.deepStrictEqual(loadBoard(fakeStorage("{깨짐")), { board: {}, ok: true });
  assert.deepStrictEqual(loadBoard(fakeStorage("[1,2]")), { board: {}, ok: true });
  assert.deepStrictEqual(loadBoard(brokenStorage), { board: {}, ok: false });
  assert.strictEqual(saveBoard(brokenStorage, b), false);
});
selfTest("formatDate: 로컬 날짜 YYYY-MM-DD", ({ assert }) => {
  assert.strictEqual(formatDate(new Date(2026, 9, 7, 12).toISOString()), "2026-10-07");
});
```

- [ ] **2단계: 점검이 실패하는지 확인**

실행: `node script.js`
기대: 새 점검 4개가 `FAIL`

- [ ] **3단계: 위 인터페이스대로 구현**

- [ ] **4단계: 점검 통과 확인**

실행: `node script.js`
기대: `결과: 21개 통과, 0개 실패`

### 작업 10: 결과 저장과 순위표 화면

**파일:**
- 고치기: `index.html`, `style.css`, `script.js`(화면 구역)

**인터페이스:**
- 쓰는 것: `boardKey`, `normalizeName`, `addRecord`, `loadBoard`, `saveBoard`, `formatDate`, `LEADERBOARD_KEY`(작업 9)
- 만드는 것
  - DOM id
    - 결과 화면: `#save-form`(그 안에 `#name-input`, `#save-button`), `#save-message`
    - 시작 화면: `#board-button`
    - 순위표 화면: `#boards`, `#board-home-button`
  - `app.saved: boolean`: 새 판을 시작하면 `false`가 돼요.
  - `renderBoards()`: `MODES` 중 `ranked`인 모드 × `CATEGORIES` 순서로 표를 8개 그려요. 기록이 없는 표에는 "기록 없음"을 보여 줘요.
  - 저장소는 `window.localStorage`예요. 이 속성에 접근하는 것만으로 예외가 날 수 있어서, 접근도 `try/catch`로 감싸고 실패하면 `brokenStorage`와 같은 동작으로 대신해요.

- [ ] **1단계: 저장 폼과 순위표 화면 구현**

- `#save-form`은 `MODES[mode].ranked`이고 다시 풀기 판이 아닐 때만 보여요.
- 저장 흐름
  - `normalizeName`이 `null`이면 `#save-message`에 "이름은 1~10자로 입력해 주세요"를 보여 줘요.
  - `saveBoard`가 `false`이면 "이 브라우저에서는 기록을 저장할 수 없어요"를 보여 줘요. 퀴즈 화면 버튼은 계속 동작해요.
  - 저장에 성공하면 `app.saved = true`로 두고 `[저장]`을 비활성화한 뒤, 순위표 화면을 열어 그 모드·카테고리 표가 보이도록 스크롤해요.
- 표의 칸은 순위, 이름, 점수, 날짜예요. 모든 값은 `textContent`로 넣어요.

- [ ] **2단계: 자체 점검 회귀 확인**

실행: `node script.js`
기대: `결과: 21개 통과, 0개 실패`

- [ ] **3단계: Claude가 브라우저로 미리 확인**

- 내장 브라우저에서 스피드와 힌트 판을 저장하고, 새로고침 뒤에도 기록이 남는지 봐요.
- 6건 저장 시 상위 5건만 보이는지, HTML 이름이 글자 그대로 보이는지 확인해요.
- 단계 1·2 확인 항목도 다시 훑어요.

- [ ] **4단계: 체크포인트, 사용자 확인**

- 단계 3의 확인 항목을 사용자에게 건네요.
- 확인이 끝나면 커밋해요: `git add -A && git commit -m "feat: 단계 3 점수 저장과 순위표"`
- 그다음 새 검토 에이전트가 전체를 한 번 검토하고, 지적 사항을 처리하면 구현이 끝나요.
