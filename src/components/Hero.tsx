import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface HeroImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

const Hero = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollToProperties = () => {
    document.querySelector("#properties")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_images')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching hero images:', error);
        } else {
          setHeroImages(data || []);
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  // Auto-advance carousel for multiple images
  useEffect(() => {
    const currentImages = heroImages.length > 0 ? heroImages : [{ image_url: heroImage }];
    
    if (currentImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages]);

  // Use uploaded hero images if available, otherwise fallback to static image
  const currentImages = heroImages.length > 0 ? heroImages : [{ image_url: heroImage }];

  return (
    <section id="home" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel with Fade */}
      <div className="absolute inset-0 w-full h-full">
        {currentImages.map((image, index) => (
          <div
            key={image.id || index}
            className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image.image_url})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/15 to-navy-deep/10"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 text-center px-6 lg:px-8 w-full max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >

        {/* Logo */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <img 
            src="/lovable-uploads/7199c7df-85f7-4652-b06a-50fa1258b504.png" 
            alt="The Crawford Team - Welcome Home" 
            className="h-56 md:h-64 lg:h-72 w-auto object-contain mx-auto filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          />
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          className="text-5xl md:text-6xl lg:text-7xl font-elegant text-white mb-8 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          style={{
            textShadow: '0 2px 10px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          Top 5% of Pinellas County
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          className="text-white/90 text-lg md:text-xl mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Keller Williams St Pete
        </motion.p>

        {/* Single CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              onClick={scrollToProperties}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-10 py-5 text-lg transition-all duration-300 border border-white/30 hover:border-white/50 rounded-full shadow-2xl hover:shadow-white/20"
            >
              Search All Homes
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;