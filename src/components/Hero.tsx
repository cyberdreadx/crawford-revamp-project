import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
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

  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const fetchHeroImages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('hero_images')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching hero images:', error);
          return;
        }

        if (data && data.length > 0) {
          setHeroImages(data);
          // Preload first few images for better performance
          data.slice(0, 3).forEach(image => {
            const img = new Image();
            img.src = image.image_url;
          });
        } else {
          setHeroImages([]);
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
        setCurrentImageIndex(prev => (prev + 1) % currentImages.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [heroImages]);

  // Use uploaded hero images if available, otherwise fallback to static image
  const currentImages = heroImages.length > 0 ? heroImages : [{ image_url: heroImage }];

  return (
    <section id="home" className="relative min-h-screen w-full flex items-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {currentImages.map((image, index) => (
          <div
            key={image.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.image_url}
              alt={image.title || 'Hero Image'}
              className="w-full h-full object-cover"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
            {/* Stronger overlay gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85"></div>
            {/* Crawford Team overlay with seafoam color */}
            <div className="absolute inset-0 bg-[#7BBCB0]/40 mix-blend-overlay"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center space-y-8 py-8 px-4 sm:px-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Achievement Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#7BBCB0] text-[#7BBCB0]" />
                ))}
              </div>
              <span className="text-white/90 text-sm font-medium">Top 5% Pinellas County</span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-cursive text-white leading-tight mb-4" style={{
                textShadow: '0 4px 20px rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.6)'
              }}>
                The Crawford Team
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6" style={{
                textShadow: '0 4px 15px rgba(0,0,0,1), 0 2px 10px rgba(0,0,0,0.9)'
              }}>
                
              </h2>
            </motion.div>

            {/* CARE Values */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {[
                { letter: 'C.', word: 'Creating' },
                { letter: 'A.', word: 'Authentic' },
                { letter: 'R.', word: 'Referrable' },
                { letter: 'E.', word: 'Experiences' }
              ].map((item, index) => (
                <motion.div
                  key={item.letter}
                  className="text-center px-3 py-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                >
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#7BBCB0] block" style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                  }}>
                    {item.letter}
                  </span>
                  <span className="text-white text-sm sm:text-base font-medium" style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                  }}>
                    {item.word}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 4px 15px rgba(0,0,0,0.9)' }}
            >
              Keller Williams St Pete • Your trusted partners in finding extraordinary homes
              in St. Petersburg, Florida
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={scrollToProperties}
                  className="bg-[#7BBCB0] hover:bg-[#6AABA0] text-white font-semibold px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[200px]"
                >
                  Search All Homes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={scrollToContact}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/30 hover:border-white/50 font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 min-w-[200px]"
                >
                  Get Consultation
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-12 pt-8 border-t border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {[
                { number: '500+', label: 'Homes Sold' },
                { number: '15+', label: 'Years Experience' },
                { number: '98%', label: 'Client Satisfaction' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-[#7BBCB0] mb-1" style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {stat.number}
                  </div>
                  <div className="text-white text-sm font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;