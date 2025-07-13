import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin, ArrowRight } from "lucide-react";

const Properties = () => {
  // Mock property data - in real app this would come from MLS/API
  const featuredProperties = [
    {
      id: 1,
      title: "Waterfront Luxury Estate",
      location: "Downtown St. Petersburg",
      price: "$1,250,000",
      beds: 4,
      baths: 3,
      sqft: "3,200",
      status: "For Sale",
      image: "/api/placeholder/600/400"
    },
    {
      id: 2,
      title: "Modern Townhouse",
      location: "Historic Kenwood",
      price: "$485,000",
      beds: 3,
      baths: 2.5,
      sqft: "2,100",
      status: "Pending",
      image: "/api/placeholder/600/400"
    },
    {
      id: 3,
      title: "Charming Bungalow",
      location: "Old Northeast",
      price: "$625,000",
      beds: 3,
      baths: 2,
      sqft: "1,850",
      status: "For Sale",
      image: "/api/placeholder/600/400"
    }
  ];

  return (
    <section id="properties" className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              Featured Properties
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Discover Your{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Perfect Home
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From waterfront estates to charming historic homes, we have properties 
              that match every lifestyle and budget in St. Petersburg.
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 border-0">
                <div className="relative overflow-hidden">
                  {/* Property Image Placeholder */}
                  <div className="aspect-[4/3] bg-gradient-subtle flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="text-center text-muted-foreground">
                      <Home className="w-12 h-12 mx-auto mb-2 opacity-60" />
                      <p className="text-sm">Property Image</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`absolute top-4 left-4 ${
                      property.status === 'Pending' 
                        ? 'bg-orange-500 hover:bg-orange-600' 
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
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
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

          {/* CTA Section */}
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Don't see what you're looking for? We have access to the entire MLS database.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-gold hover:shadow-button transition-all duration-200"
            >
              View All Listings
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Import the missing Home icon
import { Home } from "lucide-react";

export default Properties;