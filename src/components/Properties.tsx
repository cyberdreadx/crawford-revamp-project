import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Bed, Bath, Square, Calendar, MapPin, Car, Home, DollarSign, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

// Property Image Carousel Component
interface PropertyImageCarouselProps {
  images: PropertyImage[];
  propertyTitle: string;
  status?: string;
  showControls?: boolean;
}

const PropertyImageCarousel = ({ images, propertyTitle, status, showControls = false }: PropertyImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-500">
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
        className="w-full h-full object-cover rounded-lg shadow-elegant"
      />
      
      {/* Status Badge */}
      {status && (
        <Badge 
          className={`absolute top-4 left-4 text-sm lg:text-base px-3 lg:px-4 py-1 lg:py-2 ${
            status === 'Pending' 
              ? 'bg-orange-500 hover:bg-orange-600' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {status}
        </Badge>
      )}
      
      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
        </>
      )}
      
      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
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
  created_at: string;
  updated_at: string;
}

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

const Properties = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyImages, setPropertyImages] = useState<{ [key: string]: PropertyImage[] }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      let propertiesData, propertiesError;
      
      if (user) {
        // Admin users get full property data including agent contact
        const result = await supabase
          .from('properties')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false });
        propertiesData = result.data;
        propertiesError = result.error;
      } else {
        // Non-admin users get property data WITHOUT agent email/phone
        const result = await supabase
          .from('properties')
          .select(`
            id, title, location, price, bedrooms, bathrooms, sqft,
            year_built, status, description, key_features, taxes, flood_zone,
            is_featured, created_at, updated_at, property_type
          `)
          .eq('is_featured', true)
          .order('created_at', { ascending: false });
        propertiesData = result.data;
        propertiesError = result.error;
      }

      if (propertiesError) throw propertiesError;

      if (propertiesData && propertiesData.length > 0) {
        setProperties(propertiesData);

        // Fetch images for all properties
        const { data: imagesData, error: imagesError } = await supabase
          .from('property_images')
          .select('*')
          .in('property_id', propertiesData.map(p => p.id))
          .order('display_order');

        if (imagesError) throw imagesError;

        // Group images by property_id
        const imagesByProperty: { [key: string]: PropertyImage[] } = {};
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
    return primaryImage?.image_url || images[0]?.image_url || '/placeholder.svg';
  };

  const nextProperty = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === properties.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousProperty = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? properties.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </section>
    );
  }

  if (!properties.length) {
    return (
      <section className="min-h-[70vh] bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Featured Properties</h2>
          <p className="text-muted-foreground">Check back soon for new listings!</p>
        </div>
      </section>
    );
  }

  const currentProperty = properties[currentIndex];

  return (
    <section id="properties" className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                Featured Properties
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl md:text-6xl font-light text-foreground mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
            >
              Exclusive Listings
            </motion.h2>
          </div>

          {/* Hero Property Display */}
          <div className="relative mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5 }}
                className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center min-h-[70vh] lg:min-h-[80vh]"
              >
                {/* Property Images Carousel */}
                <div className="relative order-1">
                  <div className="aspect-[4/3] lg:aspect-square relative">
                    <PropertyImageCarousel 
                      images={propertyImages[currentProperty.id] || []}
                      propertyTitle={currentProperty.title}
                      status={currentProperty.status}
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-6 lg:space-y-8 order-2 px-4 lg:px-0">
                  <div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-foreground mb-3 lg:mb-4 leading-tight">
                      {currentProperty.title}
                    </h3>
                    <div className="flex items-start text-sm lg:text-lg text-muted-foreground mb-4 lg:mb-6">
                      <MapPin className="w-4 lg:w-5 h-4 lg:h-5 mr-2 mt-1 flex-shrink-0" />
                      <span className="leading-relaxed">{currentProperty.location}</span>
                    </div>
                  </div>
                  
                  <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-foreground">
                    ${currentProperty.price?.toLocaleString() || 'Price on request'}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8 space-y-2 sm:space-y-0 text-sm lg:text-lg text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Bed className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span>{currentProperty.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bath className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span>{currentProperty.bathrooms} Bathrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Square className="w-4 lg:w-5 h-4 lg:h-5" />
                      <span>{currentProperty.sqft?.toLocaleString()} Sq.Ft.</span>
                    </div>
                  </div>

                  <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                    {currentProperty.description || 'No description available.'}
                  </p>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button 
                      size="lg"
                      className="bg-gradient-gold hover:shadow-button transition-all duration-200 w-full sm:w-auto"
                      onClick={() => navigate(`/property/${currentProperty.id}`)}
                    >
                      View Listing
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="text-base lg:text-lg px-6 lg:px-8 w-full sm:w-auto"
                    >
                      Request Information
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute top-1/2 -left-20 transform -translate-y-1/2 hidden lg:block">
              <Button
                variant="outline"
                size="lg"
                onClick={previousProperty}
                className="w-16 h-16 rounded-full bg-white shadow-2xl border-2 border-gray-200 hover:bg-gray-50 hover:shadow-elegant transition-all duration-200"
              >
                <ChevronLeft className="w-8 h-8 text-gray-800" />
              </Button>
            </div>
            
            <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 hidden lg:block">
              <Button
                variant="outline"
                size="lg"
                onClick={nextProperty}
                className="w-16 h-16 rounded-full bg-white shadow-2xl border-2 border-gray-200 hover:bg-gray-50 hover:shadow-elegant transition-all duration-200"
              >
                <ChevronRight className="w-8 h-8 text-gray-800" />
              </Button>
            </div>

            {/* Mobile Navigation - Bottom positioned */}
            <div className="flex justify-center space-x-4 mt-8 lg:hidden">
              <Button
                variant="outline"
                size="lg"
                onClick={previousProperty}
                className="w-12 h-12 rounded-full bg-white shadow-2xl border-2 border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={nextProperty}
                className="w-12 h-12 rounded-full bg-white shadow-2xl border-2 border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </Button>
            </div>

            {/* Property Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {properties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-foreground' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <p className="text-muted-foreground mb-8">
              Discover exceptional properties curated by The Crawford Team
            </p>
            <Button 
              size="lg"
              className="bg-gradient-gold hover:shadow-button transition-all duration-200"
              onClick={() => navigate(`/property/${currentProperty.id}`)}
            >
              View This Property
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Property Details Modal */}
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedProperty?.title}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{selectedProperty?.location}</span>
                <Badge variant="secondary" className="ml-auto">{selectedProperty?.status}</Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <PropertyImageCarousel 
                  images={selectedProperty ? propertyImages[selectedProperty.id] || [] : []}
                  propertyTitle={selectedProperty?.title || ''}
                  showControls={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Property Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProperty?.bedrooms} Bedrooms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProperty?.bathrooms} Bathrooms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProperty?.sqft?.toLocaleString()} sqft</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Built {selectedProperty?.year_built || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProperty?.property_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>${selectedProperty?.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProperty?.description || 'No description available.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
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

                  <div className="pt-4 space-y-2">
                    <Button className="w-full">Contact Agent</Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="https://calendly.com/yourcrawfordteam/30min" target="_blank" rel="noopener noreferrer">
                        Schedule Showing
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Properties;