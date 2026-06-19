import Link from "next/link";
import { MapPin, BedDouble, Maximize2, Eye, CheckCircle2, Home } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { formatPrice } from "@/lib/utils";

interface Broker {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string | null;
  isVerified: boolean;
  avatar?: string | null;
}

interface PropertyCardProps {
  id: string;
  title: string;
  price: bigint | number;
  locality: string;
  bhk?: number | null;
  area_sqft?: number | null;
  type: "SALE" | "RENT";
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  images: string[];
  furnishing?: string | null;
  views: number;
  isFeatured: boolean;
  broker: Broker;
}

export function PropertyCard({
  id, title, price, locality, bhk, area_sqft, type,
  images, furnishing, views, isFeatured, broker,
}: PropertyCardProps) {
  const hasImage = images && images.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image / Placeholder */}
      <Link href={`/property/${id}`} className="block relative bg-gray-100 overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {hasImage ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
            <Home className="h-12 w-12 mb-2" />
            <span className="text-xs text-gray-400">No photo yet</span>
          </div>
        )}
        {isFeatured && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Featured
          </span>
        )}
        <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded ${type === "SALE" ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
          {type === "SALE" ? "Sale" : "Rent"}
        </span>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1 text-xl font-bold text-orange-500">{formatPrice(price)}</div>
        <Link href={`/property/${id}`} className="font-semibold text-gray-900 hover:text-orange-500 line-clamp-1 transition-colors">
          {title}
        </Link>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{locality}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
          {bhk && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {bhk} BHK
            </span>
          )}
          {area_sqft && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-4 w-4" /> {area_sqft.toLocaleString()} sqft
            </span>
          )}
          {furnishing && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
              {furnishing === "FURNISHED" ? "Furnished" : furnishing === "SEMI_FURNISHED" ? "Semi-Furnished" : "Unfurnished"}
            </span>
          )}
        </div>

        {/* Broker row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <Link href={`/brokers/${broker.id}`} className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
              {broker.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-800 truncate flex items-center gap-1">
                {broker.name}
                {broker.isVerified && <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="h-3 w-3" /> {views} views
              </div>
            </div>
          </Link>

          {/* Only show WhatsApp if broker has a real whatsapp number */}
          {broker.whatsapp && (
            <WhatsAppButton
              phone={broker.whatsapp}
              context={{ title, locality, price }}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
