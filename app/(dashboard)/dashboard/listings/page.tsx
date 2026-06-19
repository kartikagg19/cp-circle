import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/utils";
import { PlusSquare, Edit, Eye, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

async function getMyListings(userId: string) {
  try {
    return await prisma.listing.findMany({
      where: { brokerId: userId },
      include: { _count: { select: { leads: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function MyListingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const listings = await getMyListings(userId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500 mt-1">{listings.length} total listings</p>
        </div>
        <Link
          href="/dashboard/add-listing"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors text-sm"
        >
          <PlusSquare className="h-4 w-4" /> Add Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-20 text-center">
          <p className="text-gray-400 mb-4">No listings yet. Start by adding your first property.</p>
          <Link href="/dashboard/add-listing" className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold">
            + Add First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Property</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Locality</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Views</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Leads</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">{listing.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{timeAgo(listing.createdAt)}</div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-orange-500 whitespace-nowrap">
                    {formatPrice(Number(listing.price))}
                  </td>
                  <td className="px-4 py-4 text-gray-600 hidden md:table-cell">{listing.locality}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{listing.views}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{listing._count.leads}</td>
                  <td className="px-4 py-4 text-center">
                    <ToggleStatusButton listingId={listing.id} isActive={listing.isActive} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/property/${listing.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/listings/${listing.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButton listingId={listing.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ToggleStatusButton({ listingId, isActive }: { listingId: string; isActive: boolean }) {
  return (
    <form action={`/api/listings/${listingId}`} method="PATCH">
      <input type="hidden" name="isActive" value={(!isActive).toString()} />
      <button type="submit" className={`transition-colors ${isActive ? "text-green-500 hover:text-gray-400" : "text-gray-400 hover:text-green-500"}`} title={isActive ? "Deactivate" : "Activate"}>
        {isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
      </button>
    </form>
  );
}

function DeleteButton({ listingId }: { listingId: string }) {
  return (
    <form action={`/api/listings/${listingId}/delete`} method="POST"
      onSubmit={(e) => {
        if (!confirm("Delete this listing permanently?")) e.preventDefault();
      }}
    >
      <button type="submit" className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
