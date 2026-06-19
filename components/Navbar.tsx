"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Building2, Menu, X, PlusSquare, LayoutDashboard, LogOut, User } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-500">
          <Building2 className="h-6 w-6" />
          <span>CP<span className="text-gray-900"> Circle</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-orange-500 transition-colors">Properties</Link>
          <Link href="/brokers" className="hover:text-orange-500 transition-colors">Brokers</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="hover:text-orange-500 transition-colors flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link
                href="/dashboard/add-listing"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors"
              >
                <PlusSquare className="h-4 w-4" /> Add Listing
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Broker Login
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 text-sm font-medium">
          <Link href="/search" className="block py-2 text-gray-700 hover:text-orange-500" onClick={() => setMobileOpen(false)}>Properties</Link>
          <Link href="/brokers" className="block py-2 text-gray-700 hover:text-orange-500" onClick={() => setMobileOpen(false)}>Brokers</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/dashboard/add-listing" className="block py-2 text-orange-500 font-semibold" onClick={() => setMobileOpen(false)}>+ Add Listing</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block py-2 text-red-500">Logout</button>
            </>
          ) : (
            <Link href="/login" className="block py-2 text-orange-500 font-semibold" onClick={() => setMobileOpen(false)}>Broker Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
