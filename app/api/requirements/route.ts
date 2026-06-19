import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  try {
    const requirements = await prisma.requirement.findMany({
      where: all ? { isActive: true } : { userId, isActive: true },
      include: { postedBy: { select: { id: true, name: true, phone: true, whatsapp: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      requirements: requirements.map((r) => ({
        ...r,
        budgetMin: Number(r.budgetMin),
        budgetMax: Number(r.budgetMax),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  try {
    const body = await req.json();
    const { bhk, type, locality, budgetMin, budgetMax, notes } = body;

    if (!bhk?.length || !locality?.length || !budgetMin || !budgetMax) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const requirement = await prisma.requirement.create({
      data: {
        userId,
        bhk,
        type,
        locality,
        budgetMin: BigInt(Math.round(budgetMin)),
        budgetMax: BigInt(Math.round(budgetMax)),
        notes: notes || null,
      },
    });

    return NextResponse.json({
      requirement: { ...requirement, budgetMin: Number(requirement.budgetMin), budgetMax: Number(requirement.budgetMax) },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
  }
}
