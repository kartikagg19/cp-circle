"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = new URLSearchParams(params.toString());
    if (e.target.value) p.set("sort", e.target.value);
    else p.delete("sort");
    p.delete("page");
    router.push(`/search?${p.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-orange-400"
    >
      <option value="">Newest</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="views">Most Viewed</option>
    </select>
  );
}
