import { NextResponse } from "next/server";
import { RAW_FAQ_DATA } from "../../help/faq-data";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MODEL_NAME = "meta-llama/llama-3.3-70b-instruct:free";

function buildFaqContext(language: string) {
  const useFrench = language !== "en";
  return RAW_FAQ_DATA.map((item) => {
    const q = useFrench ? item.question_fr : item.question_en;
    const a = useFrench ? item.answer_fr : item.answer_en;
    return `Q: ${q}\nA: ${a}`;
  }).join("\n\n");
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Missing OPENROUTER_API_KEY. Set it in your environment variables.",
      },
      { status: 500 }
    );
  }

  let body: { message?: string; history?: ChatMessage[]; language?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userMessage = (body.message || "").trim();
  const language = (body.language || "fr").toLowerCase();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!userMessage) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const greetingRegex =
    language === "en"
      ? /^(hi|hello|hey|good (morning|afternoon|evening))[\s!.,?]*$/i
      : /^(salut|bonjour|bonsoir|coucou|hello|hey)[\s!.,?]*$/i;

  if (greetingRegex.test(userMessage)) {
    const greetingReply =
      language === "en"
        ? "Hi! How can I help you with BusStation today?"
        : "Bonjour ! Comment puis-je vous aider avec BusStation aujourd'hui ?";
    return NextResponse.json({ reply: greetingReply });
  }

  const systemPrompt =
    language === "en"
      ? "You are BusStation Help Assistant. Answer only using the FAQ content provided. If the answer is not in the FAQ, say you don't know and suggest contacting support."
      : "Vous êtes l'assistant d'aide BusStation. Répondez uniquement à partir du contenu FAQ fourni. Si la réponse n'est pas dans la FAQ, dites que vous ne savez pas et proposez de contacter le support.";

  const faqContext = buildFaqContext(language);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `FAQ:\n${faqContext}` },
    ...history.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: "user", content: userMessage },
  ];

  const fallbackReply =
    language === "en"
      ? "I couldn't find information matching your request in our FAQ. For specific questions, please contact support: 📧 bryanngoupeyou9@gmail.com 📞 +237 655 12 10 10 💬 Live chat (8am-6pm, Mon-Fri)."
      : "Je ne trouve pas d'information correspondant à votre demande dans notre FAQ. Pour toute question spécifique, veuillez contacter notre support : 📧 bryanngoupeyou9@gmail.com 📞 +237 655 12 10 10 💬 Chat en direct (8h-18h, lun-ven).";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "BusStation Help Chatbot",
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      temperature: 0.2,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const rawText = await response.text();
    let detail: unknown = rawText;
    try {
      detail = JSON.parse(rawText);
    } catch {
      // keep raw text
    }
    console.error("OpenRouter error:", response.status, detail);
    return NextResponse.json(
      { error: "OpenRouter error", status: response.status, detail },
      { status: 502 }
    );
  }

  const data = await response.json();
  const replyText =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.message?.reasoning ??
    data?.choices?.[0]?.delta?.content ??
    data?.choices?.[0]?.text ??
    "";

  const reply =
    typeof replyText === "string" && replyText.trim()
      ? replyText
      : fallbackReply;

  return NextResponse.json({ reply });
}
