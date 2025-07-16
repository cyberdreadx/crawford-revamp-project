import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
const Hero = () => {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  const scrollToProperties = () => {
    document.querySelector("#properties")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <section id="home" className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroImage})`
    }}>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 to-navy-deep/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            Find Your Dream Home in{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              St. Petersburg
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed animate-fade-in">
            The Crawford Team - Powered by Keller Williams St Pete Realty
          </p>

          {/* Single CTA Button */}
          <div className="animate-fade-in">
            <Button size="lg" className="bg-gradient-gold hover:shadow-elegant text-navy-deep font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105" onClick={scrollToProperties}>
              View Properties
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>;
};
export default Hero;