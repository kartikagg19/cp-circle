import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  try {
    const leads = await prisma.lead.findMany({
      where: { listing: { brokerId: userId } },
      include: { listing: { select: { id: true, title: true, locality: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Support both JSON body and form data
    let name: string, phone: string, message: string | undefined, listingId: string;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      ({ name, phone, message, listingId } = body);
    } else {
      const form = await req.formData();
      name = form.get("name") as string;
      phone = form.get("phone") as string;
      message = form.get("message") as string | undefined;
      listingId = form.get("listingId") as string;
    }

    if (!name || !phone || !listingId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const session = await getServerSession(authOptions);
    const lead = await prisma.lead.create({
      data: {
        listingId,
        name,
        phone,
        message: message || null,
        contacterId: (session?.user as any)?.id || null,
      },
    });

    // Redirect back to listing page on form POST
    if (!contentType.includes("application/json")) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/property/${listingId}?inquiry=sent` },
      });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
