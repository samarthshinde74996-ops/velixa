import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are a spreadsheet generation expert. Convert user descriptions into structured spreadsheet JSON.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation, no code fences, no backticks.
2. Use realistic Indian sample data (names, INR currency, Indian context).
3. Formula columns MUST use {row} placeholder (e.g. =B{row}*0.12).
4. Generate between 8 and 25 rows of sample data.
5. Leave formula column values as "" in sampleData — frontend computes them.
6. Column types: "text" | "number" | "currency" | "formula" | "date" | "percentage"

OUTPUT SCHEMA:
{
  "name": "Sheet Name",
  "columns": [{"header":"Name","type":"text","width":150},{"header":"Salary","type":"currency","width":130},{"header":"Tax","type":"formula","width":120,"formula":"=B{row}*0.10"}],
  "rows": 10,
  "sampleData": [["Arjun Sharma",65000,""],["Priya Nair",55000,""]],
  "formatting": {"headerBg":"#1a1a24","alternateRows":true,"currency":"INR"}
}

FORMULA EXAMPLES: PF="=B{row}*0.12" | Tax="=B{row}*0.10" | NetPay="=B{row}+C{row}-D{row}-E{row}" | Total="=B{row}*C{row}" | GST="=C{row}*0.18" | Attendance%="=D{row}/E{row}*100"

Indian context: mixed male/female names, INR salaries (25k-150k), DD/MM/YYYY dates, depts: Engineering/Marketing/Sales/HR/Finance`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { prompt } = await req.json();

    if (!prompt?.trim() || prompt.trim().length < 5) {
      return NextResponse.json({ error: "Prompt too short" }, { status: 400 });
    }

    if (session?.user) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
      if (user?.plan === "free" && user.sheetsCount >= 5) {
        return NextResponse.json({ error: "Free plan limit reached. Upgrade to Pro!", limitReached: true }, { status: 403 });
      }
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Create a spreadsheet for: "${prompt.trim()}"\n\nReturn ONLY the JSON object. No markdown, no backticks, no explanation.` },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    const groqData = await response.json();
    if (!response.ok) throw new Error(groqData.error?.message || "Groq API error");

    const raw = groqData.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty AI response");

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    if (!data.columns || !Array.isArray(data.columns)) throw new Error("Invalid schema");
    if (!data.sampleData || !Array.isArray(data.sampleData)) data.sampleData = [];
    data.rows = data.sampleData.length;

    if (session?.user) {
      await prisma.user.update({
        where: { email: session.user.email! },
        data: { sheetsCount: { increment: 1 } },
      });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("generate-sheet error:", err);
    return NextResponse.json(getFallback(), { status: 200 });
  }
}

function getFallback() {
  return {
    name: "Sample Salary Sheet",
    columns: [
      { header: "Employee Name", type: "text", width: 160 },
      { header: "Department", type: "text", width: 130 },
      { header: "Basic Salary", type: "currency", width: 130 },
      { header: "HRA (40%)", type: "formula", width: 120, formula: "=C{row}*0.40" },
      { header: "PF (12%)", type: "formula", width: 110, formula: "=C{row}*0.12" },
      { header: "Tax (10%)", type: "formula", width: 110, formula: "=C{row}*0.10" },
      { header: "Net Pay", type: "formula", width: 130, formula: "=C{row}+D{row}-E{row}-F{row}" },
    ],
    rows: 5,
    sampleData: [
      ["Arjun Sharma", "Engineering", 65000, "", "", "", ""],
      ["Priya Nair", "Marketing", 55000, "", "", "", ""],
      ["Rohit Verma", "Sales", 48000, "", "", "", ""],
      ["Ananya Iyer", "HR", 52000, "", "", "", ""],
      ["Karan Mehta", "Engineering", 72000, "", "", "", ""],
    ],
    formatting: { headerBg: "#1a1a24", alternateRows: true, currency: "INR" },
  };
}