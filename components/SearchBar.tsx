"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, IndianRupee } from "lucide-react";
import { MUMBAI_LOCALITIES } from "@/constants/mumbai-areas";

interface SearchBarProps {
  defaultLocality?: string;
  defaultBhk?: string;
  defaultType?: string;
  compact?: boolean;
}

export function SearchBar({ defaultLocality = "", defaultBhk = "", defaultType = "", compact = false }: SearchBarProps) {
  const router = useRouter();
  const [locality, setLocality] = useState(defaultLocality);
  const [bhk, setBhk] = useState(defaultBhk);
  const [type, setType] = useState(defaultType);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set("locality", locality);
    if (bhk) params.set("bhk", bhk);
    if (type) params.set("type", type);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`flex flex-col md:flex-row gap-2 bg-white rounded-2xl shadow-xl p-2 ${compact ? "" : "p-3"}`}
    >
      {/* Locality */}
      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
        <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
        <input
          type="text"
          placeholder="Area / Locality (e.g. Bandra West)"
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          list="locality-list"
          className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />
        <datalist id="locality-list">
          {MUMBAI_LOCALITIES.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </div>

      {/* BHK */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-[130px]">
        <Home className="h-4 w-4 text-orange-500 flex-shrink-0" />
        <select
          value={bhk}
          onChange={(e) => setBhk(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
        >
          <option value="">Any BHK</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} BHK</option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-[120px]">
        <IndianRupee className="h-4 w-4 text-orange-500 flex-shrink-0" />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
        >
          <option value="">Buy / Rent</option>
          <option value="SALE">Buy</option>
          <option value="RENT">Rent</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors justify-center"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  );
}
