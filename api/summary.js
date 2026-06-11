export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { responses } = req.body;

  const prompt = `세 AI의 답변을 종합하여 가장 합리적인 결론을 도출해주세요.

Claude: ${responses.claude || "응답 없음"}
Gemini: ${responses.gemini || "응답 없음"}
LLaMA:  ${responses.groq || "응답 없음"}

각 AI의 관점 비교 → 공통점/차이점 정리 → 최종 균형 잡힌 결론을 4-5문장으로 제시하세요.`;

  try {
    const res2 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: "당신은 여러 AI의 답변을 분석·종합하는 메타 분석가입니다. 객관적이고 균형 잡힌 시각으로 정리하세요.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res2.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ summary: data.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
