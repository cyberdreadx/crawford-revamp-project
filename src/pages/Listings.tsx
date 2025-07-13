import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin, ArrowRight, Home } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Listings = () => {
  // All Crawford Team properties
  const allProperties = [
    {
      id: 1,
      title: "Charming Coastal Retreat",
      location: "6730 10th Avenue Terrace S, St. Petersburg",
      price: "$210,000",
      beds: 2,
      baths: 1,
      sqft: "886",
      totalSqft: "1,490",
      status: "For Sale",
      description: "Perfect beachside retreat with oversized screened porch and fully fenced backyard. Minutes to St. Pete Beach & Treasure Island.",
      highlights: ["AE Flood Zone", "Tile & Parquet Floors", "Airbnb Ready"]
    },
    {
      id: 2,
      title: "Investment Opportunity",
      location: "5204 Mile Stretch Dr, Holiday",
      price: "$155,000",
      beds: 2,
      baths: 1,
      sqft: "714",
      totalSqft: "1,232",
      status: "Cash Only",
      description: "Income-producing property with current tenant through August 2024. Near Tarpon Springs and beaches.",
      highlights: ["$1,100/mo Income", "Enclosed Bonus Room", "Cash or Hard Money"]
    },
    {
      id: 3,
      title: "Duplex Investment",
      location: "8322 Galewood St, New Port Richey",
      price: "$289,000",
      beds: 4,
      baths: 2,
      sqft: "N/A",
      status: "For Sale",
      description: "2-unit duplex with recent upgrades. One unit vacant, one producing $1,250/month. Potential $2,500+/month income.",
      highlights: ["New Roof 2020", "New HVAC 2022", "Block Construction"]
    },
    {
      id: 4,
      title: "Move-In Ready Rental",
      location: "10231 Ivanhoe Dr, New Port Richey",
      price: "$168,000",
      beds: 2,
      baths: 1,
      sqft: "N/A",
      status: "Tenant Occupied",
      description: "Solid investment with long-term tenant paying $1,250/month. Tiled floors and enclosed back room.",
      highlights: ["Current Income", "Washer/Dryer Included", "Move-In Ready"]
    },
    {
      id: 5,
      title: "Rainbow Lakes Paradise",
      location: "18384 Miami Blvd, Dunnellon",
      price: "$179,000",
      beds: 2,
      baths: 2,
      sqft: "1,104",
      status: "Furnished",
      description: "Fully furnished retreat near Rainbow Springs State Park. Perfect for vacationers, snowbirds, or digital nomads.",
      highlights: ["STR Friendly", "No HOA", "Screened Lanai"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              All Properties
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Browse All{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Available Listings
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our complete portfolio of properties across St. Petersburg, 
              New Port Richey, Holiday, and Dunnellon. From investment opportunities 
              to dream homes, find your perfect match.
            </p>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProperties.map((property) => (
                <Card key={property.id} className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 border-0">
                  <div className="relative overflow-hidden">
                    {/* Property Image */}
                    {property.id === 1 ? (
                      <img 
                        src="/lovable-uploads/d52f2c38-b140-4592-9f86-849096bf6c47.png"
                        alt={property.title}
                        className="aspect-[4/3] w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-subtle flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <div className="text-center text-muted-foreground">
                          <Home className="w-12 h-12 mx-auto mb-2 opacity-60" />
                          <p className="text-sm">Property Image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute top-4 left-4 ${
                        property.status === 'Pending' 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : property.status === 'Cash Only'
                          ? 'bg-red-600 hover:bg-red-700'
                          : property.status === 'Tenant Occupied'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : property.status === 'Furnished'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {property.status}
                    </Badge>
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-navy-deep/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg font-semibold">
                      {property.price}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-2">{property.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {property.description}
                      </p>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.beds} Beds</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.baths} Baths</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Square className="w-4 h-4" />
                        <span>{property.sqft} sqft</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {property.highlights.map((highlight, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                    >
                      View Details
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="text-center mt-16 bg-gradient-subtle rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Don't See What You're Looking For?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                We have access to the entire MLS database and can help you find the perfect property 
                that meets your specific needs and budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-gold hover:shadow-button transition-all duration-200"
                >
                  Contact Our Team
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                >
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Listings;