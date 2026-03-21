import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, prompt, data } = await req.json();
  if (!name || !data) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const sheet = await prisma.sheet.create({
    data: { name, prompt: prompt ?? "", data: JSON.stringify(data), userId: user.id },
  });

  return NextResponse.json({ id: sheet.id, message: "Saved!" });
}
