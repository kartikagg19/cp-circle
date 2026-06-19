import Link from "next/link";
import { Building2, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Building2 className="h-5 w-5 text-orange-500" />
            CP Circle
          </div>
          <p className="text-sm text-gray-400">
            Mumbai's largest broker-to-broker real estate network. Connect with verified brokers instantly.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-orange-400 transition-colors">Search Properties</Link></li>
            <li><Link href="/brokers" className="hover:text-orange-400 transition-colors">Find Brokers</Link></li>
            <li><Link href="/dashboard/add-listing" className="hover:text-orange-400 transition-colors">List Property</Link></li>
            <li><Link href="/login" className="hover:text-orange-400 transition-colors">Broker Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Popular Areas</h4>
          <ul className="space-y-2 text-sm">
            {["Bandra West", "Andheri West", "Powai", "Lower Parel", "Worli", "Malad West"].map((area) => (
              <li key={area}>
                <Link href={`/search?locality=${encodeURIComponent(area)}`} className="hover:text-orange-400 transition-colors">
                  {area}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" /> Mumbai, Maharashtra
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-500" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" /> hello@mumbaibrokers.in
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} CP Circle. All rights reserved.
      </div>
    </footer>
  );
}
