import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const MLSSearch = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-[64px]">
      <Navigation />
      
      {/* IDX Property Search Section */}
      <section className="py-20 bg-gradient-subtle">
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
                Real-time listings updated directly from the MLS.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-elegant border-2 overflow-hidden relative isolate">
              <div className="w-full h-[600px] md:h-[800px] min-h-[600px] md:min-h-[800px] relative">
                <iframe 
                  src="https://stellar.mlsmatrix.com/Matrix/public/IDX.aspx?idx=989270e7" 
                  className="absolute inset-0 w-full h-full border-0"
                  frameBorder="0" 
                  marginWidth={0}
                  marginHeight={0}
                  scrolling="yes"
                  title="IDX Property Search"
                  allowFullScreen
                  referrerPolicy="origin"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    overflow: 'auto',
                    isolation: 'isolate'
                  }}
                />
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Powered by MLS Matrix • Updated in Real-Time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Second IDX Property Search Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                Map Search
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Search by Map
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore properties visually on an interactive map. 
                Find your perfect location in the Tampa Bay area.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-elegant border-2 overflow-hidden relative isolate">
              <div className="w-full h-[600px] md:h-[800px] min-h-[600px] md:min-h-[800px] relative">
                <iframe 
                  src="https://stellar.mlsmatrix.com/Matrix/public/IDX.aspx?idx=6b8f70e6" 
                  className="absolute inset-0 w-full h-full border-0"
                  frameBorder="0" 
                  marginWidth={0}
                  marginHeight={0}
                  scrolling="yes"
                  title="IDX Property Search 2"
                  allowFullScreen
                  referrerPolicy="origin"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    overflow: 'auto',
                    isolation: 'isolate'
                  }}
                />
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Powered by MLS Matrix • Updated in Real-Time
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

