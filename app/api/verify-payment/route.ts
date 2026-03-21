import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature)
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

  // Upgrade user plan
  await prisma.user.update({
    where: { email: session.user.email },
    data: { plan: plan.toLowerCase() },
  });

  // Update payment record
  await prisma.payment.updateMany({
    where: { razorpayOrderId: razorpay_order_id },
    data: { status: "success", razorpayPayId: razorpay_payment_id },
  });

  return NextResponse.json({ success: true, plan });
}
