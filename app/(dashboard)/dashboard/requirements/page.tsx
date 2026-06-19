"use client";

import { useState, useEffect } from "react";
import { formatPrice, timeAgo } from "@/lib/utils";
import { ClipboardList, PlusSquare, X, Loader2, IndianRupee } from "lucide-react";
import { MUMBAI_LOCALITIES } from "@/constants/mumbai-areas";
import toast from "react-hot-toast";

interface Requirement {
  id: string;
  bhk: number[];
  type: "SALE" | "RENT";
  locality: string[];
  budgetMin: number;
  budgetMax: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    bhk: [] as number[],
    type: "SALE" as "SALE" | "RENT",
    locality: [] as string[],
    budgetMin: "",
    budgetMax: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/requirements")
      .then((r) => r.json())
      .then((d) => setRequirements(d.requirements || []))
      .finally(() => setLoading(false));
  }, []);

  function toggleBhk(n: number) {
    setForm((f) => ({
      ...f,
      bhk: f.bhk.includes(n) ? f.bhk.filter((b) => b !== n) : [...f.bhk, n],
    }));
  }

  function toggleLocality(loc: string) {
    setForm((f) => ({
      ...f,
      locality: f.locality.includes(loc) ? f.locality.filter((l) => l !== loc) : [...f.locality, loc],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.bhk.length) return toast.error("Select at least one BHK");
    if (!form.locality.length) return toast.error("Select at least one locality");
    if (!form.budgetMin || !form.budgetMax) return toast.error("Enter budget range");

    setSubmitting(true);
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequirements((prev) => [data.requirement, ...prev]);
      setShowForm(false);
      setForm({ bhk: [], type: "SALE", locality: [], budgetMin: "", budgetMax: "", notes: "" });
      toast.success("Requirement posted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to post requirement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requirements Board</h1>
          <p className="text-sm text-gray-500 mt-1">Post what your clients need — match with broker inventory</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
        >
          <PlusSquare className="h-4 w-4" /> Post Requirement
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Requirement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "SALE" | "RENT" }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                >
                  <option value="SALE">Buy</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BHK Required</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => toggleBhk(n)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${form.bhk.includes(n) ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget (₹)</label>
                <input
                  type="number"
                  value={form.budgetMin}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
                  placeholder="e.g. 3000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  value={form.budgetMax}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
                  placeholder="e.g. 8000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Localities</label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {MUMBAI_LOCALITIES.map((loc) => (
                  <label key={loc} className="flex items-center gap-2 cursor-pointer hover:bg-orange-50 px-1 py-0.5 rounded text-xs">
                    <input
                      type="checkbox"
                      checked={form.locality.includes(loc)}
                      onChange={() => toggleLocality(loc)}
                      className="accent-orange-500"
                    />
                    {loc}
                  </label>
                ))}
              </div>
              {form.locality.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.locality.map((loc) => (
                    <span key={loc} onClick={() => toggleLocality(loc)} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1">
                      {loc} <X className="h-3 w-3" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Any specific requirements, preferences..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Post Requirement
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requirements list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-20 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No requirements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${req.type === "SALE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {req.type === "SALE" ? "Buy" : "Rent"}
                    </span>
                    {req.bhk.map((b) => (
                      <span key={b} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">{b} BHK</span>
                    ))}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formatPrice(req.budgetMin)} – {formatPrice(req.budgetMax)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {req.locality.slice(0, 6).map((l) => (
                      <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{l}</span>
                    ))}
                    {req.locality.length > 6 && (
                      <span className="text-xs text-gray-400">+{req.locality.length - 6} more</span>
                    )}
                  </div>
                  {req.notes && <p className="text-sm text-gray-600 mt-2">{req.notes}</p>}
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">{timeAgo(req.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
