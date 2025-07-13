import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProperties = () => {
    document.querySelector("#properties")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 to-navy-deep/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-background/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold-warm text-gold-warm" />
              ))}
            </div>
            <span className="text-white text-sm font-medium">Trusted by 500+ Families</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
            Find Your Dream Home in{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              St. Petersburg
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed animate-slide-up">
            Expert real estate guidance with personalized service. We make your home buying and selling journey seamless and successful.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-8 mb-10 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold-warm">500+</div>
              <div className="text-white/80 text-sm">Homes Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold-warm">15+</div>
              <div className="text-white/80 text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold-warm">98%</div>
              <div className="text-white/80 text-sm">Client Satisfaction</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
            <Button 
              size="lg"
              className="bg-gradient-gold hover:shadow-elegant text-navy-deep font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              onClick={scrollToContact}
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg transition-all duration-300"
              onClick={scrollToProperties}
            >
              View Properties
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center gap-8 opacity-80 animate-fade-in">
            <div className="text-white/70 text-sm">
              <span className="font-semibold">Keller Williams</span> St Pete Realty
            </div>
            <div className="text-white/70 text-sm">
              Licensed Real Estate Professionals
            </div>
            <div className="text-white/70 text-sm">
              MLS Certified Agents
            </div>
          </div>
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