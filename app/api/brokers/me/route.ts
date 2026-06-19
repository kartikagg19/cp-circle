import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  try {
    const broker = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, email: true, rera_number: true, areas: true, whatsapp: true, bio: true, avatar: true, isVerified: true },
    });
    if (!broker) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ broker });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  try {
    const body = await req.json();
    const { name, email, rera_number, areas, whatsapp, bio } = body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, email: email || null, rera_number: rera_number || null, areas: areas || [], whatsapp: whatsapp || null, bio: bio || null },
    });

    return NextResponse.json({ broker: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
