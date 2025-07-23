import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const scrollToProperties = () => {
    document.querySelector("#properties")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 to-navy-deep/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 lg:px-8">
        {/* Small headline */}
        <p className="text-white/90 text-sm md:text-base mb-4 tracking-wide uppercase animate-slide-in-right" style={{ animationDelay: '0.2s', animationDuration: '0.8s' }}>
          Top 5% of Pinellas County
        </p>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 animate-scale-in" style={{ animationDelay: '0.5s', animationDuration: '1.2s' }}>
          The Crawford Team
        </h1>

        {/* Subheadline */}
        <p className="text-white/90 text-lg md:text-xl mb-10 animate-fade-in" style={{ animationDelay: '0.8s', animationDuration: '1s' }}>
          Keller Williams St Pete
        </p>

        {/* Single CTA Button */}
        <div className="animate-scale-in" style={{ animationDelay: '1.1s', animationDuration: '0.8s' }}>
          <Button 
            size="lg" 
            onClick={scrollToProperties}
            className="bg-gradient-teal hover:shadow-elegant text-white font-medium px-8 py-4 text-base transition-all duration-300 transform hover:scale-105 border border-white/20"
          >
            Search All Homes
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

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