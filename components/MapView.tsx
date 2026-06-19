"use client";

import { useEffect, useRef, useState } from "react";
import { MUMBAI_CENTER } from "@/constants/mumbai-areas";
import { formatPrice } from "@/lib/utils";

interface MapListing {
  id: string;
  title: string;
  price: number | bigint;
  locality: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface MapViewProps {
  listings: MapListing[];
}

export function MapView({ listings }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setMapError(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };

    function initMap() {
      if (!mapRef.current || !(window as any).google) return;
      const google = (window as any).google;

      const map = new google.maps.Map(mapRef.current, {
        center: MUMBAI_CENTER,
        zoom: 12,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      });

      listings.forEach((listing) => {
        if (!listing.latitude || !listing.longitude) return;
        const marker = new google.maps.Marker({
          position: { lat: listing.latitude, lng: listing.longitude },
          map,
          title: listing.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#f97316",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#fff",
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;max-width:200px">
              <div style="font-weight:bold;color:#f97316">${formatPrice(listing.price)}</div>
              <div style="font-size:13px;margin-top:4px">${listing.title}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">${listing.locality}</div>
              <a href="/property/${listing.id}" style="font-size:12px;color:#3b82f6;margin-top:6px;display:block">View Details →</a>
            </div>
          `,
        });

        marker.addListener("click", () => {
          setSelectedId(listing.id);
          infoWindow.open(map, marker);
        });
      });
    }
  }, [listings]);

  if (mapError) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
        Map unavailable. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200" />;
}
