import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey } = await req.json();
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "invalid messages" }, { status: 400 });
    }
    if (!key) {
      // Offline fallback response (no external call)
      const last = messages[messages.length - 1]?.content || "";
      return NextResponse.json({ content: `I'm offline but with you. ${last ? "You said: " + last : ""}` });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: "upstream", detail: t }, { status: 502 });
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "I am here.";
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}
