import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    // Development fallback — log OTP to console
    console.log(`[DEV OTP] +91${phone}: ${otp}`);
    return;
  }

  const message = `Your MumbaiBrokers OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=q&message=${encodeURIComponent(message)}&flash=0&numbers=${phone}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.return) throw new Error("SMS delivery failed");
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone?.match(/^\d{10}$/)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Cleanup old OTPs for this number
    await prisma.otpVerification.deleteMany({ where: { phone } });

    await prisma.otpVerification.create({
      data: { phone, otp, expiresAt },
    });

    await sendSms(phone, otp);

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
