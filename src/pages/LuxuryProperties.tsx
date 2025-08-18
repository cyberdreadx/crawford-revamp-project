import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Calendar, 
  Crown, 
  Star, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Eye,
  Heart,
  Share2
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

interface PropertyVideo {
  id: string;
  property_id: string;
  video_url: string;
  video_type: 'tour' | 'walkthrough' | 'aerial';
  title?: string;
  duration?: number;
  is_featured: boolean;
  display_order: number;
}

const LuxuryProperties = () => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyImages, setPropertyImages] = useState<{
    [key: string]: PropertyImage[];
  }>({});
  const [propertyVideos, setPropertyVideos] = useState<{
    [key: string]: PropertyVideo[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  // Fetch luxury properties and images from database
  useEffect(() => {
    fetchLuxuryPropertiesAndImages();
  }, []);

  // Auto-advance properties when autoplay is enabled
  useEffect(() => {
    if (!autoPlay || properties.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPropertyIndex(prev => (prev + 1) % properties.length);
      setCurrentMediaIndex(0);
      setShowVideo(false);
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

        // Sample videos for demonstration
        const sampleVideos: { [key: string]: PropertyVideo[] } = {};
        if (propertiesData && propertiesData.length > 0) {
          const firstPropertyId = propertiesData[0].id;
          sampleVideos[firstPropertyId] = [{
            id: 'sample-1',
            property_id: firstPropertyId,
            video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            video_type: 'tour',
            title: 'Luxury Estate Virtual Tour',
            is_featured: true,
            display_order: 1
          }];
        }
        setPropertyVideos(sampleVideos);
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
  const currentPropertyVideos = currentProperty ? propertyVideos[currentProperty.id] || [] : [];
  const totalMedia = currentPropertyImages.length + currentPropertyVideos.length;

  const nextProperty = () => {
    setCurrentPropertyIndex(prev => (prev + 1) % properties.length);
    setCurrentMediaIndex(0);
    setShowVideo(false);
  };

  const prevProperty = () => {
    setCurrentPropertyIndex(prev => (prev - 1 + properties.length) % properties.length);
    setCurrentMediaIndex(0);
    setShowVideo(false);
  };

  const nextMedia = () => {
    if (totalMedia > 0) {
      const nextIndex = (currentMediaIndex + 1) % totalMedia;
      setCurrentMediaIndex(nextIndex);
      setShowVideo(nextIndex >= currentPropertyImages.length);
    }
  };

  const prevMedia = () => {
    if (totalMedia > 0) {
      const prevIndex = (currentMediaIndex - 1 + totalMedia) % totalMedia;
      setCurrentMediaIndex(prevIndex);
      setShowVideo(prevIndex >= currentPropertyImages.length);
    }
  };

  const getCurrentMedia = () => {
    if (currentMediaIndex < currentPropertyImages.length) {
      return {
        type: 'image',
        url: currentPropertyImages[currentMediaIndex]?.image_url,
        alt: currentProperty?.title
      };
    } else {
      const videoIndex = currentMediaIndex - currentPropertyImages.length;
      const video = currentPropertyVideos[videoIndex];
      return {
        type: 'video',
        url: video?.video_url,
        title: video?.title || `${currentProperty?.title} Tour`,
        videoType: video?.video_type
      };
    }
  };

  const currentMedia = getCurrentMedia();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <div className="text-center">
          <motion.div
            className="w-20 h-20 border-4 border-gold-accent border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-xl text-gold-accent font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Curating Luxury Collection...
          </motion.p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <Navigation />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto px-6">
            <Crown className="w-32 h-32 mx-auto mb-8 text-gold-accent" />
            <h2 className="text-4xl font-light text-white mb-6 tracking-wide">
              Luxury Collection
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              We're carefully curating our exclusive luxury portfolio. 
              Please return soon to discover extraordinary properties.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <Navigation />
      
      {/* Mobile-First Luxury Property Showcase */}
      <div 
        className="relative min-h-screen overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPropertyIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background Media */}
            {totalMedia > 0 && (
              <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                  {currentMedia.type === 'image' ? (
                    <motion.img
                      key={`${currentPropertyIndex}-${currentMediaIndex}`}
                      src={currentMedia.url || '/placeholder.svg'}
                      alt={currentMedia.alt}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.02, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.98, opacity: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  ) : (
                    <motion.div
                      key={`${currentPropertyIndex}-${currentMediaIndex}-video`}
                      className="w-full h-full"
                      initial={{ scale: 1.02, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.98, opacity: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    >
                      <video
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Mobile-Optimized Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}

            {/* Mobile-First Content Layout */}
            <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-32">
              <div className="px-6 md:px-8 lg:px-12 space-y-4 md:space-y-6">
                {/* Mobile Property Title */}
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {currentProperty?.title}
                </motion.h1>

                {/* Mobile Location */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="flex items-center text-white/90 text-base md:text-lg font-light"
                >
                  <MapPin className="w-4 md:w-5 h-4 md:h-5 mr-2 text-gold-accent flex-shrink-0" />
                  <span className="truncate">{currentProperty?.location}</span>
                </motion.div>

                {/* Mobile Price */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="text-3xl md:text-4xl lg:text-5xl font-light text-gold-accent tracking-wide"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {formatPrice(currentProperty?.price || 0)}
                </motion.div>

                {/* Mobile Property Stats */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="flex items-center gap-4 md:gap-6 text-white/90 text-sm md:text-base font-light"
                >
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 md:w-5 h-4 md:h-5 text-gold-accent flex-shrink-0" />
                    <span>{currentProperty?.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 md:w-5 h-4 md:h-5 text-gold-accent flex-shrink-0" />
                    <span>{currentProperty?.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-4 md:w-5 h-4 md:h-5 text-gold-accent flex-shrink-0" />
                    <span>{currentProperty?.sqft?.toLocaleString()}</span>
                  </div>
                </motion.div>

                {/* Mobile Action Buttons */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col gap-3 pt-4"
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 font-semibold py-4 text-base shadow-lg transition-all duration-300"
                    onClick={() => setShowDetails(true)}
                  >
                    <Eye className="w-5 h-5 mr-3" />
                    View Estate Details
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="w-full border border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-medium py-4 text-base transition-all duration-300"
                  >
                    {autoPlay ? <Pause className="w-5 h-5 mr-3" /> : <Play className="w-5 h-5 mr-3" />}
                    {autoPlay ? 'Pause Tour' : 'Auto Tour'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Luxury Navigation Controls */}
        <div className={`absolute inset-y-0 left-0 flex items-center z-20 transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <Button
            variant="ghost"
            size="lg"
            onClick={prevProperty}
            className="ml-8 h-16 w-16 rounded-full bg-black/40 hover:bg-black/70 text-white border-2 border-white/20 hover:border-white/40 backdrop-blur-xl transition-all duration-300 hover:scale-110 shadow-2xl"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
        </div>

        <div className={`absolute inset-y-0 right-0 flex items-center z-20 transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <Button
            variant="ghost"
            size="lg"
            onClick={nextProperty}
            className="mr-8 h-16 w-16 rounded-full bg-black/40 hover:bg-black/70 text-white border-2 border-white/20 hover:border-white/40 backdrop-blur-xl transition-all duration-300 hover:scale-110 shadow-2xl"
          >
            <ArrowRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Media Navigation */}
        {totalMedia > 1 && (
          <>
            <div className={`absolute top-1/2 left-6 transform -translate-y-1/2 z-20 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevMedia}
                className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/40 text-white border border-white/30 hover:border-white/60 backdrop-blur-md transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>

            <div className={`absolute top-1/2 right-6 transform -translate-y-1/2 z-20 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMedia}
                className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/40 text-white border border-white/30 hover:border-white/60 backdrop-blur-md transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Elegant Media Indicators */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {Array.from({ length: totalMedia }).map((_, index) => {
                const isVideo = index >= currentPropertyImages.length;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentMediaIndex(index);
                      setShowVideo(isVideo);
                    }}
                    className={`relative transition-all duration-300 ${
                      index === currentMediaIndex 
                        ? 'w-12 h-3 bg-gold-accent shadow-lg shadow-gold-accent/50' 
                        : 'w-3 h-3 bg-white/40 hover:bg-white/70'
                    } rounded-full backdrop-blur-sm border border-white/20`}
                  >
                    {isVideo && (
                      <Play className="w-2 h-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-current" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Mobile-Optimized Property Dots */}
        <div className="absolute bottom-40 md:bottom-48 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-20">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentPropertyIndex(index);
                setCurrentMediaIndex(0);
                setShowVideo(false);
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentPropertyIndex 
                  ? 'w-3 h-3 md:w-4 md:h-4 bg-primary' 
                  : 'w-2 h-2 md:w-3 md:h-3 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Property Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-black text-white border-gold-accent/30">
          <DialogHeader className="text-center pb-8 border-b border-gold-accent/20">
            <DialogTitle className="text-4xl font-light tracking-wide mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {currentProperty?.title}
            </DialogTitle>
            <div className="text-xl text-gold-accent flex items-center justify-center gap-3 mb-4">
              <MapPin className="w-6 h-6" />
              {currentProperty?.location}
            </div>
            <div className="text-3xl font-light text-gold-accent" style={{ fontFamily: 'Playfair Display, serif' }}>
              {formatPrice(currentProperty?.price || 0)}
            </div>
          </DialogHeader>
          
          <div className="space-y-12 pt-8">
            {/* Property Gallery Preview */}
            {currentPropertyImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {currentPropertyImages.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image.image_url}
                    alt={`${currentProperty?.title} - ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-gold-accent/30 shadow-2xl"
                  />
                ))}
              </div>
            )}

            {/* Luxury Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-gold-accent/30 shadow-2xl">
                <Bed className="w-12 h-12 mx-auto mb-4 text-gold-accent" />
                <div className="text-3xl font-light mb-2">{currentProperty?.bedrooms}</div>
                <div className="text-sm text-white/70 uppercase tracking-widest">Bedrooms</div>
              </div>
              <div className="text-center p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-gold-accent/30 shadow-2xl">
                <Bath className="w-12 h-12 mx-auto mb-4 text-gold-accent" />
                <div className="text-3xl font-light mb-2">{currentProperty?.bathrooms}</div>
                <div className="text-sm text-white/70 uppercase tracking-widest">Bathrooms</div>
              </div>
              <div className="text-center p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-gold-accent/30 shadow-2xl">
                <Square className="w-12 h-12 mx-auto mb-4 text-gold-accent" />
                <div className="text-3xl font-light mb-2">{currentProperty?.sqft?.toLocaleString()}</div>
                <div className="text-sm text-white/70 uppercase tracking-widest">Square Feet</div>
              </div>
              <div className="text-center p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-gold-accent/30 shadow-2xl">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gold-accent" />
                <div className="text-3xl font-light mb-2">{currentProperty?.year_built || 'N/A'}</div>
                <div className="text-sm text-white/70 uppercase tracking-widest">Year Built</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Luxury Features */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-light mb-6 text-gold-accent uppercase tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Estate Features
                  </h3>
                  <div className="space-y-4">
                    {[
                      `Luxury ${currentProperty?.sqft?.toLocaleString()} square feet of refined living space`,
                      'Premium finishes throughout with designer selections',
                      'Floor-to-ceiling windows with panoramic views',
                      'Gourmet kitchen with top-of-the-line appliances',
                      'Master suite with spa-like bathroom amenities',
                      'Private outdoor spaces for relaxation and entertainment'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-2 h-2 bg-gold-accent rounded-full mt-3 flex-shrink-0" />
                        <span className="text-white/90 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                {currentProperty?.key_features && currentProperty.key_features.length > 0 && (
                  <div>
                    <h4 className="text-xl font-light mb-4 text-gold-accent">Additional Features</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {currentProperty.key_features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Star className="w-4 h-4 text-gold-accent flex-shrink-0" />
                          <span className="text-white/90">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Luxury Amenities */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-light mb-6 text-gold-accent uppercase tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Luxury Amenities
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Resort-Style Pool', desc: 'spa, cabanas, lounging areas, and fire pit' },
                      { title: 'Fitness Center', desc: 'state-of-the-art equipment for residents' },
                      { title: 'Social Spaces', desc: 'lounge spaces for socializing and events' },
                      { title: 'Concierge Services', desc: '24/7 front desk staff, controlled building access' },
                      { title: 'Valet Services', desc: 'professional valet parking available' },
                      { title: 'Private Spaces', desc: 'convenient on-site areas for pet owners' }
                    ].map((amenity, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-2 h-2 bg-gold-accent rounded-full mt-3 flex-shrink-0" />
                        <span className="text-white/90 leading-relaxed">
                          <strong className="text-gold-accent">{amenity.title}:</strong> {amenity.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <h3 className="text-2xl font-light mb-6 text-gold-accent uppercase tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Luxury Lifestyle
                  </h3>
                  <div className="space-y-4">
                    {[
                      'Situated in an exclusive neighborhood with premium dining and shopping',
                      'Minutes from cultural attractions and entertainment venues',
                      'Access to world-class recreational facilities and parks',
                      'Prestigious location with convenient transportation access'
                    ].map((lifestyle, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-2 h-2 bg-gold-accent rounded-full mt-3 flex-shrink-0" />
                        <span className="text-white/90 leading-relaxed">{lifestyle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="border-t border-gold-accent/20 pt-8">
              <h3 className="text-2xl font-light mb-6 text-gold-accent uppercase tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
                Estate Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Property Type:</span>
                    <span className="font-medium text-white">{currentProperty?.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <Badge variant={currentProperty?.status === 'For Sale' ? 'default' : 'secondary'}>
                      {currentProperty?.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  {currentProperty?.taxes && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Annual Taxes:</span>
                      <span className="font-medium text-white">{formatPrice(currentProperty.taxes)}</span>
                    </div>
                  )}
                  {currentProperty?.flood_zone && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Flood Zone:</span>
                      <span className="font-medium text-white">{currentProperty.flood_zone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-gold-accent/10 to-yellow-400/10 rounded-lg border border-gold-accent/30">
                    <div className="text-sm text-gold-accent uppercase tracking-wide mb-2">Luxury Specialist</div>
                    <div className="font-semibold text-white">The Crawford Team</div>
                    <div className="text-sm text-white/70">Exclusive Property Experts</div>
                    <div className="text-sm text-gold-accent mt-3">Private Showing Available</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {currentProperty?.description && (
              <div className="border-t border-gold-accent/20 pt-8">
                <h3 className="text-2xl font-light mb-6 text-gold-accent uppercase tracking-widest" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Estate Description
                </h3>
                <p className="text-white/90 leading-relaxed text-lg">
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