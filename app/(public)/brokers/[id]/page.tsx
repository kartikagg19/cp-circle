import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CheckCircle2, MapPin, Phone, Building2, Calendar } from "lucide-react";
import { timeAgo } from "@/lib/utils";

// Render per-request so broker profiles are always fresh and the build does not
// query the database (no DATABASE_URL at build time).
export const dynamic = "force-dynamic";

async function getBroker(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        listings: {
          where: { isActive: true },
          include: { broker: true },
          orderBy: { createdAt: "desc" },
          take: 12,
        },
        _count: { select: { listings: { where: { isActive: true } } } },
      },
    });
  } catch {
    return null;
  }
}

export default async function BrokerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const broker = await getBroker(id);
  if (!broker) notFound();

  const wa = broker.whatsapp || broker.phone;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Profile Header */}
      <section className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-orange-100 text-orange-600 font-bold text-3xl flex items-center justify-center flex-shrink-0">
            {broker.avatar ? (
              <img src={broker.avatar} alt={broker.name} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              broker.name[0].toUpperCase()
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-bold">{broker.name}</h1>
              {broker.isVerified && (
                <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </div>
              )}
            </div>

            {broker.rera_number && (
              <p className="text-gray-400 text-sm mt-1">RERA: {broker.rera_number}</p>
            )}

            {broker.bio && (
              <p className="text-gray-300 text-sm mt-2 max-w-xl">{broker.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4 text-orange-400" />
                {broker._count.listings} active listings
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-orange-400" />
                Joined {timeAgo(broker.createdAt)}
              </span>
            </div>

            {broker.areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center md:justify-start">
                {broker.areas.map((area) => (
                  <span key={area} className="flex items-center gap-1 text-xs bg-white/10 border border-white/20 text-gray-200 px-2 py-1 rounded-full">
                    <MapPin className="h-3 w-3 text-orange-400" /> {area}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 md:mt-2">
            <WhatsAppButton phone={wa} size="lg" label="WhatsApp Broker" />
            <a
              href={`tel:+91${broker.phone.replace(/\D/g, "")}`}
              className="flex items-center justify-center gap-2 border-2 border-white/30 hover:border-orange-400 text-white hover:text-orange-400 px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              <Phone className="h-4 w-4" /> Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Listings */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Active Listings by {broker.name}
          <span className="text-orange-500 ml-2">({broker._count.listings})</span>
        </h2>

        {broker.listings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No active listings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {broker.listings.map((listing) => (
              <PropertyCard
                key={listing.id}
                {...listing}
                price={Number(listing.price)}
                broker={listing.broker}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
