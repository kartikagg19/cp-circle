"use client";

import { useState, useEffect } from "react";
import { MUMBAI_LOCALITIES } from "@/constants/mumbai-areas";
import { Loader2, Save, X, User2, Phone, Mail, Shield } from "lucide-react";
import toast from "react-hot-toast";

interface Profile {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  rera_number?: string | null;
  areas: string[];
  whatsapp?: string | null;
  bio?: string | null;
  avatar?: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/brokers/me")
      .then((r) => r.json())
      .then((d) => setProfile(d.broker))
      .finally(() => setLoading(false));
  }, []);

  function toggleArea(area: string) {
    if (!profile) return;
    setProfile((p) => p ? ({
      ...p,
      areas: p.areas.includes(area)
        ? p.areas.filter((a) => a !== area)
        : [...p.areas, area],
    }) : null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/brokers/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  if (!profile) return <div className="text-gray-500">Could not load profile</div>;

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your broker profile information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><User2 className="h-4 w-4 text-orange-500" /> Basic Information</h2>

          <div>
            <label className={labelClass}>Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => p ? { ...p, name: e.target.value } : null)}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone (login number)</label>
              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                <Phone className="h-4 w-4 mx-3 text-gray-400 flex-shrink-0" />
                <input value={profile.phone} disabled className="flex-1 py-2 pr-3 text-sm text-gray-500 bg-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                value={profile.whatsapp || ""}
                onChange={(e) => setProfile((p) => p ? { ...p, whatsapp: e.target.value } : null)}
                placeholder="e.g. 9876543210"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={profile.email || ""}
              onChange={(e) => setProfile((p) => p ? { ...p, email: e.target.value } : null)}
              placeholder="broker@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Bio / About You</label>
            <textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile((p) => p ? { ...p, bio: e.target.value } : null)}
              rows={3}
              placeholder="Tell clients about your experience, specializations..."
              className={inputClass}
            />
          </div>
        </div>

        {/* RERA */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Shield className="h-4 w-4 text-orange-500" /> RERA & Verification</h2>
          <div>
            <label className={labelClass}>RERA Registration Number</label>
            <input
              value={profile.rera_number || ""}
              onChange={(e) => setProfile((p) => p ? { ...p, rera_number: e.target.value } : null)}
              placeholder="e.g. A51800019168"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Adding RERA number helps build trust with clients</p>
          </div>
        </div>

        {/* Areas */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Areas of Specialization</h2>
          <p className="text-xs text-gray-400 mb-3">Select Mumbai localities where you primarily operate</p>

          {profile.areas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile.areas.map((area) => (
                <span key={area} onClick={() => toggleArea(area)} className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full cursor-pointer hover:bg-orange-200">
                  {area} <X className="h-3 w-3" />
                </span>
              ))}
            </div>
          )}

          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
            {MUMBAI_LOCALITIES.map((loc) => (
              <label key={loc} className="flex items-center gap-2 cursor-pointer hover:bg-orange-50 px-1 py-0.5 rounded">
                <input
                  type="checkbox"
                  checked={profile.areas.includes(loc)}
                  onChange={() => toggleArea(loc)}
                  className="accent-orange-500"
                />
                <span className="text-xs text-gray-700">{loc}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
