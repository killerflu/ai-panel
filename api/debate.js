export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { aiKey, type, myResponse, otherResponses } = req.body;

  const personas = {
    claude: "당신은 Anthropic Claude입니다. 논리적이고 윤리적 관점으로 답변하세요.",
    gemini: "당신은 Google Gemini입니다. 데이터 중심의 실용적 관점으로 답변하세요.",
    groq:   "당신은 Meta LLaMA 3입니다. 직설적이고 기술적 관점으로 답변하세요.",
  };

  const others = Object.entries(otherResponses)
    .filter(([k, v]) => k !== aiKey && v)
    .map(([k, v]) => `${k.toUpperCase()}: ${v.slice(0, 400)}`)
    .join("\n\n");

  const prompt =
    type === "agree"
      ? `다른 AI들의 답변:\n${others}\n\n이 답변들의 공통점과 보완할 점을 2-3문장으로 말해주세요.`
      : `다른 AI들의 답변:\n${others}\n\n이 답변들에 대한 반박 또는 다른 시각을 2-3문장으로 제시해주세요.`;

  try {
    const answer = await callClaude(personas[aiKey] || personas.claude, prompt);
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function callClaude(system, prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}
