import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square } from "lucide-react";

// Custom marker icon using inline SVG data URL (avoids CDN issues)
const customIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMmE4MWNiIiBkPSJNMTIuNSAwQzUuNTk2IDAgMCA1LjU5NiAwIDEyLjVjMCA5LjM3NSAxMi41IDI4LjUgMTIuNSAyOC41czEyLjUtMTkuMTI1IDEyLjUtMjguNUMyNSA1LjU5NiAxOS40MDQgMCAxMi41IDB6Ii8+PGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjUiLz48L3N2Zz4=",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

// Component to fit bounds when listings change
const FitBounds = ({ listings }: { listings: MLSListing[] }) => {
  const map = useMap();
  
  useEffect(() => {
    const validListings = listings.filter(l => l.latitude && l.longitude);
    if (validListings.length > 0) {
      const bounds = L.latLngBounds(
        validListings.map(l => [l.latitude!, l.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listings, map]);
  
  return null;
};

const MLSMapView = ({ listings, isLoading }: MLSMapViewProps) => {
  
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
      <style>{`
        .leaflet-container { height: 100%; width: 100%; }
        .leaflet-control-zoom { border: none !important; }
        .leaflet-control-zoom a { background: hsl(var(--card)) !important; color: hsl(var(--foreground)) !important; border: 1px solid hsl(var(--border)) !important; }
        .leaflet-control-zoom a:hover { background: hsl(var(--muted)) !important; }
        .leaflet-popup-content-wrapper { border-radius: 8px; padding: 0; }
        .leaflet-popup-content { margin: 8px; }
      `}</style>
      <MapContainer
        center={defaultCenter}
        zoom={10}
        className="w-full h-full"
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds listings={listingsWithCoords} />
        
        {listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude!, listing.longitude!]}
            icon={customIcon}
          >
            <Popup minWidth={280} maxWidth={320}>
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  {listing.primaryImage && (
                    <img
                      src={listing.primaryImage}
                      alt={listing.title}
                      className="w-full h-32 object-cover rounded-t-lg mb-2"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(listing.price)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {listing.property_type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {listing.location}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {listing.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          <span>{listing.bedrooms} bd</span>
                        </div>
                      )}
                      {listing.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          <span>{listing.bathrooms} ba</span>
                        </div>
                      )}
                      {listing.sqft > 0 && (
                        <div className="flex items-center gap-1">
                          <Square className="h-3 w-3" />
                          <span>{listing.sqft.toLocaleString()} sqft</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MLSMapView;
