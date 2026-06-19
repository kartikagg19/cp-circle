import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, MessageSquare, Eye, TrendingUp, PlusSquare, ClipboardList, ArrowRight } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";

async function getDashboardData(userId: string) {
  try {
    const [activeListings, totalLeads, recentLeads, totalViews] = await Promise.all([
      prisma.listing.count({ where: { brokerId: userId, isActive: true } }),
      prisma.lead.count({
        where: { listing: { brokerId: userId } },
      }),
      prisma.lead.findMany({
        where: { listing: { brokerId: userId } },
        include: { listing: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.listing.aggregate({
        where: { brokerId: userId },
        _sum: { views: true },
      }),
    ]);
    return { activeListings, totalLeads, recentLeads, totalViews: totalViews._sum.views || 0 };
  } catch {
    return { activeListings: 0, totalLeads: 0, recentLeads: [], totalViews: 0 };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const { activeListings, totalLeads, recentLeads, totalViews } = await getDashboardData(userId);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your listings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", value: activeListings, icon: Building2, color: "orange", href: "/dashboard/listings" },
          { label: "Total Leads", value: totalLeads, icon: MessageSquare, color: "green", href: "/dashboard/leads" },
          { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "blue", href: "/dashboard/listings" },
          { label: "This Month", value: recentLeads.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30*86400000)).length, icon: TrendingUp, color: "purple", href: "/dashboard/leads" },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group`}
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${
              color === "orange" ? "bg-orange-50" : color === "green" ? "bg-green-50" : color === "blue" ? "bg-blue-50" : "bg-purple-50"
            }`}>
              <Icon className={`h-5 w-5 ${
                color === "orange" ? "text-orange-500" : color === "green" ? "text-green-500" : color === "blue" ? "text-blue-500" : "text-purple-500"
              }`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/add-listing"
          className="flex items-center gap-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-5 transition-colors"
        >
          <PlusSquare className="h-8 w-8 flex-shrink-0" />
          <div>
            <div className="font-bold text-lg">Add New Listing</div>
            <div className="text-orange-100 text-sm">Publish a property to the platform</div>
          </div>
        </Link>
        <Link
          href="/dashboard/requirements"
          className="flex items-center gap-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl p-5 transition-colors"
        >
          <ClipboardList className="h-8 w-8 flex-shrink-0" />
          <div>
            <div className="font-bold text-lg">Post Requirement</div>
            <div className="text-gray-300 text-sm">Find properties for your clients</div>
          </div>
        </Link>
      </div>

      {/* Recent Leads */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Inquiries</h2>
          <Link href="/dashboard/leads" className="text-orange-500 text-sm hover:text-orange-600 flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No inquiries yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{lead.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                    Re: {lead.listing.title}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-400">{timeAgo(lead.createdAt)}</div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-xs text-orange-500 hover:text-orange-600 mt-0.5 block"
                  >
                    {lead.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
