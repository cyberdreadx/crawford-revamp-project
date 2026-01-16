import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Search, Bed, Bath, Square, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface MLSListing {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_type: string;
  status: string;
  listing_id: string | null;
  property_images: { image_url: string; is_primary: boolean }[];
}

const ITEMS_PER_PAGE = 12;

const MLSListings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["mls-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          location,
          price,
          bedrooms,
          bathrooms,
          sqft,
          property_type,
          status,
          listing_id,
          property_images (
            image_url,
            is_primary
          )
        `)
        .eq("is_mls_listing", true)
        .order("price", { ascending: false });

      if (error) throw error;
      return data as MLSListing[];
    },
  });

  // Filter listings based on search criteria
  const filteredListings = listings?.filter((listing) => {
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = propertyType === "all" || listing.property_type === propertyType;
    
    const matchesBedrooms = bedrooms === "all" || listing.bedrooms >= parseInt(bedrooms);
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      matchesPrice = listing.price >= min && (max ? listing.price <= max : true);
    }

    return matchesSearch && matchesType && matchesBedrooms && matchesPrice;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (listing: MLSListing) => {
    const primaryImage = listing.property_images?.find((img) => img.is_primary);
    return primaryImage?.image_url || listing.property_images?.[0]?.image_url || "/placeholder.svg";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "For Sale": "default",
      "Pending": "secondary",
      "Coming Soon": "outline",
    };
    return variants[status] || "default";
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading listings. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address or city..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          
          <Select value={propertyType} onValueChange={(v) => { setPropertyType(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="House">House</SelectItem>
              <SelectItem value="Condo">Condo</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
              <SelectItem value="Land">Land</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={(v) => { setPriceRange(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="0-300000">Under $300K</SelectItem>
              <SelectItem value="300000-500000">$300K - $500K</SelectItem>
              <SelectItem value="500000-750000">$500K - $750K</SelectItem>
              <SelectItem value="750000-1000000">$750K - $1M</SelectItem>
              <SelectItem value="1000000-">$1M+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={bedrooms} onValueChange={(v) => { setBedrooms(v); setCurrentPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Beds</SelectItem>
              <SelectItem value="1">1+ Beds</SelectItem>
              <SelectItem value="2">2+ Beds</SelectItem>
              <SelectItem value="3">3+ Beds</SelectItem>
              <SelectItem value="4">4+ Beds</SelectItem>
              <SelectItem value="5">5+ Beds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <span>{filteredListings.length} properties found</span>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedListings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No properties match your search criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setPropertyType("all");
              setPriceRange("all");
              setBedrooms("all");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedListings.map((listing) => (
            <Link key={listing.id} to={`/property/${listing.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group h-full">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getPropertyImage(listing)}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <Badge 
                    variant={getStatusBadge(listing.status)}
                    className="absolute top-3 left-3"
                  >
                    {listing.status}
                  </Badge>
                  {listing.listing_id && (
                    <Badge variant="outline" className="absolute top-3 right-3 bg-background/80">
                      MLS# {listing.listing_id}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(listing.price)}
                    </p>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span className="line-clamp-1">{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{listing.bedrooms} bd</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{listing.bathrooms} ba</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>{listing.sqft.toLocaleString()} sqft</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MLSListings;