import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyOwnership(listingId: string, userId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return null;
  if (listing.brokerId !== userId) return null;
  return listing;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { broker: true },
    });
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...listing, price: Number(listing.price) });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const listing = await verifyOwnership(id, userId);
  if (!listing) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

  try {
    const body = await req.json();
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...body,
        price: body.price ? BigInt(Math.round(body.price)) : undefined,
        amenities: body.amenities || listing.amenities,
      },
    });
    return NextResponse.json({ ...updated, price: Number(updated.price) });
  } catch {
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const listing = await verifyOwnership(id, userId);
  if (!listing) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

  try {
    const body = await req.json();
    const updated = await prisma.listing.update({ where: { id }, data: body });
    return NextResponse.json({ ...updated, price: Number(updated.price) });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.brokerId !== userId && role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await prisma.lead.deleteMany({ where: { listingId: id } });
    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
