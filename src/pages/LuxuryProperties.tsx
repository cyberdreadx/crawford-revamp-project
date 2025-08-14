import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Home, 
  Calendar, 
  Building, 
  ChevronLeft, 
  ChevronRight, 
  Crown,
  Star,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

const LuxuryProperties = () => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyImages, setPropertyImages] = useState<{ [key: string]: PropertyImage[] }>({});
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const { toast } = useToast();

  // Fetch luxury properties (price > $600k) and images from database
  useEffect(() => {
    fetchLuxuryPropertiesAndImages();
  }, []);

  // Auto-advance properties when autoplay is enabled
  useEffect(() => {
    if (!autoPlay || properties.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentPropertyIndex((prev) => (prev + 1) % properties.length);
      setCurrentImageIndex(0);
    }, 8000);

    return () => clearInterval(interval);
  }, [autoPlay, properties.length]);

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
        description: "Failed to fetch luxury properties: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentProperty = properties[currentPropertyIndex];
  const currentPropertyImages = currentProperty ? propertyImages[currentProperty.id] || [] : [];

  const nextProperty = () => {
    setCurrentPropertyIndex((prev) => (prev + 1) % properties.length);
    setCurrentImageIndex(0);
  };

  const prevProperty = () => {
    setCurrentPropertyIndex((prev) => (prev - 1 + properties.length) % properties.length);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (currentPropertyImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % currentPropertyImages.length);
    }
  };

  const prevImage = () => {
    if (currentPropertyImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + currentPropertyImages.length) % currentPropertyImages.length);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading luxury collection...
          </motion.p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-subtle">
          <div className="text-center">
            <Crown className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-3xl font-bold mb-4">No Luxury Properties Available</h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              We're currently updating our luxury collection. Please check back soon for exclusive properties.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-light">
      <Navigation />
      
      {/* Full-Screen Property Showcase */}
      <div className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPropertyIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            {currentPropertyImages.length > 0 && (
              <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${currentPropertyIndex}-${currentImageIndex}`}
                    src={currentPropertyImages[currentImageIndex]?.image_url || '/placeholder.svg'}
                    alt={currentProperty?.title}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 1.2 }}
                  />
                </AnimatePresence>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-warm-brown/60 via-warm-brown/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-warm-brown/30 via-transparent to-warm-brown/30" />
              </div>
            )}

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-4xl">
                  {/* Property Badge */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mb-6"
                  >
                    <Badge className="bg-gold-accent/90 text-warm-brown font-semibold px-4 py-2 text-sm">
                      <Crown className="w-4 h-4 mr-2" />
                      Luxury Collection
                    </Badge>
                  </motion.div>

                  {/* Property Title */}
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
                  >
                    {currentProperty?.title}
                  </motion.h1>

                  {/* Location */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex items-center text-white/90 text-xl mb-6"
                  >
                    <MapPin className="w-6 h-6 mr-3" />
                    {currentProperty?.location}
                  </motion.div>

                  {/* Price */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-4xl md:text-5xl font-bold text-amber-400 mb-8"
                  >
                    {formatPrice(currentProperty?.price || 0)}
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="flex items-center gap-8 text-white/90 text-lg mb-8"
                  >
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5" />
                      <span>{currentProperty?.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5" />
                      <span>{currentProperty?.bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="w-5 h-5" />
                      <span>{currentProperty?.sqft?.toLocaleString()} sq ft</span>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex items-center gap-4"
                  >
                    <Button 
                      size="lg" 
                      className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 text-lg"
                      onClick={() => setShowDetails(true)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 py-3 text-lg"
                      onClick={() => setAutoPlay(!autoPlay)}
                    >
                      {autoPlay ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      {autoPlay ? 'Pause' : 'Auto Play'}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute inset-y-0 left-0 flex items-center z-20">
          <Button
            variant="ghost"
            size="lg"
            onClick={prevProperty}
            className="ml-6 h-16 w-16 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/20"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center z-20">
          <Button
            variant="ghost"
            size="lg"
            onClick={nextProperty}
            className="mr-6 h-16 w-16 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/20"
          >
            <ArrowRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Image Navigation */}
        {currentPropertyImages.length > 1 && (
          <>
            <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>

            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Image Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {currentPropertyImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex 
                      ? 'bg-cream-light' 
                      : 'bg-cream-light/40 hover:bg-cream-light/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Property Counter */}
        <div className="absolute top-6 right-6 z-20">
          <div className="bg-warm-brown/50 text-cream-light px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="text-lg font-semibold">
              {currentPropertyIndex + 1} / {properties.length}
            </span>
          </div>
        </div>

        {/* Property Navigation Dots */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPropertyIndex(index);
                setCurrentImageIndex(0);
              }}
              className={`w-4 h-4 rounded-full transition-all ${
                index === currentPropertyIndex 
                  ? 'bg-gold-accent' 
                  : 'bg-cream-light/40 hover:bg-cream-light/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Property Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center mb-2">{currentProperty?.title}</DialogTitle>
            <div className="text-center text-lg text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              {currentProperty?.location}
            </div>
            <div className="text-center text-2xl font-bold text-primary mt-2">
              {formatPrice(currentProperty?.price || 0)}
            </div>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* Property Gallery Preview */}
            {currentPropertyImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-40">
                {currentPropertyImages.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image.image_url}
                    alt={`${currentProperty?.title} - ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-6 bg-gradient-subtle rounded-lg border">
                <Bed className="w-10 h-10 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">{currentProperty?.bedrooms}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Bedrooms</div>
              </div>
              <div className="text-center p-6 bg-gradient-subtle rounded-lg border">
                <Bath className="w-10 h-10 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">{currentProperty?.bathrooms}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Bathrooms</div>
              </div>
              <div className="text-center p-6 bg-gradient-subtle rounded-lg border">
                <Square className="w-10 h-10 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">{currentProperty?.sqft?.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Square Feet</div>
              </div>
              <div className="text-center p-6 bg-gradient-subtle rounded-lg border">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">{currentProperty?.year_built || 'N/A'}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Year Built</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Unit Features */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">Unit Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Luxury {currentProperty?.sqft?.toLocaleString()} square feet of refined living space</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Premium finishes throughout with designer selections</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Floor-to-ceiling windows with panoramic views</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Gourmet kitchen with top-of-the-line appliances</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Master suite with spa-like bathroom amenities</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Private outdoor spaces for relaxation and entertainment</span>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                {currentProperty?.key_features && currentProperty.key_features.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Additional Features</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {currentProperty.key_features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">Amenities</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Resort-Style Pool:</strong> spa, cabanas, lounging areas, and fire pit</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Fitness Center:</strong> state-of-the-art equipment for residents</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Social Spaces:</strong> lounge spaces for socializing and events</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Concierge Services:</strong> 24/7 front desk staff, controlled building access</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Valet Services:</strong> professional valet parking available</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Private Spaces:</strong> convenient on-site areas for pet owners</span>
                    </div>
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">Lifestyle</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Situated in an exclusive neighborhood with premium dining and shopping</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Minutes from cultural attractions and entertainment venues</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Access to world-class recreational facilities and parks</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Prestigious location with convenient transportation access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="font-medium">{currentProperty?.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={currentProperty?.status === 'For Sale' ? 'default' : 'secondary'}>
                      {currentProperty?.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  {currentProperty?.taxes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Taxes:</span>
                      <span className="font-medium">{formatPrice(currentProperty.taxes)}</span>
                    </div>
                  )}
                  {currentProperty?.flood_zone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flood Zone:</span>
                      <span className="font-medium">{currentProperty.flood_zone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="text-center p-4 bg-gradient-subtle rounded-lg border">
                    <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Contact Agent</div>
                    <div className="font-semibold">The Crawford Team</div>
                    <div className="text-sm text-muted-foreground">Luxury Property Specialists</div>
                    <div className="text-sm text-primary mt-2">Contact for Private Showing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentProperty?.description && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentProperty.description}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default LuxuryProperties;