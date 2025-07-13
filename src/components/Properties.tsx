import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Properties = () => {
  // Featured properties from The Crawford Team
  const featuredProperties = [
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
            {featuredProperties.slice(0, 3).map((property) => (
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
              asChild
            >
              <Link to="/listings">
                View All Listings
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
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