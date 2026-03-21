import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, currentSheet } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a spreadsheet editor. Modify the sheet based on user request. Current sheet: ${JSON.stringify(currentSheet)}. Return ONLY valid JSON with "sheet" (updated sheet data) and "message" (what changed). No markdown no backticks.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    const groqData = await response.json();
    if (!response.ok) throw new Error(groqData.error?.message);

    const raw = groqData.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response");

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("edit-sheet error:", err);
    return NextResponse.json({ message: "Could not process request." }, { status: 500 });
  }
}