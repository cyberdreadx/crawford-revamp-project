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
      setLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from('hero_images').select('*').eq('is_active', true).order('display_order', {
          ascending: true
        });
        if (error) {
          console.error('Error fetching hero images:', error);
          return;
        }
        if (data && data.length > 0) {
          console.log('Auto-cycling effect - Images:', data, 'Length:', data.length);
          setHeroImages(data);
          // Preload first few images for better performance
          data.slice(0, 3).forEach(image => {
            const img = new Image();
            img.src = image.image_url;
          });
        } else {
          // Fallback to static image if no hero images in database
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
    const currentImages = heroImages.length > 0 ? heroImages : [{
      image_url: heroImage
    }];
    console.log('Auto-cycling effect - Images:', currentImages, 'Length:', currentImages.length);
    if (currentImages.length > 1) {
      console.log('Setting up interval for', currentImages.length, 'images');
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => {
          const newIndex = (prev + 1) % currentImages.length;
          console.log('Cycling from index', prev, 'to', newIndex);
          return newIndex;
        });
      }, 4000); // Change image every 4 seconds

      return () => {
        console.log('Clearing interval');
        clearInterval(interval);
      };
    } else {
      console.log('Not setting up interval - only', currentImages.length, 'image(s)');
    }
  }, [heroImages]);

  // Reset to first image when hero images change
  useEffect(() => {
    console.log('Resetting to first image');
    setCurrentImageIndex(0);
  }, [heroImages]);

  // Use uploaded hero images if available, otherwise fallback to static image
  const currentImages = heroImages.length > 0 ? heroImages : [{
    image_url: heroImage
  }];
  return <section id="home" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel with Fade */}
      <div className="absolute inset-0 w-full h-full">
        {currentImages.map((image, index) => <div key={image.id || index} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}>
            <img src={image.image_url} alt={image.title || 'Hero Image'} className="w-full h-full object-cover" loading={index < 3 ? 'eager' : 'lazy'} // Eager load first 3 images
        onLoad={() => {
          // Preload next image
          if (index === currentImageIndex && currentImages[index + 1]) {
            const nextImg = new Image();
            nextImg.src = currentImages[index + 1].image_url;
          }
        }} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
          </div>)}
      </div>

      {/* Content */}
      <motion.div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 w-full max-w-6xl mx-auto" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 1
    }}>

        {/* Team Name */}
        <motion.div className="mb-6 sm:mb-8 lg:mb-12" initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: 0.3,
        duration: 0.8
      }}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-cursive text-white leading-[0.9] tracking-tight" style={{
          textShadow: '0 6px 30px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.5)',
          filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.4))'
        }}>
            The Crawford Team
          </h1>
          
          {/* CARE Tagline */}
          <motion.div className="mt-4 sm:mt-6" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6,
          duration: 0.8
        }}>
            <div className="space-y-6">
              {/* CARE Words - Vertical Stack */}
              <motion.div className="flex flex-col items-center justify-center space-y-2" initial={{
              opacity: 0,
              scale: 0.8
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.8,
              delay: 0.8
            }}>
                <motion.div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 font-medium tracking-wide" style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.7)'
              }} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.6,
                delay: 1.0
              }}>
                  <span className="text-primary font-bold text-shadow-glow text-4xl sm:text-5xl md:text-6xl lg:text-7xl">C</span>reating
                </motion.div>
                <motion.div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 font-medium tracking-wide" style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.7)'
              }} initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.6,
                delay: 1.2
              }}>
                  <span className="text-primary font-bold text-shadow-glow text-4xl sm:text-5xl md:text-6xl lg:text-7xl">A</span> <span className="text-primary font-bold text-shadow-glow text-4xl sm:text-5xl md:text-6xl lg:text-7xl">R</span>eferrable
                </motion.div>
                <motion.div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 font-medium tracking-wide" style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.7)'
              }} initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.6,
                delay: 1.4
              }}>
                  <span className="text-primary font-bold text-shadow-glow text-4xl sm:text-5xl md:text-6xl lg:text-7xl">E</span>xperience
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Achievement Badge */}
        <motion.div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6 sm:mb-8" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5,
        duration: 0.8
      }}>
          <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          <span className="text-white/90 text-sm sm:text-base font-medium">Top 5% Pinellas County</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight" initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.6,
        duration: 1
      }} style={{
        textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)'
      }}>Real Estate Experts</motion.h2>

        {/* Subheadline */}
        <motion.p className="text-white/80 text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed" initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.8,
        duration: 1
      }}>
          Keller Williams St Pete • Your trusted partners in finding extraordinary homes
        </motion.p>

        {/* CTA Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: 1.1,
        duration: 0.8
      }}>
          <motion.div whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Button size="lg" onClick={scrollToProperties} className="bg-gradient-to-r from-white to-white/95 hover:from-white/95 hover:to-white text-primary font-semibold px-8 py-4 text-base sm:text-lg transition-all duration-300 rounded-full shadow-2xl hover:shadow-white/30 border-0">
              Search All Homes
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
          
          <motion.div whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Button variant="outline" size="lg" onClick={() => document.querySelector("#contact")?.scrollIntoView({
            behavior: "smooth"
          })} className="bg-white/5 backdrop-blur-md hover:bg-white/15 text-white font-semibold px-8 py-4 text-base sm:text-lg transition-all duration-300 border border-white/30 hover:border-white/50 rounded-full">
              Get Consultation
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
    </section>;
};
export default Hero;