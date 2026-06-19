import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { prisma } from "@/lib/prisma";
import { LOCALITY_ZONES } from "@/constants/mumbai-areas";
import { Building2, Users, MapPin, ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

// Render per-request so live listing data is always fresh and the build does
// not query the database (no DATABASE_URL at build time).
export const dynamic = "force-dynamic";

async function getFeaturedListings() {
  try {
    return await prisma.listing.findMany({
      where: { isActive: true, isFeatured: true },
      include: { broker: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [listingCount, brokerCount] = await Promise.all([
      prisma.listing.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "BROKER" } }),
    ]);
    return { listingCount, brokerCount };
  } catch {
    return { listingCount: 40000, brokerCount: 10000 };
  }
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedListings(), getStats()]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-sm px-3 py-1 rounded-full mb-6 border border-orange-500/30">
            <Zap className="h-3.5 w-3.5" /> Mumbai's #1 Broker-to-Broker Network
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Find Property.<br />
            Find Brokers.<br />
            <span className="text-orange-400">All Mumbai.</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Connect with 10,000+ verified RERA brokers. Browse 40,000+ listings across 108 Mumbai localities. One WhatsApp away.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <SearchBar />
          </div>

          {/* Quick BHK filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map((bhk) => (
              <Link
                key={bhk}
                href={`/search?bhk=${bhk}&type=SALE`}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm px-4 py-1.5 rounded-full transition-colors"
              >
                {bhk} BHK Sale
              </Link>
            ))}
            <Link
              href="/search?type=RENT"
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-sm px-4 py-1.5 rounded-full transition-colors"
            >
              For Rent
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-orange-500 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-extrabold">{stats.listingCount.toLocaleString()}+</div>
            <div className="text-orange-100 text-sm mt-1">Active Listings</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">{stats.brokerCount.toLocaleString()}+</div>
            <div className="text-orange-100 text-sm mt-1">Verified Brokers</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold">108</div>
            <div className="text-orange-100 text-sm mt-1">Mumbai Localities</div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-500 text-sm mt-1">Hand-picked by our team</p>
            </div>
            <Link href="/search?featured=true" className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 text-sm">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((listing) => (
              <PropertyCard
                key={listing.id}
                {...listing}
                price={Number(listing.price)}
                broker={listing.broker}
              />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Area */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Area</h2>
            <p className="text-gray-500 text-sm mt-2">Explore properties in your preferred Mumbai locality</p>
          </div>
          {Object.entries(LOCALITY_ZONES).map(([zone, locs]) => (
            <div key={zone} className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                {zone}
              </h3>
              <div className="flex flex-wrap gap-2">
                {locs.map((loc) => (
                  <Link
                    key={loc}
                    href={`/search?locality=${encodeURIComponent(loc)}`}
                    className="bg-white border border-gray-200 hover:border-orange-400 hover:text-orange-600 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {loc}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by BHK Type */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Browse by BHK Type</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((bhk) => (
            <Link
              key={bhk}
              href={`/search?bhk=${bhk}`}
              className="group bg-white border-2 border-gray-100 hover:border-orange-400 rounded-xl p-6 text-center transition-all hover:shadow-md"
            >
              <div className="text-3xl font-extrabold text-orange-500 group-hover:scale-110 transition-transform inline-block">{bhk}</div>
              <div className="text-gray-600 font-medium mt-1">BHK</div>
              <div className="text-xs text-gray-400 mt-1">Properties</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">How It Works</h2>
          <p className="text-gray-400 mb-10">Simple, fast, and broker-first</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, step: "01", title: "Register as Broker", desc: "Create your free account, add your RERA number, and verify your phone." },
              { icon: Building2, step: "02", title: "List Your Properties", desc: "Add unlimited listings with photos, prices, and all details in minutes." },
              { icon: Users, step: "03", title: "Connect & Close Deals", desc: "Buyers and co-brokers find your listings and reach you directly on WhatsApp." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-extrabold text-gray-800 absolute -top-2 -left-2 select-none">{step}</div>
                <div className="relative bg-gray-800 rounded-xl p-6 text-left">
                  <Icon className="h-8 w-8 text-orange-500 mb-3" />
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl mt-10 transition-colors"
          >
            Register as Broker <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Why Brokers Love Us */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Why Brokers Choose CP Circle</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, title: "More Leads", desc: "Get direct inquiries from serious buyers and tenants searching for properties like yours." },
            { icon: Users, title: "Co-Brokerage", desc: "Share inventory with other brokers. Find matching properties for your clients faster." },
            { icon: Zap, title: "WhatsApp First", desc: "Every listing has a direct WhatsApp button. No forms, no delays — instant connections." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-orange-50 border border-orange-100 rounded-xl p-6">
              <Icon className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
