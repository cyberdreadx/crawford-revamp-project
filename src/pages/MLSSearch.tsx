import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MLSListings from "@/components/MLSListings";

const MLSSearch = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-[64px]">
      <Navigation />
      
      {/* MLS Listings Section */}
      <section id="mls-search" className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                MLS Search
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Search All MLS Listings
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Access the complete database of available properties across the Tampa Bay area. 
                Real-time listings synced directly from Stellar MLS. Toggle between list and map view.
              </p>
            </div>
            
            <MLSListings />
            
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Powered by Stellar MLS • Updated in Real-Time
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MLSSearch;
