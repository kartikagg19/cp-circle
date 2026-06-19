import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    let action: string;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      action = body.action;
    } else {
      const form = await req.formData();
      action = form.get("action") as string;
    }

    if (action === "verify") {
      await prisma.user.update({ where: { id }, data: { isVerified: true } });
    } else if (action === "reject") {
      await prisma.user.update({ where: { id }, data: { isVerified: false } });
    } else if (action === "feature") {
      await prisma.listing.update({ where: { id }, data: { isFeatured: true } });
    }

    if (!contentType.includes("application/json")) {
      return new Response(null, { status: 303, headers: { Location: "/admin" } });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
