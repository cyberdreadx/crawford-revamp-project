import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bed, Bath, Square, MapPin, ArrowRight, Home, Calendar, Building, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

const Listings = () => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyImages, setPropertyImages] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: "all",
    bedrooms: "all",
    bathrooms: "all",
    status: "all",
    propertyType: "all"
  });
  const [showFilters, setShowFilters] = useState(true);

  // Fetch properties and images from database
  useEffect(() => {
    fetchPropertiesAndImages();
  }, []);

  const fetchPropertiesAndImages = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated admin to use full properties table
      const { data: { user } } = await supabase.auth.getUser();
      
      let propertiesData, propertiesError;
      
      if (user) {
        // Admin users get full property data
        const result = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
        propertiesData = result.data;
        propertiesError = result.error;
      } else {
        // Non-admin users get public property data (no agent contact info)
        const result = await supabase
          .from('properties_public')
          .select('*')
          .order('created_at', { ascending: false });
        propertiesData = result.data;
        propertiesError = result.error;
      }

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
        description: "Failed to fetch properties: " + error.message,
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

  // Filter properties based on selected filters
  const filteredProperties = properties.filter(property => {
    // Price filter
    if (filters.priceRange !== "all") {
      const price = property.price;
      switch (filters.priceRange) {
        case "under200k":
          if (property.status !== "For Rent" && price >= 200000) return false;
          break;
        case "200k-400k":
          if (property.status !== "For Rent" && (price < 200000 || price > 400000)) return false;
          break;
        case "400k-600k":
          if (property.status !== "For Rent" && (price < 400000 || price > 600000)) return false;
          break;
        case "over600k":
          if (property.status !== "For Rent" && price < 600000) return false;
          break;
        case "under1500":
          if (property.status === "For Rent" && price >= 1500) return false;
          break;
        case "1500-2000":
          if (property.status === "For Rent" && (price < 1500 || price > 2000)) return false;
          break;
        case "over2000":
          if (property.status === "For Rent" && price < 2000) return false;
          break;
      }
    }

    // Bedrooms filter
    if (filters.bedrooms !== "all") {
      const bedroomCount = parseInt(filters.bedrooms);
      if (property.bedrooms !== bedroomCount) return false;
    }

    // Bathrooms filter
    if (filters.bathrooms !== "all") {
      const bathroomCount = parseFloat(filters.bathrooms);
      if (property.bathrooms !== bathroomCount) return false;
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "sale" && property.status === "For Rent") return false;
      if (filters.status === "rent" && property.status !== "For Rent") return false;
    }

    // Property type filter
    if (filters.propertyType !== "all") {
      const propertyType = property.property_type.toLowerCase();
      switch (filters.propertyType) {
        case "condo":
          if (propertyType !== "condo") return false;
          break;
        case "house":
          if (propertyType !== "house") return false;
          break;
        case "estate":
          if (propertyType !== "estate") return false;
          break;
      }
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
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[112px]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              All Properties
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Browse All Available Listings
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our complete portfolio of properties across St. Petersburg, 
              New Port Richey, Holiday, and Dunnellon. From investment opportunities 
              to dream homes, find your perfect match.
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
                  <h3 className="text-lg font-semibold">Filter Properties</h3>
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
                        <SelectItem value="all">All Prices</SelectItem>
                        {filters.status === "rent" || filters.status === "all" ? (
                          <>
                            <SelectItem value="under1500">Under $1,500/mo</SelectItem>
                            <SelectItem value="1500-2000">$1,500-$2,000/mo</SelectItem>
                            <SelectItem value="over2000">Over $2,000/mo</SelectItem>
                          </>
                        ) : null}
                        {filters.status === "sale" || filters.status === "all" ? (
                          <>
                            <SelectItem value="under200k">Under $200K</SelectItem>
                            <SelectItem value="200k-400k">$200K-$400K</SelectItem>
                            <SelectItem value="400k-600k">$400K-$600K</SelectItem>
                            <SelectItem value="over600k">Over $600K</SelectItem>
                          </>
                        ) : null}
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
                        <SelectItem value="1">1 Bed</SelectItem>
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
                        <SelectItem value="1">1 Bath</SelectItem>
                        <SelectItem value="1.5">1.5 Baths</SelectItem>
                        <SelectItem value="2">2 Baths</SelectItem>
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
                    Showing {filteredProperties.length} of {properties.length} properties
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleProperties.map((property) => (
                <Card key={property.id} className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 border-0">
                  <div className="relative overflow-hidden">
                    {/* Property Images Carousel */}
                    <div className="aspect-[4/3] relative">
                      <PropertyImageCarousel 
                        images={propertyImages[property.id] || []}
                        propertyTitle={property.title}
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute top-4 left-4 ${
                        property.status === 'For Rent' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {property.status}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold">
                        ${property.price.toLocaleString()}
                        {property.status === "For Rent" ? "/mo" : ""}
                      </div>
                      <Badge variant={property.status === "For Sale" ? "default" : "secondary"}>
                        {property.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-start mb-4">
                        <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {property.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.bathrooms}
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        {property.sqft.toLocaleString()}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {property.description}
                    </p>

                    {/* Key Features */}
                    {property.key_features && property.key_features.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {property.key_features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {property.key_features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{property.key_features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      View Full Dossier
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gradient-gold transition ease-in-out duration-150">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading more properties...
                </div>
              </div>
            )}

            {/* End of results indicator */}
            {visibleCount >= filteredProperties.length && !isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You've viewed all {filteredProperties.length} properties</p>
              </div>
            )}

            {/* Contact CTA */}
            <div className="text-center mt-16 bg-gradient-subtle rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Don't See What You're Looking For?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We have access to the entire MLS database and can help you find the perfect property 
                that meets your specific needs and budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-gold hover:shadow-button transition-all duration-200"
                >
                  Contact Our Team
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                >
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details Modal */}
      <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedProperty.title}</span>
                  <Badge className="ml-2">{selectedProperty.status}</Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Property Images Carousel */}
                <div className="space-y-4">
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <PropertyImageCarousel 
                      images={propertyImages[selectedProperty.id] || []}
                      propertyTitle={selectedProperty.title}
                      showControls={true}
                    />
                  </div>
                  
                  {/* Property Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedProperty.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedProperty.bathrooms} Bathrooms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedProperty.sqft?.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Built {selectedProperty.year_built || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedProperty.property_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedProperty.flood_zone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-accent mb-2">
                      ${selectedProperty.price.toLocaleString()}
                      {selectedProperty.status === "For Rent" ? "/mo" : ""}
                    </h3>
                    <div className="flex items-start space-x-2 text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>{selectedProperty.location}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedProperty.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                    <ul className="space-y-2">
                      {selectedProperty?.key_features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      )) || <li className="text-sm text-muted-foreground">No features listed</li>}
                    </ul>
                  </div>

                  {(selectedProperty?.taxes || selectedProperty?.flood_zone) && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Additional Details</h3>
                      <div className="space-y-2 text-sm">
                        {selectedProperty?.taxes && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Taxes:</span>
                            <span>${selectedProperty.taxes.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedProperty?.flood_zone && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Flood Zone:</span>
                            <span>{selectedProperty.flood_zone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4 pt-4">
                    <Button className="flex-1 bg-gradient-gold hover:shadow-button">
                      Contact Agent
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Schedule Showing
                    </Button>
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

export default Listings;