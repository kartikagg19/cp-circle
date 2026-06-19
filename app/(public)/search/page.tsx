import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { FilterPanel } from "@/components/FilterPanel";
import { SearchBar } from "@/components/SearchBar";
import { SortSelect } from "@/components/SortSelect";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Render per-request so search results reflect live data and the build does not
// query the database (no DATABASE_URL at build time).
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface SearchPageProps {
  searchParams: Promise<{
    locality?: string;
    bhk?: string;
    type?: string;
    propertyType?: string;
    furnishing?: string;
    minPrice?: string;
    maxPrice?: string;
    possession?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getListings(sp: Awaited<SearchPageProps["searchParams"]>) {
  const page = parseInt(sp.page || "0");
  const skip = page * PAGE_SIZE;

  const where: any = { isActive: true };

  if (sp.locality) {
    const locs = sp.locality.split(",").map((l) => l.trim());
    where.locality = { in: locs };
  }
  if (sp.bhk) {
    const bhks = sp.bhk.split(",").map(Number).filter(Boolean);
    where.bhk = { in: bhks };
  }
  if (sp.type) where.type = sp.type;
  if (sp.propertyType) where.propertyType = sp.propertyType;
  if (sp.furnishing) where.furnishing = sp.furnishing;
  if (sp.possession) where.possession = sp.possession;
  if (sp.minPrice || sp.maxPrice) {
    where.price = {};
    if (sp.minPrice) where.price.gte = BigInt(sp.minPrice);
    if (sp.maxPrice) where.price.lte = BigInt(sp.maxPrice);
  }

  const orderBy: any =
    sp.sort === "price_asc" ? { price: "asc" } :
    sp.sort === "price_desc" ? { price: "desc" } :
    sp.sort === "views" ? { views: "desc" } :
    { createdAt: "desc" };

  try {
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { broker: true },
        orderBy,
        take: PAGE_SIZE,
        skip,
      }),
      prisma.listing.count({ where }),
    ]);
    return { listings, total, page };
  } catch {
    return { listings: [], total: 0, page: 0 };
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const { listings, total, page } = await getListings(sp);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(sp as Record<string, string>);
    params.set("page", p.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Search bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <SearchBar
            defaultLocality={sp.locality?.split(",")[0] || ""}
            defaultBhk={sp.bhk?.split(",")[0] || ""}
            defaultType={sp.type || ""}
            compact
          />
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Suspense>
                <FilterPanel />
              </Suspense>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Result header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {total.toLocaleString()} Properties
                  {sp.locality && <span className="text-orange-500"> in {sp.locality.split(",")[0]}</span>}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {sp.type === "SALE" ? "For Sale" : sp.type === "RENT" ? "For Rent" : "Buy & Rent"} • Mumbai
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <Suspense>
                  <SortSelect currentSort={sp.sort || ""} />
                </Suspense>
              </div>
            </div>

            {/* Grid */}
            {listings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🏙️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
                <p className="text-gray-500 mb-6">Try changing your filters or searching a different locality.</p>
                <Link href="/search" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    {...listing}
                    price={Number(listing.price)}
                    broker={listing.broker}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 0 && (
                  <Link href={buildPageUrl(page - 1)} className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-orange-400 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Link>
                )}
                <span className="text-sm text-gray-600 px-3">
                  Page {page + 1} of {totalPages}
                </span>
                {page < totalPages - 1 && (
                  <Link href={buildPageUrl(page + 1)} className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-orange-400 transition-colors">
                    Next <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
