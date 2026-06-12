export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { question, history = [] } = req.body;
  if (!question) return res.status(400).json({ error: "question required" });

  const messages = [...history, { role: "user", content: question }];

  const [claude, gemini, groq] = await Promise.allSettled([
    callClaude(messages),
    callGemini(messages),
    callGroq(messages),
  ]);

  res.json({
    claude:  claude.status  === "fulfilled" ? claude.value  : { error: claude.reason?.message },
    gemini:  gemini.status  === "fulfilled" ? gemini.value  : { error: gemini.reason?.message },
    groq:    groq.status    === "fulfilled" ? groq.value    : { error: groq.reason?.message },
  });
}

// ── Claude ──────────────────────────────────────────────
async function callClaude(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "당신은 Anthropic이 만든 Claude입니다. 논리적이고 균형 잡힌 시각으로 한국어로 명확하게 답변하세요.",
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

// ── Gemini ───────────────────────────────────────────────
async function callGemini(messages) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "당신은 Google이 만든 Gemini입니다. 실용적이고 데이터 중심으로 한국어로 답변하세요." }],
        },
        contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}

// ── Groq (LLaMA 3) ───────────────────────────────────────
async function callGroq(messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: "당신은 Meta의 오픈소스 AI LLaMA 3입니다. 직설적이고 기술적인 관점으로 한국어로 답변하세요.",
        },
        ...messages,
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.choices[0].message.content;
}
