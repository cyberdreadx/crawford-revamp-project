import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bed, Bath, Square, MapPin, ArrowRight, Home, Calendar, Building, Filter, X, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Property Image Carousel Component
interface PropertyImageCarouselProps {
  images: any[];
  propertyTitle: string;
  showControls?: boolean;
}

const PropertyImageCarousel = ({ images, propertyTitle, showControls = false }: PropertyImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-subtle flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <div className="text-center text-muted-foreground">
          <Home className="w-12 h-12 mx-auto mb-2 opacity-60" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full group">
      <img 
        src={images[currentImageIndex]?.image_url || '/placeholder.svg'}
        alt={`${propertyTitle} - Image ${currentImageIndex + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity z-10 ${
              showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextImage}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity z-10 ${
              showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {/* Image Indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
          
          {/* Image Counter */}
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10">
            {currentImageIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built?: number;
  property_type: string;
  status: string;
  description?: string;
  key_features?: string[];
  taxes?: number;
  flood_zone?: string;
  is_featured: boolean;
}

const LuxuryProperties = () => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyImages, setPropertyImages] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Filter states for luxury properties
  const [filters, setFilters] = useState({
    priceRange: "all",
    bedrooms: "all",
    bathrooms: "all",
    status: "all",
    propertyType: "all"
  });
  const [showFilters, setShowFilters] = useState(true);

  // Fetch luxury properties (price > $600k) and images from database
  useEffect(() => {
    fetchLuxuryPropertiesAndImages();
  }, []);

  const fetchLuxuryPropertiesAndImages = async () => {
    try {
      setLoading(true);
      
      // Fetch luxury properties (price > $600,000)
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .gt('price', 600000)
        .order('price', { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Fetch images for all properties
      if (propertiesData && propertiesData.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from('property_images')
          .select('*')
          .in('property_id', propertiesData.map(p => p.id))
          .order('display_order');

        if (imagesError) throw imagesError;

        // Group images by property_id
        const imagesByProperty: { [key: string]: any[] } = {};
        imagesData?.forEach(image => {
          if (!imagesByProperty[image.property_id]) {
            imagesByProperty[image.property_id] = [];
          }
          imagesByProperty[image.property_id].push(image);
        });

        setPropertyImages(imagesByProperty);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch luxury properties: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = (propertyId: string) => {
    const images = propertyImages[propertyId] || [];
    const primaryImage = images.find(img => img.is_primary);
    return primaryImage?.image_url || images[0]?.image_url || null;
  };
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter luxury properties based on selected filters
  const filteredProperties = properties.filter(property => {
    // Price filter for luxury properties
    if (filters.priceRange !== "all") {
      const price = property.price;
      switch (filters.priceRange) {
        case "600k-1m":
          if (price < 600000 || price > 1000000) return false;
          break;
        case "1m-2m":
          if (price < 1000000 || price > 2000000) return false;
          break;
        case "over2m":
          if (price < 2000000) return false;
          break;
      }
    }

    // Bedrooms filter
    if (filters.bedrooms !== "all") {
      const bedroomCount = parseInt(filters.bedrooms);
      if (filters.bedrooms === "4" && property.bedrooms < 4) return false;
      if (filters.bedrooms !== "4" && property.bedrooms !== bedroomCount) return false;
    }

    // Bathrooms filter
    if (filters.bathrooms !== "all") {
      const bathroomCount = parseFloat(filters.bathrooms);
      if (filters.bathrooms === "3" && property.bathrooms < 3) return false;
      if (filters.bathrooms !== "3" && property.bathrooms !== bathroomCount) return false;
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "sale" && property.status === "For Rent") return false;
      if (filters.status === "rent" && property.status !== "For Rent") return false;
    }

    // Property type filter
    if (filters.propertyType !== "all") {
      const propertyType = property.property_type.toLowerCase();
      if (propertyType !== filters.propertyType) return false;
    }

    return true;
  });

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (visibleCount < filteredProperties.length && !isLoading) {
          setIsLoading(true);
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + 6, filteredProperties.length));
            setIsLoading(false);
          }, 800);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filteredProperties.length, isLoading]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [filters]);

  const visibleProperties = filteredProperties.slice(0, visibleCount);

  const clearFilters = () => {
    setFilters({
      priceRange: "all",
      bedrooms: "all",
      bathrooms: "all",
      status: "all",
      propertyType: "all"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading luxury properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2 bg-amber-100 text-amber-800 border-amber-200">
              <Crown className="w-4 h-4 mr-2" />
              Luxury Collection
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Exclusive Luxury Properties
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover our curated collection of premium properties featuring exceptional 
              quality, prime locations, and luxury amenities. Each property represents 
              the pinnacle of sophisticated living.
            </p>
            
            {/* Filter Toggle */}
            <div className="mt-8 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {Object.values(filters).some(filter => filter !== "all") && (
                  <Badge variant="secondary" className="ml-2">{Object.values(filters).filter(filter => filter !== "all").length}</Badge>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 p-6 bg-card rounded-lg border max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filter Luxury Properties</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Luxury Prices</SelectItem>
                        <SelectItem value="600k-1m">$600K-$1M</SelectItem>
                        <SelectItem value="1m-2m">$1M-$2M</SelectItem>
                        <SelectItem value="over2m">Over $2M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bedrooms Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bedrooms</label>
                    <Select value={filters.bedrooms} onValueChange={(value) => setFilters({...filters, bedrooms: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="2">2 Beds</SelectItem>
                        <SelectItem value="3">3 Beds</SelectItem>
                        <SelectItem value="4">4+ Beds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bathrooms Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bathrooms</label>
                    <Select value={filters.bathrooms} onValueChange={(value) => setFilters({...filters, bathrooms: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="2">2 Baths</SelectItem>
                        <SelectItem value="2.5">2.5 Baths</SelectItem>
                        <SelectItem value="3">3+ Baths</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Type</label>
                    <Select value={filters.propertyType} onValueChange={(value) => setFilters({...filters, propertyType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="estate">Estate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredProperties.length} luxury properties
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-16">
              <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-4">No Luxury Properties Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're currently updating our luxury collection. Please check back soon or contact us for exclusive off-market opportunities.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleProperties.map((property) => (
                  <Card 
                    key={property.id}
                    className="group overflow-hidden hover:shadow-elegant transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedProperty(property)}
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <PropertyImageCarousel 
                        images={propertyImages[property.id] || []}
                        propertyTitle={property.title}
                      />
                      
                      {/* Property Status Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge 
                          variant={property.status === "For Sale" ? "default" : "secondary"}
                          className="bg-white/90 text-primary border-0"
                        >
                          {property.status}
                        </Badge>
                      </div>

                      {/* Luxury Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Crown className="w-3 h-3 mr-1" />
                          Luxury
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            ${property.price.toLocaleString()}
                            {property.status === "For Rent" && <span className="text-sm text-muted-foreground">/mo</span>}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-sm truncate">{property.location}</span>
                        </div>

                        {/* Property Details */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            <span>{property.sqft.toLocaleString()} sqft</span>
                          </div>
                        </div>

                        {/* Property Type */}
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{property.property_type}</span>
                          {property.year_built && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{property.year_built}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More / Loading */}
              {filteredProperties.length > visibleCount && (
                <div className="text-center mt-12">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-muted-foreground">Loading more luxury properties...</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setVisibleCount(prev => Math.min(prev + 6, filteredProperties.length))}
                      className="px-8"
                    >
                      Load More Properties
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Property Detail Modal */}
      <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProperty.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Image Carousel */}
                <div className="aspect-[16/9] overflow-hidden rounded-lg">
                  <PropertyImageCarousel 
                    images={propertyImages[selectedProperty.id] || []}
                    propertyTitle={selectedProperty.title}
                    showControls={true}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Property Details */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-bold text-primary">
                          ${selectedProperty.price.toLocaleString()}
                          {selectedProperty.status === "For Rent" && <span className="text-lg text-muted-foreground">/mo</span>}
                        </span>
                        <div className="flex gap-2">
                          <Badge 
                            variant={selectedProperty.status === "For Sale" ? "default" : "secondary"}
                          >
                            {selectedProperty.status}
                          </Badge>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Crown className="w-3 h-3 mr-1" />
                            Luxury
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center text-muted-foreground mb-4">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{selectedProperty.location}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-1">
                            <Bed className="w-6 h-6" />
                            {selectedProperty.bedrooms}
                          </div>
                          <p className="text-sm text-muted-foreground">Bedroom{selectedProperty.bedrooms !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-1">
                            <Bath className="w-6 h-6" />
                            {selectedProperty.bathrooms}
                          </div>
                          <p className="text-sm text-muted-foreground">Bathroom{selectedProperty.bathrooms !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-1">
                            <Square className="w-6 h-6" />
                            {selectedProperty.sqft.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Square Feet</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-1">
                            <Building className="w-6 h-6" />
                          </div>
                          <p className="text-sm text-muted-foreground">{selectedProperty.property_type}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedProperty.description && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">{selectedProperty.description}</p>
                      </div>
                    )}

                    {/* Key Features */}
                    {selectedProperty.key_features && selectedProperty.key_features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedProperty.key_features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Property Information</h3>
                      
                      <div className="space-y-3">
                        {selectedProperty.year_built && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year Built</span>
                            <span className="font-medium">{selectedProperty.year_built}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property Type</span>
                          <span className="font-medium">{selectedProperty.property_type}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <span className="font-medium">{selectedProperty.status}</span>
                        </div>

                        {selectedProperty.taxes && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Taxes</span>
                            <span className="font-medium">${selectedProperty.taxes.toLocaleString()}</span>
                          </div>
                        )}

                        {selectedProperty.flood_zone && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Flood Zone</span>
                            <span className="font-medium">{selectedProperty.flood_zone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="p-6 bg-gradient-subtle rounded-lg text-center">
                      <h4 className="text-lg font-semibold mb-2">Interested in this luxury property?</h4>
                      <p className="text-muted-foreground mb-4">
                        Contact our luxury specialists for a private showing and detailed information.
                      </p>
                      <Button className="w-full">
                        Contact Our Team
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default LuxuryProperties;