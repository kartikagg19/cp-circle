"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MUMBAI_LOCALITIES } from "@/constants/mumbai-areas";
import { SlidersHorizontal, X } from "lucide-react";

export function FilterPanel() {
  const router = useRouter();
  const params = useSearchParams();

  const [localities, setLocalities] = useState<string[]>(
    params.get("locality") ? params.get("locality")!.split(",") : []
  );
  const [bhks, setBhks] = useState<number[]>(
    params.get("bhk") ? params.get("bhk")!.split(",").map(Number) : []
  );
  const [type, setType] = useState(params.get("type") || "");
  const [propertyType, setPropertyType] = useState(params.get("propertyType") || "");
  const [furnishing, setFurnishing] = useState(params.get("furnishing") || "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [possession, setPossession] = useState(params.get("possession") || "");

  function applyFilters() {
    const p = new URLSearchParams();
    if (localities.length) p.set("locality", localities.join(","));
    if (bhks.length) p.set("bhk", bhks.join(","));
    if (type) p.set("type", type);
    if (propertyType) p.set("propertyType", propertyType);
    if (furnishing) p.set("furnishing", furnishing);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (possession) p.set("possession", possession);
    if (params.get("sort")) p.set("sort", params.get("sort")!);
    router.push(`/search?${p.toString()}`);
  }

  function clearFilters() {
    setLocalities([]); setBhks([]); setType(""); setPropertyType("");
    setFurnishing(""); setMinPrice(""); setMaxPrice(""); setPossession("");
    router.push("/search");
  }

  function toggleLocality(loc: string) {
    setLocalities((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  }

  function toggleBhk(n: number) {
    setBhks((prev) => prev.includes(n) ? prev.filter((b) => b !== n) : [...prev, n]);
  }

  return (
    <aside className="w-full space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <SlidersHorizontal className="h-4 w-4 text-orange-500" />
          Filters
        </div>
        <button onClick={clearFilters} className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1">
          <X className="h-3 w-3" /> Clear All
        </button>
      </div>

      {/* Type */}
      <div>
        <div className="font-medium text-gray-700 mb-2">Buy / Rent</div>
        <div className="flex gap-2">
          {["", "SALE", "RENT"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${type === t ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
            >
              {t === "" ? "All" : t === "SALE" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>
      </div>

      {/* BHK */}
      <div>
        <div className="font-medium text-gray-700 mb-2">BHK Type</div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => toggleBhk(n)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${bhks.includes(n) ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
            >
              {n} BHK
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <div className="font-medium text-gray-700 mb-2">Property Type</div>
        <div className="flex gap-2">
          {[["", "All"], ["RESIDENTIAL", "Residential"], ["COMMERCIAL", "Commercial"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPropertyType(val)}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${propertyType === val ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className="font-medium text-gray-700 mb-2">Budget (₹)</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-orange-400"
          />
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <div className="font-medium text-gray-700 mb-2">Furnishing</div>
        <div className="space-y-1.5">
          {[["", "Any"], ["FURNISHED", "Furnished"], ["SEMI_FURNISHED", "Semi-Furnished"], ["UNFURNISHED", "Unfurnished"]].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="furnishing"
                checked={furnishing === val}
                onChange={() => setFurnishing(val)}
                className="accent-orange-500"
              />
              <span className="text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Possession */}
      <div>
        <div className="font-medium text-gray-700 mb-2">Possession</div>
        <select
          value={possession}
          onChange={(e) => setPossession(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
        >
          <option value="">Any</option>
          <option value="Ready to Move">Ready to Move</option>
          <option value="Under Construction">Under Construction</option>
        </select>
      </div>

      {/* Locality multi-select */}
      <div>
        <div className="font-medium text-gray-700 mb-2">Localities</div>
        <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-1.5 border border-gray-200 rounded-lg p-2">
          {MUMBAI_LOCALITIES.map((loc) => (
            <label key={loc} className="flex items-center gap-2 cursor-pointer hover:bg-orange-50 px-1 py-0.5 rounded">
              <input
                type="checkbox"
                checked={localities.includes(loc)}
                onChange={() => toggleLocality(loc)}
                className="accent-orange-500"
              />
              <span className="text-xs text-gray-700">{loc}</span>
            </label>
          ))}
        </div>
        {localities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {localities.map((loc) => (
              <span
                key={loc}
                onClick={() => toggleLocality(loc)}
                className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full cursor-pointer hover:bg-orange-200"
              >
                {loc} <X className="h-3 w-3" />
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={applyFilters}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        Apply Filters
      </button>
    </aside>
  );
}
