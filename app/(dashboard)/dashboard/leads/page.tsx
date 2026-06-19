import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare, Phone, ExternalLink } from "lucide-react";

async function getLeads(userId: string) {
  try {
    return await prisma.lead.findMany({
      where: { listing: { brokerId: userId } },
      include: { listing: { select: { id: true, title: true, locality: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const leads = await getLeads(userId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads & Inquiries</h1>
        <p className="text-sm text-gray-500 mt-1">{leads.length} total inquiries received</p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-20 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No inquiries yet.</p>
          <p className="text-sm text-gray-400 mt-1">Leads will appear here when buyers/tenants contact you.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {leads.map((lead, idx) => (
            <div
              key={lead.id}
              className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${idx !== 0 ? "border-t border-gray-100" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {lead.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-400">{timeAgo(lead.createdAt)}</div>
                  </div>
                </div>
                {lead.message && (
                  <p className="text-sm text-gray-600 mt-2 ml-10 line-clamp-2">"{lead.message}"</p>
                )}
                <div className="mt-2 ml-10">
                  <Link
                    href={`/property/${lead.listing.id}`}
                    className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {lead.listing.title} — {lead.listing.locality}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`tel:+91${lead.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-1.5 border border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <Phone className="h-4 w-4" /> {lead.phone}
                </a>
                <a
                  href={`https://wa.me/91${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${lead.name}, thanks for your interest in ${lead.listing.title}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
