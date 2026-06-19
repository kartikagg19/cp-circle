import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Users, Building2, MessageSquare, TrendingUp, CheckCircle2, XCircle, Shield } from "lucide-react";

async function getAdminData() {
  try {
    const [totalBrokers, totalListings, totalLeads, unverifiedBrokers, recentListings] = await Promise.all([
      prisma.user.count({ where: { role: "BROKER" } }),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.lead.count(),
      prisma.user.findMany({
        where: { role: "BROKER", isVerified: false },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.listing.findMany({
        where: { isActive: true },
        include: { broker: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);
    return { totalBrokers, totalListings, totalLeads, unverifiedBrokers, recentListings };
  } catch {
    return { totalBrokers: 0, totalListings: 0, totalLeads: 0, unverifiedBrokers: [], recentListings: [] };
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const { totalBrokers, totalListings, totalLeads, unverifiedBrokers, recentListings } = await getAdminData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3">
        <Shield className="h-6 w-6 text-orange-400" />
        <h1 className="text-xl font-bold">MumbaiBrokers Admin</h1>
        <span className="ml-auto text-sm text-gray-400">Logged in as {session.user?.name}</span>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Brokers", value: totalBrokers, icon: Users, color: "blue" },
            { label: "Active Listings", value: totalListings, icon: Building2, color: "orange" },
            { label: "Total Leads", value: totalLeads, icon: MessageSquare, color: "green" },
            { label: "Pending Verify", value: unverifiedBrokers.length, icon: TrendingUp, color: "red" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <Icon className={`h-6 w-6 mb-3 ${color === "blue" ? "text-blue-500" : color === "orange" ? "text-orange-500" : color === "green" ? "text-green-500" : "text-red-500"}`} />
              <div className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Broker Verifications */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-900">
              Pending Verifications ({unverifiedBrokers.length})
            </div>
            {unverifiedBrokers.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">All brokers verified ✓</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {unverifiedBrokers.map((broker) => (
                  <div key={broker.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{broker.name}</div>
                      <div className="text-xs text-gray-500">{broker.phone} • {timeAgo(broker.createdAt)}</div>
                      {broker.rera_number && <div className="text-xs text-blue-500">RERA: {broker.rera_number}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <VerifyButton brokerId={broker.id} action="verify" />
                      <VerifyButton brokerId={broker.id} action="reject" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Listings */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-900">
              Recent Listings
            </div>
            <div className="divide-y divide-gray-50">
              {recentListings.map((listing) => (
                <div key={listing.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/property/${listing.id}`} className="font-medium text-gray-900 text-sm hover:text-orange-500 truncate block">
                      {listing.title}
                    </Link>
                    <div className="text-xs text-gray-500">{listing.locality} • {listing.broker.name}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-orange-500">{formatPrice(Number(listing.price))}</div>
                    <div className="text-xs text-gray-400">{timeAgo(listing.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function VerifyButton({ brokerId, action }: { brokerId: string; action: "verify" | "reject" }) {
  return (
    <form action={`/api/admin/brokers/${brokerId}`} method="POST">
      <input type="hidden" name="action" value={action} />
      <button
        type="submit"
        className={`p-1.5 rounded-lg transition-colors ${action === "verify" ? "text-green-500 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}
        title={action === "verify" ? "Verify broker" : "Reject/ban"}
      >
        {action === "verify" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      </button>
    </form>
  );
}
