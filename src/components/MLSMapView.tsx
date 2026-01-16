import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapPin, Bed, Bath, Square } from "lucide-react";

interface MLSListing {
  id: string;
  listing_id: string | null;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_type: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  primaryImage?: string;
}

interface MLSMapViewProps {
  listings: MLSListing[];
  isLoading: boolean;
}

const MLSMapView = ({ listings, isLoading }: MLSMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter listings with valid coordinates
  const listingsWithCoords = listings.filter(l => l.latitude && l.longitude);

  // Default center (Tampa Bay area)
  const defaultCenter: [number, number] = [27.9506, -82.4572];

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    return `$${(price / 1000).toFixed(0)}K`;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    mapRef.current = L.map(mapContainerRef.current).setView(defaultCenter, 10);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (listingsWithCoords.length === 0) return;

    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: hsl(195, 85%, 50%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Add markers
    listingsWithCoords.forEach((listing) => {
      const marker = L.marker([listing.latitude!, listing.longitude!], { icon: customIcon })
        .addTo(mapRef.current!);

      // Create popup content
      const popupContent = `
        <div style="min-width: 240px; font-family: system-ui, sans-serif;">
          ${listing.primaryImage ? `<img src="${listing.primaryImage}" alt="${listing.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px 8px 0 0; margin-bottom: 8px;" onerror="this.style.display='none'" />` : ''}
          <div style="padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: bold; font-size: 18px; color: hsl(195, 85%, 50%);">${formatPrice(listing.price)}</span>
              <span style="background: hsl(195, 30%, 92%); padding: 2px 8px; border-radius: 4px; font-size: 11px;">${listing.property_type}</span>
            </div>
            <h3 style="font-weight: 600; font-size: 14px; margin: 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${listing.title}</h3>
            <p style="font-size: 12px; color: #666; margin: 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${listing.location}</p>
            <div style="display: flex; gap: 12px; font-size: 12px; color: #666; margin-top: 8px;">
              ${listing.bedrooms > 0 ? `<span>${listing.bedrooms} bd</span>` : ''}
              ${listing.bathrooms > 0 ? `<span>${listing.bathrooms} ba</span>` : ''}
              ${listing.sqft > 0 ? `<span>${listing.sqft.toLocaleString()} sqft</span>` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (listingsWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        listingsWithCoords.map(l => [l.latitude!, l.longitude!] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listingsWithCoords]);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-muted/30 rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  if (listingsWithCoords.length === 0) {
    return (
      <div className="w-full h-[600px] bg-muted/30 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No listings with location data available</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Try adjusting your filters or sync more properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-border">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MLSMapView;
