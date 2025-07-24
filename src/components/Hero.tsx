import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { motion } from "framer-motion";

const Hero = () => {
  const scrollToProperties = () => {
    document.querySelector("#properties")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section id="home" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: `url(${heroImage})`
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 to-navy-deep/70"></div>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 text-center px-6 lg:px-8 w-full max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Small headline */}
        <motion.p 
          className="text-white/90 text-sm md:text-base mb-4 tracking-wide uppercase"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Top 5% of Pinellas County
        </motion.p>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6">
          {"The Crawford Team".split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + index * 0.08,
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