# ⚡ AI Panel — 3-Way Debate System

Claude + Gemini + LLaMA 3 동시 답변 & 토론 시스템

---

## 📁 폴더 구조

```
ai-panel/
├── api/
│   ├── chat.js      ← 3개 AI 동시 호출
│   ├── debate.js    ← 토론 처리
│   └── summary.js   ← 종합 분석
├── public/
│   └── index.html   ← 프론트엔드 UI
├── .env.example     ← API 키 템플릿
├── .gitignore
├── vercel.json
└── package.json
```

---

## 🚀 배포 방법 (GitHub + Vercel)

### 1단계 — API 키 발급

| AI | 발급 주소 | 비용 |
|---|---|---|
| Claude | https://console.anthropic.com | 유료 |
| Gemini | https://aistudio.google.com/apikey | 무료 |
| Groq(LLaMA) | https://console.groq.com | 무료 |

---

### 2단계 — GitHub에 올리기

1. https://github.com 접속 → 로그인
2. 우상단 `+` → `New repository`
3. Repository name: `ai-panel` → `Create repository`
4. 로컬에서:

```bash
cd ai-panel
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/내아이디/ai-panel.git
git push -u origin main
```

> ⚠️ `.env` 파일은 절대 업로드하지 마세요! (`.gitignore`에 포함됨)

---

### 3단계 — Vercel 배포

1. https://vercel.com 접속 → GitHub로 로그인
2. `Add New` → `Project`
3. `ai-panel` 레포지토리 선택 → `Import`
4. **Environment Variables** 섹션에서 API 키 입력:

```
ANTHROPIC_API_KEY = sk-ant-...
GEMINI_API_KEY    = AIza...
GROQ_API_KEY      = gsk_...
```

5. `Deploy` 클릭
6. 배포 완료 → `https://ai-panel-xxx.vercel.app` URL 생성

---

### 4단계 — 사용하기

1. `public/index.html` 을 브라우저에서 열기
   (또는 Vercel URL 직접 접속)
2. 서버 URL 입력: `https://ai-panel-xxx.vercel.app`
3. 질문 입력 → Enter

---

## ✦ 기능

- **병렬 호출**: 3개 AI가 동시에 답변 (시간 단축)
- **👍 동의 / 👎 반박**: AI 간 토론
- **✦ 종합 분석**: 3개 답변을 합쳐 최적 결론 도출
- **대화 히스토리**: 이전 맥락 유지

---

## 🔧 로컬 테스트

```bash
# .env 파일 생성
cp .env.example .env
# 키 입력 후

npm i -g vercel
vercel dev
# → http://localhost:3000
```
