import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bed, Bath, Square, MapPin, ArrowRight, Home, Calendar, Ruler, Building } from "lucide-react";
import { Link } from "react-router-dom";

const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  // Featured properties from The Crawford Team - Actual MLS Listings
  const featuredProperties = [
    {
      id: 1,
      mlsNumber: "TB8400218",
      title: "Charming Coastal Retreat",
      location: "6730 10th Avenue Ter S, St. Petersburg, FL 33707",
      price: "$210,000",
      beds: 2,
      baths: 1,
      sqft: "886",
      totalSqft: "1,490",
      yearBuilt: "1953",
      status: "Active",
      floodZone: "AE",
      description: "Not Substantially Damaged! Welcome to one of St. Pete's most charming pockets, this property is just a short jaunt to St. Pete Beach, Treasure Island, near sunny parks, and close to the heart of downtown.",
      highlights: ["AE Flood Zone", "Stucco & Wood Frame", "Fully Fenced Yard", "Screened Porch"],
      subdivision: "Brookwood 1st Add",
      taxes: "$1,371",
      lotSize: "4,674 SqFt"
    },
    {
      id: 2,
      mlsNumber: "TB8395009",
      title: "Corner Lot Gem Near 4th Street",
      location: "5700 Pacific St N, St. Petersburg, FL 33703",
      price: "$375,000",
      beds: 2,
      baths: 1,
      sqft: "936",
      totalSqft: "1,254",
      yearBuilt: "1973",
      status: "Active",
      floodZone: "AE",
      description: "Charming Corner Lot Home Near 4th St Corridor – Move-In Ready! Recently updated with new roof (2019), electrical panel (2022), and HVAC (2022).",
      highlights: ["Corner Lot", "Recent Updates", "No Hurricane Damage", "Climate-Controlled Garage"],
      subdivision: "North St Petersburg",
      taxes: "$2,216",
      lotSize: "8,233 SqFt"
    },
    {
      id: 3,
      mlsNumber: "TB8398514",
      title: "Rainbow Lakes Paradise",
      location: "21078 SW Honeysuckle St, Dunnellon, FL 34431",
      price: "$250,000",
      beds: 3,
      baths: 2,
      sqft: "1,395",
      totalSqft: "2,342",
      yearBuilt: "1969",
      status: "Active",
      floodZone: "X",
      description: "Charming Mid-Century Gem in Rainbow Lakes Estates – Fully Furnished & Move-In Ready! Perfect turnkey home, seasonal retreat, or investment property.",
      highlights: ["Fully Furnished", "2-Car Garage", "Fireplace", "Near Rainbow Springs"],
      subdivision: "Rainbow Lakes Estate",
      taxes: "$657",
      lotSize: "10,454 SqFt"
    }
  ];

  return (
    <section id="properties" className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              Featured Properties
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 animate-scale-in" style={{ animationDelay: '0.3s', animationDuration: '1s' }}>
              Discover Your Perfect Home
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '1s' }}>
              From waterfront estates to charming historic homes, we have properties 
              that match every lifestyle and budget in St. Petersburg.
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProperties.slice(0, 3).map((property) => (
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
                    onClick={() => setSelectedProperty(property)}
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

        {/* Property Details Modal */}
        <Dialog open={!!selectedProperty} onOpenChange={() => setSelectedProperty(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProperty && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{selectedProperty.title}</span>
                    <Badge className="ml-2">{selectedProperty.status}</Badge>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Property Image */}
                  <div className="space-y-4">
                    {selectedProperty.id === 1 ? (
                      <img 
                        src="/lovable-uploads/d52f2c38-b140-4592-9f86-849096bf6c47.png"
                        alt={selectedProperty.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-subtle flex items-center justify-center rounded-lg">
                        <div className="text-center text-muted-foreground">
                          <Home className="w-16 h-16 mx-auto mb-2 opacity-60" />
                          <p>Property Image</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Property Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProperty.beds} Bedrooms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bath className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProperty.baths} Bathrooms</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Square className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedProperty.sqft} Heated SqFt</span>
                      </div>
                      {selectedProperty.yearBuilt && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Built {selectedProperty.yearBuilt}</span>
                        </div>
                      )}
                      {selectedProperty.totalSqft && (
                        <div className="flex items-center space-x-2">
                          <Ruler className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedProperty.totalSqft} Total SqFt</span>
                        </div>
                      )}
                      {selectedProperty.subdivision && (
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedProperty.subdivision}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-accent mb-2">{selectedProperty.price}</h3>
                      <div className="flex items-start space-x-2 text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>{selectedProperty.location}</span>
                      </div>
                      {selectedProperty.mlsNumber && (
                        <p className="text-sm text-muted-foreground mb-4">MLS: {selectedProperty.mlsNumber}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedProperty.description}
                      </p>
                    </div>

                    {selectedProperty.highlights && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProperty.highlights.map((highlight, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                      {selectedProperty.taxes && (
                        <div>
                          <span className="font-medium">Annual Taxes:</span>
                          <p className="text-muted-foreground">{selectedProperty.taxes}</p>
                        </div>
                      )}
                      {selectedProperty.lotSize && (
                        <div>
                          <span className="font-medium">Lot Size:</span>
                          <p className="text-muted-foreground">{selectedProperty.lotSize}</p>
                        </div>
                      )}
                      {selectedProperty.floodZone && (
                        <div>
                          <span className="font-medium">Flood Zone:</span>
                          <p className="text-muted-foreground">{selectedProperty.floodZone}</p>
                        </div>
                      )}
                      {selectedProperty.subdivision && (
                        <div>
                          <span className="font-medium">Subdivision:</span>
                          <p className="text-muted-foreground">{selectedProperty.subdivision}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button className="flex-1 bg-gradient-gold hover:shadow-button">
                        Contact Agent
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Schedule Showing
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Properties;