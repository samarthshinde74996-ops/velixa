import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/spreadsheet-utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planName } = await req.json();
  const plan = PLANS.find((p) => p.name.toLowerCase() === planName.toLowerCase());
  if (!plan || plan.price === 0)
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  try {
    // Dynamically import Razorpay only if keys are set
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: plan.price * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save pending payment
    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    await prisma.payment.create({
      data: {
        userId: user!.id,
        razorpayOrderId: order.id as string,
        amount: plan.price,
        plan: planName,
        status: "pending",
      },
    });

    return NextResponse.json({ orderId: order.id, amount: plan.price * 100, currency: "INR" });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
