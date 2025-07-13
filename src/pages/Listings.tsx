import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bed, Bath, Square, MapPin, ArrowRight, Home, Calendar, Ruler, Building } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Listings = () => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // All Crawford Team properties - Actual MLS Listings
  const allProperties = [
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
      mlsNumber: "TB8402799",
      title: "Updated Duplex Rental",
      location: "7116/7120 Oakwood Dr, New Port Richey, FL 34652",
      price: "$1,400/mo",
      beds: 2,
      baths: 1,
      sqft: "825",
      yearBuilt: "1981",
      status: "For Rent",
      description: "Now leasing a beautifully updated 2-bedroom, 1-bathroom duplex in the heart of New Port Richey! Modern kitchen with soft-close cabinets, granite countertops, and fresh interior paint.",
      highlights: ["Modern Kitchen", "Granite Counters", "Pet Friendly", "Near Downtown"],
      subdivision: "Gulf Coast Estates",
      lotSize: "6,795 SqFt"
    },
    {
      id: 3,
      mlsNumber: "TB8398548",
      title: "Furnished Rainbow Lakes Rental",
      location: "21078 SW Honeysuckle St, Dunnellon, FL 34431",
      price: "$1,750/mo",
      beds: 3,
      baths: 2,
      sqft: "1,395",
      yearBuilt: "1969",
      status: "For Rent",
      description: "Charming Mid-Century Gem in Rainbow Lakes Estates – Fully Furnished & Move-In Ready! Perfect turnkey seasonal retreat or investment property.",
      highlights: ["Fully Furnished", "2-Car Garage", "Fireplace", "Near Rainbow Springs"],
      subdivision: "Rainbow Lakes Estate",
      lotSize: "10,454 SqFt"
    },
    {
      id: 4,
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
    },
    {
      id: 5,
      mlsNumber: "TB8393518",
      title: "Charming Gulfport Duplex",
      location: "2808 56th St S, Gulfport, FL 33707",
      price: "$2,100/mo",
      beds: 2,
      baths: 1,
      sqft: "850",
      yearBuilt: "1928",
      status: "For Rent",
      description: "Charming Gulfport rental available now! This 2BR/1BA unit in a 1928 duplex offers approx. 850 sq ft with a split bedroom layout, ceiling fans, and a welcoming front porch.",
      highlights: ["Historic Duplex", "Front Porch", "Pet Friendly", "Near Waterfront"],
      subdivision: "Boca Ceiga Park",
      lotSize: "5,131 SqFt"
    },
    {
      id: 6,
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
      id: 7,
      mlsNumber: "TB8335470",
      title: "Double Lot Investment Opportunity",
      location: "3102 57th St S, Gulfport, FL 33707",
      price: "$500,000",
      beds: 3,
      baths: 2,
      sqft: "1,495",
      totalSqft: "1,905",
      yearBuilt: "1949",
      status: "Active",
      floodZone: "AE",
      description: "INVESTORS, BUILDERS, DREAMERS.... This is the OPPORTUNITY you've been waiting for! A DOUBLE LOT in the HEART OF GULFPORT! The existing structure was flooded during Hurricane Helene and needs to be removed.",
      highlights: ["Double Lot", "Development Opportunity", "Heart of Gulfport", "Multiple Permitted Uses"],
      subdivision: "Boca Ceiga Park",
      taxes: "$10,583",
      lotSize: "9,000 SqFt"
    },
    {
      id: 8,
      mlsNumber: "TB8392182",
      title: "West Shore Village Villa",
      location: "3146 37th Ln S #A, St. Petersburg, FL 33711",
      price: "$270,000",
      beds: 2,
      baths: 2,
      sqft: "1,100",
      totalSqft: "1,100",
      yearBuilt: "1983",
      status: "Active",
      floodZone: "X",
      description: "Welcome to West Shore Village — where comfort meets convenience in a vibrant, resort-style gated community for all ages! This single-story, villa-style condo with a private garage has been extensively upgraded.",
      highlights: ["$40K Recent Upgrades", "Gated Community", "Private Garage", "Resort Amenities"],
      subdivision: "West Shore Village Six",
      taxes: "$3,923",
      condoFee: "$857/month"
    },
    {
      id: 9,
      mlsNumber: "TB8392451",
      title: "Gulf Coast Estates Duplex",
      location: "7116/7120 Oakwood Dr, New Port Richey, FL 34652",
      price: "$315,000",
      beds: 4,
      baths: 2,
      sqft: "1,650",
      yearBuilt: "1981",
      status: "Active",
      description: "Welcome to your Gulf Coast Estates investment! Turnkey and cash-flow ready, this updated duplex offers an exceptional opportunity for investors or house-hackers seeking a low-maintenance, income-generating asset.",
      highlights: ["Turnkey Investment", "Updated Units", "Strong Rental Demand", "Low Maintenance"],
      subdivision: "Gulf Coast Estates",
      taxes: "$5,408",
      grossIncome: "$22,835/year"
    },
    {
      id: 10,
      mlsNumber: "TB8391755",
      title: "Custom Brookwood Home",
      location: "941 65th St S, St. Petersburg, FL 33707",
      price: "$465,000",
      beds: 3,
      baths: 2,
      sqft: "1,670",
      totalSqft: "1,864",
      yearBuilt: "1952",
      status: "Active",
      floodZone: "X",
      description: "Live the Florida lifestyle in this beautifully maintained 3-bedroom, 2-bath home ideally situated just minutes from the vibrant Gulfport Arts District, the sandy Gulf Beaches, and only 15 minutes to downtown St. Petersburg.",
      highlights: ["Custom Built", "RV Parking", "Tropical Backyard", "Impact Windows"],
      subdivision: "Brookwood Sub",
      taxes: "$2,493",
      lotSize: "4,800 SqFt"
    },
    {
      id: 11,
      mlsNumber: "TB8389837",
      title: "Gulfport Entertainer's Dream",
      location: "6114 7th Ave S, Gulfport, FL 33707",
      price: "$699,999",
      beds: 4,
      baths: 2,
      sqft: "2,004",
      totalSqft: "2,577",
      yearBuilt: "1957",
      status: "Active",
      floodZone: "X",
      description: "NEW PRICE ~ NEW ROOF ~ NEW HVAC ~ Schedule your showing for this Gulfport Gem TODAY! Tucked into Gulfport's desirable Stetson neighborhood, this deceptively spacious 4-bedroom, 2-bath home offers over 2,000 sq ft of character.",
      highlights: ["New Roof & HVAC 2025", "Hardwood Floors", "Gas Fireplace", "2-Car Garage"],
      subdivision: "Pasadena Estates Sec C",
      taxes: "$2,903",
      lotSize: "7,619 SqFt"
    },
    {
      id: 12,
      mlsNumber: "TB8392174",
      title: "West Shore Village Corner Unit",
      location: "3268 39th St S #A, St. Petersburg, FL 33711",
      price: "$265,000",
      beds: 2,
      baths: 2,
      sqft: "1,175",
      totalSqft: "1,175",
      yearBuilt: "1973",
      status: "Active",
      floodZone: "X",
      description: "Welcome to Your Slice of Paradise in West Shore Village! Experience the perfect combination of privacy, comfort, and resort-style living in this beautifully maintained single-story, villa-style condo.",
      highlights: ["Corner Unit", "Fully Furnished", "New Roof 2024", "Nature Preserve Access"],
      subdivision: "West Shore Village One",
      taxes: "$3,366",
      condoFee: "$901/month"
    },
    {
      id: 13,
      mlsNumber: "TB8389569",
      title: "Bermuda Bay Beach Condo",
      location: "3595 41st Ln S #L, St. Petersburg, FL 33711",
      price: "$225,000",
      beds: 2,
      baths: 2,
      sqft: "1,100",
      totalSqft: "1,100",
      yearBuilt: "1974",
      status: "Active",
      floodZone: "AE",
      description: "Move-in Ready | Clean, Bright, & Full of Coastal Charm. Located on the second floor of a two-story building, this home offers a spacious open-concept layout filled with natural light.",
      highlights: ["Private Beach Access", "Resort Amenities", "2 Heated Pools", "Boat Ramp"],
      subdivision: "Bermuda Bay Beach Condo",
      taxes: "$4,489",
      condoFee: "$906/month"
    },
    {
      id: 14,
      mlsNumber: "TB8386163",
      title: "Waterfront Renovation Opportunity",
      location: "328 Tallahassee Dr NE, St. Petersburg, FL 33702",
      price: "$270,000",
      beds: 3,
      baths: 2,
      sqft: "1,329",
      totalSqft: "2,146",
      yearBuilt: "1962",
      status: "Active",
      floodZone: "AE",
      description: "Waterfront Opportunity – Gutted and Ready for Your Vision! This 3 bed, 2 bath block home with a 1-car garage sits directly on a serene pond in the highly desirable Sun-Lit Shores neighborhood.",
      highlights: ["Waterfront on Pond", "Gutted to Studs", "1-Car Garage", "Investment Potential"],
      subdivision: "Sun-Lit Shores",
      taxes: "$2,211",
      lotSize: "9,540 SqFt"
    },
    {
      id: 15,
      mlsNumber: "TB8375466",
      title: "Custom Home on 17th Green",
      location: "2613 59th St S, Gulfport, FL 33707",
      price: "$1,100,000",
      beds: 3,
      baths: 3,
      sqft: "2,270",
      totalSqft: "4,522",
      yearBuilt: "1992",
      status: "Active",
      floodZone: "AE",
      description: "One-of-a-Kind Custom Home on the 17th Green of Pasadena Yacht & Country Club. Custom-built in 1992 by its original builder-owner and packed with thoughtful upgrades and luxurious features.",
      highlights: ["Golf Course Views", "Paid Solar Panels", "3 Elevated Decks", "2024 Generator"],
      subdivision: "Villa De Maria",
      taxes: "$7,749",
      lotSize: "11,800 SqFt"
    },
    {
      id: 16,
      mlsNumber: "TB8371394",
      title: "Broadwater Waterfront Estate",
      location: "4490 38th Way S, St. Petersburg, FL 33711",
      price: "$1,295,000",
      beds: 3,
      baths: 2,
      sqft: "2,382",
      totalSqft: "2,382",
      yearBuilt: "1970",
      status: "Active",
      floodZone: "A",
      description: "Welcome to waterfront living at its finest in Broadwater - St Pete's highest elevated waterfront community! NO FLOODING - NO DAMAGE from the 2024 hurricane season!",
      highlights: ["Direct Gulf Access", "30' Dock", "Private Pool", "No Hurricane Damage"],
      subdivision: "Broadwater Unit 2",
      taxes: "$21,546",
      lotSize: "10,010 SqFt"
    },
    {
      id: 17,
      mlsNumber: "TB8366072",
      title: "Bayway Isles Water View Condo",
      location: "5220 Brittany Dr S #210, St. Petersburg, FL 33715",
      price: "$235,000",
      beds: 2,
      baths: 2,
      sqft: "1,175",
      totalSqft: "1,175",
      yearBuilt: "1972",
      status: "Active",
      floodZone: "AE",
      description: "CORNER UNIT WITH WATER VIEWS + DEEDED PARKING! Rarely available corner unit with sparkling water views and a deeded parking spot. Welcome to Point Brittany, a vibrant 55+ resort-style community.",
      highlights: ["Corner Unit", "Water Views", "55+ Community", "4 Heated Pools"],
      subdivision: "Bayway Isles Point Brittany Five",
      taxes: "$1,129",
      hoaFee: "$1,037/month"
    },
    {
      id: 18,
      mlsNumber: "TB8360681",
      title: "Furnished Gulfport Bungalow",
      location: "2808 Clinton St S, Gulfport, FL 33707",
      price: "$2,200/mo",
      beds: 2,
      baths: 1,
      sqft: "840",
      yearBuilt: "1948",
      status: "For Rent",
      description: "Escape to this bright and fully furnished 2BR/1BA bungalow in the heart of Gulfport! Just steps from the beach and a short walk to top local spots like Pia's, Tommy's Hideaway, and North End Taphouse.",
      highlights: ["Fully Furnished", "Steps to Beach", "Private Herb Garden", "Includes Internet"],
      subdivision: "Boca Ceiga Park",
      lotSize: "4,500 SqFt"
    },
    {
      id: 19,
      mlsNumber: "TB8311921",
      title: "Town Shores 55+ Condo",
      location: "2960 59th St S #509, Gulfport, FL 33707",
      price: "$165,000",
      beds: 1,
      baths: 1,
      sqft: "815",
      totalSqft: "815",
      yearBuilt: "1973",
      status: "Active",
      floodZone: "AE",
      description: "Come Live Your Best Chapter at Town Shores, an active, 55+ condo community in the waterfront town of Gulfport. Move-in ready environment, pool views and a covered parking spot.",
      highlights: ["55+ Community", "4 Heated Pools", "Marina Views", "Covered Parking"],
      subdivision: "Town Shores of Gulfport",
      taxes: "$819",
      condoFee: "$671/month"
    }
  ];

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (visibleCount < allProperties.length && !isLoading) {
          setIsLoading(true);
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + 6, allProperties.length));
            setIsLoading(false);
          }, 800);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, allProperties.length, isLoading]);

  const visibleProperties = allProperties.slice(0, visibleCount);

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
              {visibleProperties.map((property) => (
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
                        property.status === 'For Rent' 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : property.status === 'Active'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-orange-500 hover:bg-orange-600'
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

                    {/* Additional Property Info */}
                    <div className="text-xs text-muted-foreground mb-3 space-y-1">
                      {property.mlsNumber && <div>MLS: {property.mlsNumber}</div>}
                      {property.yearBuilt && <div>Built: {property.yearBuilt}</div>}
                      {property.subdivision && <div>Subdivision: {property.subdivision}</div>}
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
                      onClick={() => setSelectedProperty(property)}
                    >
                      View Details
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gradient-gold transition ease-in-out duration-150">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading more properties...
                </div>
              </div>
            )}

            {/* End of results indicator */}
            {visibleCount >= allProperties.length && !isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You've viewed all {allProperties.length} properties</p>
              </div>
            )}

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
                    {selectedProperty.condoFee && (
                      <div>
                        <span className="font-medium">Condo Fee:</span>
                        <p className="text-muted-foreground">{selectedProperty.condoFee}</p>
                      </div>
                    )}
                    {selectedProperty.hoaFee && (
                      <div>
                        <span className="font-medium">HOA Fee:</span>
                        <p className="text-muted-foreground">{selectedProperty.hoaFee}</p>
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
                    {selectedProperty.grossIncome && (
                      <div>
                        <span className="font-medium">Gross Income:</span>
                        <p className="text-muted-foreground">{selectedProperty.grossIncome}</p>
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

      <Footer />
    </div>
  );
};

export default Listings;