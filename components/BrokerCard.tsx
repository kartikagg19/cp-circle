import Link from "next/link";
import { CheckCircle2, MapPin, Building2 } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";

interface BrokerCardProps {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string | null;
  avatar?: string | null;
  isVerified: boolean;
  rera_number?: string | null;
  areas: string[];
  _count?: { listings: number };
}

export function BrokerCard({
  id, name, whatsapp, avatar, isVerified, rera_number, areas, _count,
}: BrokerCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="h-14 w-14 rounded-full bg-orange-100 text-orange-600 font-bold text-xl flex items-center justify-center flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            name[0].toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link href={`/brokers/${id}`} className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
              {name}
            </Link>
            {isVerified && (
              <span title="Verified Broker"><CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" /></span>
            )}
          </div>

          {rera_number && (
            <div className="text-xs text-gray-500 mt-0.5">RERA: {rera_number}</div>
          )}

          {!whatsapp && (
            <div className="text-xs text-gray-400 mt-1 italic">Contact not added yet</div>
          )}
        </div>
      </div>

      {/* Areas */}
      {areas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {areas.slice(0, 4).map((area) => (
            <span key={area} className="flex items-center gap-0.5 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
              <MapPin className="h-3 w-3" /> {area}
            </span>
          ))}
          {areas.length > 4 && (
            <span className="text-xs text-gray-500">+{areas.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Building2 className="h-4 w-4 text-orange-500" />
          {_count?.listings ?? 0} listings
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/brokers/${id}`} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
            View Profile
          </Link>
          {whatsapp && <WhatsAppButton phone={whatsapp} size="sm" />}
        </div>
      </div>
    </div>
  );
}
