import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { PropertyCard } from "@/components/PropertyCard";
import { formatPrice, timeAgo } from "@/lib/utils";
import {
  MapPin, BedDouble, Maximize2, Building, Layers, CheckCircle2,
  Home, Calendar, Phone, Share2, Eye, Tag
} from "lucide-react";

// Render per-request so listing detail is always fresh and the build does not
// query the database (no DATABASE_URL at build time).
export const dynamic = "force-dynamic";

async function getListing(id: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { broker: true },
    });
    if (listing) {
      await prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } });
    }
    return listing;
  } catch {
    return null;
  }
}

async function getSimilar(listing: { locality: string; bhk: number | null; type: string; id: string }) {
  try {
    return await prisma.listing.findMany({
      where: {
        locality: listing.locality,
        type: listing.type as any,
        isActive: true,
        NOT: { id: listing.id },
      },
      include: { broker: true },
      take: 3,
    });
  } catch {
    return [];
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const similar = await getSimilar(listing);
  const wa = listing.broker.whatsapp || listing.broker.phone;
  const furnishingLabel = listing.furnishing === "FURNISHED" ? "Furnished" : listing.furnishing === "SEMI_FURNISHED" ? "Semi-Furnished" : listing.furnishing === "UNFURNISHED" ? "Unfurnished" : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-100">
              {listing.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-1">
                  <div className="relative aspect-video">
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    {listing.isFeatured && (
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${listing.type === "SALE" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
                      For {listing.type === "SALE" ? "Sale" : "Rent"}
                    </span>
                  </div>
                  {listing.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-1">
                      {listing.images.slice(1, 5).map((img, i) => (
                        <div key={img} className="relative aspect-video">
                          <Image src={img} alt={`Photo ${i + 2}`} fill className="object-cover" />
                          {i === 3 && listing.images.length > 5 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                              +{listing.images.length - 5} more
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center text-gray-400">
                  <Home className="h-20 w-20" />
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 flex-shrink-0">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
              <div className="text-3xl font-extrabold text-orange-500 mt-2">{formatPrice(Number(listing.price))}</div>
              {listing.type === "RENT" && <span className="text-sm text-gray-500">/month</span>}
              <div className="flex items-center gap-1 text-gray-500 mt-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>{listing.locality}{listing.subLocality ? `, ${listing.subLocality}` : ""}</span>
                <span className="text-gray-400">• Pincode: {listing.pincode}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Eye className="h-3.5 w-3.5" /> {listing.views} views • Listed {timeAgo(listing.createdAt)}
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listing.bhk && (
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <BedDouble className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-900">{listing.bhk} BHK</div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                </div>
              )}
              {listing.area_sqft && (
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Maximize2 className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-900">{listing.area_sqft.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Sq. Ft.</div>
                </div>
              )}
              {listing.floor !== null && listing.floor !== undefined && (
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Layers className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-900">
                    {listing.floor}{listing.totalFloors ? `/${listing.totalFloors}` : ""}
                  </div>
                  <div className="text-xs text-gray-500">Floor</div>
                </div>
              )}
              {listing.possession && (
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Calendar className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-900 text-sm">{listing.possession}</div>
                  <div className="text-xs text-gray-500">Possession</div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {listing.propertyType === "RESIDENTIAL" ? "Residential" : "Commercial"}
              </span>
              {furnishingLabel && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{furnishingLabel}</span>
              )}
              {listing.amenities.map((a) => (
                <span key={a} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Property</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Map placeholder */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
              <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center text-gray-400 border border-gray-200">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                  <p className="text-sm">{listing.locality}, Mumbai</p>
                  <p className="text-xs text-gray-400 mt-1">Configure Google Maps API to see map</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Broker Card & CTA */}
          <div className="space-y-4">
            {/* Sticky contact card */}
            <div className="sticky top-24 space-y-4">
              {/* Price recap */}
              <div className="bg-orange-500 text-white rounded-2xl p-5">
                <div className="text-2xl font-extrabold">{formatPrice(Number(listing.price))}</div>
                {listing.type === "RENT" && <div className="text-orange-200 text-sm">per month</div>}
                <div className="text-orange-100 text-sm mt-1">{listing.locality}</div>
              </div>

              {/* Broker Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Listed By</h3>
                <Link href={`/brokers/${listing.broker.id}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                  <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 font-bold text-lg flex items-center justify-center flex-shrink-0">
                    {listing.broker.avatar ? (
                      <img src={listing.broker.avatar} alt={listing.broker.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      listing.broker.name[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                      {listing.broker.name}
                      {listing.broker.isVerified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                    </div>
                    {listing.broker.rera_number && (
                      <div className="text-xs text-gray-500">RERA: {listing.broker.rera_number}</div>
                    )}
                    {listing.broker.areas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {listing.broker.areas.slice(0, 2).map((a) => (
                          <span key={a} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>

                {/* CTA Buttons — only shown when broker has real contact */}
                {listing.broker.whatsapp ? (
                <div className="space-y-2">
                  <WhatsAppButton
                    phone={listing.broker.whatsapp}
                    context={{ title: listing.title, locality: listing.locality, price: Number(listing.price) }}
                    size="lg"
                    className="w-full justify-center"
                  />
                  <a
                    href={`tel:+91${listing.broker.whatsapp.replace(/\D/g, "")}`}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-orange-400 text-gray-700 hover:text-orange-600 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                  >
                    <Phone className="h-4 w-4" /> Call Broker
                  </a>
                </div>
                ) : (
                  <div className="text-center py-3 text-sm text-gray-400 bg-gray-50 rounded-xl">
                    Contact details coming soon
                  </div>
                )}
              </div>

              {/* Inquiry Form */}
              <InquiryForm listingId={listing.id} />
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Properties in {listing.locality}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((s) => (
                <PropertyCard
                  key={s.id}
                  {...s}
                  price={Number(s.price)}
                  broker={s.broker}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function InquiryForm({ listingId }: { listingId: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Send Inquiry</h3>
      <form action={`/api/leads`} method="POST" className="space-y-3">
        <input type="hidden" name="listingId" value={listingId} />
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Your Phone Number"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
        <textarea
          name="message"
          rows={3}
          placeholder="I'm interested in this property..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
        />
        <button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Send Inquiry
        </button>
      </form>
    </div>
  );
}
