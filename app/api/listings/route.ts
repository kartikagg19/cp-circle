import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  type: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  bhk: z.number().min(1).max(10).optional(),
  price: z.number().min(1),
  area_sqft: z.number().optional(),
  locality: z.string().min(1),
  subLocality: z.string().optional(),
  pincode: z.string().length(6),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  possession: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const where: any = { isActive: true };

  const locality = searchParams.get("locality");
  if (locality) where.locality = { in: locality.split(",").map((l) => l.trim()) };

  const bhk = searchParams.get("bhk");
  if (bhk) where.bhk = { in: bhk.split(",").map(Number) };

  const type = searchParams.get("type");
  if (type) where.type = type;

  const propertyType = searchParams.get("propertyType");
  if (propertyType) where.propertyType = propertyType;

  const furnishing = searchParams.get("furnishing");
  if (furnishing) where.furnishing = furnishing;

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = BigInt(minPrice);
    if (maxPrice) where.price.lte = BigInt(maxPrice);
  }

  const brokerId = searchParams.get("brokerId");
  if (brokerId) where.brokerId = brokerId;

  const page = parseInt(searchParams.get("page") || "0");
  const sort = searchParams.get("sort") || "newest";

  const orderBy: any =
    sort === "price_asc" ? { price: "asc" } :
    sort === "price_desc" ? { price: "desc" } :
    sort === "views" ? { views: "desc" } :
    { createdAt: "desc" };

  try {
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { broker: { select: { id: true, name: true, phone: true, whatsapp: true, isVerified: true, avatar: true } } },
        orderBy,
        take: 20,
        skip: page * 20,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings: listings.map((l) => ({ ...l, price: Number(l.price) })),
      total,
      page,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = CreateSchema.parse(body);
    const userId = (session.user as any).id;

    const listing = await prisma.listing.create({
      data: {
        ...data,
        price: BigInt(Math.round(data.price)),
        brokerId: userId,
        amenities: data.amenities || [],
      },
    });

    return NextResponse.json({ ...listing, price: Number(listing.price) }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
