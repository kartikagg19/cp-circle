import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrokerCard } from "@/components/BrokerCard";
import { prisma } from "@/lib/prisma";
import { MUMBAI_LOCALITIES } from "@/constants/mumbai-areas";
import { Search, Users } from "lucide-react";

interface BrokersPageProps {
  searchParams: Promise<{ q?: string; area?: string; page?: string }>;
}

async function getBrokers(sp: Awaited<BrokersPageProps["searchParams"]>) {
  const page = parseInt(sp.page || "0");
  const where: any = { role: "BROKER" };

  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { rera_number: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.area) {
    where.areas = { has: sp.area };
  }

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
    return { brokers, total };
  } catch {
    return { brokers: [], total: 0 };
  }
}

export default async function BrokersPage({ searchParams }: BrokersPageProps) {
  const sp = await searchParams;
  const { brokers, total } = await getBrokers(sp);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-orange-400 text-sm mb-4">
            <Users className="h-4 w-4" /> Verified Mumbai Brokers
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Find a Broker</h1>
          <p className="text-gray-400 mb-8">Connect directly with verified RERA brokers across all Mumbai localities</p>

          <form className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                defaultValue={sp.q}
                placeholder="Search by name, RERA number..."
                className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
              />
            </div>
            <select
              name="area"
              defaultValue={sp.area}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm outline-none"
            >
              <option value="">All Areas</option>
              {MUMBAI_LOCALITIES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 text-sm">
            {total.toLocaleString()} brokers found
            {sp.area && <span className="text-orange-500"> in {sp.area}</span>}
          </p>
        </div>

        {brokers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No brokers found</h3>
            <p className="text-gray-400 mt-2">Try searching with different criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {brokers.map((broker) => (
              <BrokerCard key={broker.id} {...broker} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
