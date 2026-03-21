import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are a spreadsheet expert. Return ONLY valid JSON no markdown no backticks. Use Indian names INR currency. Formula columns use {row} like =B{row}*0.12. Leave formula values as empty string in sampleData. Output schema: {"name":"Sheet","columns":[{"header":"Name","type":"text","width":150}],"rows":5,"sampleData":[["Arjun",50000,""]],"formatting":{"headerBg":"#1a1a24","alternateRows":true,"currency":"INR"}}`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { prompt } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: "Prompt too short" }, { status: 400 });
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: `Create spreadsheet for: "${prompt.trim()}". Return ONLY JSON.` }], temperature: 0.3, max_tokens: 3000 }),
    });
    const groqData = await response.json();
    if (!response.ok) throw new Error(groqData.error?.message || "Groq error");
    const raw = groqData.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);
    if (!data.columns) throw new Error("Invalid");
    if (!data.sampleData) data.sampleData = [];
    data.rows = data.sampleData.length;
    if (session?.user) await prisma.user.update({ where: { email: session.user.email! }, data: { sheetsCount: { increment: 1 } } });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("generate-sheet error:", err);
    return NextResponse.json({ name: "Sample Salary Sheet", columns: [{ header: "Employee Name", type: "text", width: 160 }, { header: "Department", type: "text", width: 130 }, { header: "Basic Salary", type: "currency", width: 130 }, { header: "HRA 40%", type: "formula", width: 120, formula: "=C{row}*0.40" }, { header: "PF 12%", type: "formula", width: 110, formula: "=C{row}*0.12" }, { header: "Tax 10%", type: "formula", width: 110, formula: "=C{row}*0.10" }, { header: "Net Pay", type: "formula", width: 130, formula: "=C{row}+D{row}-E{row}-F{row}" }], rows: 5, sampleData: [["Arjun Sharma", "Engineering", 65000, "", "", "", ""], ["Priya Nair", "Marketing", 55000, "", "", "", ""], ["Rohit Verma", "Sales", 48000, "", "", "", ""], ["Ananya Iyer", "HR", 52000, "", "", "", ""], ["Karan Mehta", "Engineering", 72000, "", "", "", ""]], formatting: { headerBg: "#1a1a24", alternateRows: true, currency: "INR" } });
  }
}
