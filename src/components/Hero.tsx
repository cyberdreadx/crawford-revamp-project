import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  // Use uploaded hero images if available, otherwise fallback to static image
  const currentImages = heroImages.length > 0 ? heroImages : [{ image_url: heroImage }];

  return (
    <section id="home" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {currentImages.length === 1 ? (
          <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{
            backgroundImage: `url(${currentImages[0].image_url})`
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 to-navy-deep/70"></div>
          </div>
        ) : (
          <Carousel className="w-full h-full" opts={{ loop: true }}>
            <CarouselContent className="w-full h-full -ml-0">
              {currentImages.map((image, index) => (
                <CarouselItem key={image.id || index} className="w-full h-full pl-0">
                  <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{
                    backgroundImage: `url(${image.image_url})`
                  }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 to-navy-deep/70"></div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {currentImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30" />
              </>
            )}
          </Carousel>
        )}
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
          className="mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <img 
            src="/lovable-uploads/ffac55df-b3b0-408c-b5b1-cac69e26b624.png" 
            alt="The Crawford Team - Welcome Home" 
            className="h-48 md:h-56 lg:h-64 w-auto object-contain mx-auto"
          />
        </motion.div>

        {/* Main Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6">
          {"Top 5% of Pinellas County".split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + index * 0.03,
                duration: 0.6,
                ease: "easeOut"
              }}
              style={{ display: char === " " ? "inline" : "inline-block" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

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
              className="bg-gradient-teal hover:shadow-elegant text-white font-medium px-8 py-4 text-base transition-all duration-300 border border-white/20"
            >
              Search All Homes
              <ArrowRight className="ml-2 w-5 h-5" />
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