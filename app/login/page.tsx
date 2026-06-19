"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Phone } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.match(/^\d{10}$/)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        phone,
        name: name || "Broker",
        redirect: false,
      });
      if (result?.error) throw new Error("Login failed. Try again.");
      toast.success("Logged in!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl text-orange-500 mb-8">
          <Building2 className="h-6 w-6" />
          MumbaiBrokers
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Broker Login</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Enter your mobile number to continue</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Shah"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-400">
              <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-gray-500 text-sm font-medium">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
                maxLength={10}
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Phone className="h-5 w-5" />}
            {loading ? "Logging in..." : "Login / Register"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          New users are registered as brokers automatically.
        </p>
      </div>
    </div>
  );
}
