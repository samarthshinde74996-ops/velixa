import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sheetId } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const sheet = await prisma.sheet.findFirst({ where: { id: sheetId, userId: user!.id } });
  if (!sheet) return NextResponse.json({ error: "Sheet not found" }, { status: 404 });

  return NextResponse.json({ url: `${process.env.NEXTAUTH_URL}/sheet/${sheet.id}` });
}