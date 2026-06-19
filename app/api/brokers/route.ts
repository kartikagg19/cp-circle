import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const where: any = { role: "BROKER" };

  const q = searchParams.get("q");
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { rera_number: { contains: q, mode: "insensitive" } },
    ];
  }

  const area = searchParams.get("area");
  if (area) where.areas = { has: area };

  const page = parseInt(searchParams.get("page") || "0");

  try {
    const [brokers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { _count: { select: { listings: { where: { isActive: true } } } } },
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
        take: 24,
        skip: page * 24,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ brokers, total, page });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
