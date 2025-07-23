import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  TrendingUp, 
  Search, 
  FileText, 
  Calculator, 
  Users,
  Shield,
  Clock,
  Award
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Home,
      title: "Home Buying",
      description: "Expert guidance through every step of the home buying process, from pre-approval to closing.",
      features: ["Market Analysis", "Property Search", "Negotiation Support", "Closing Assistance"]
    },
    {
      icon: TrendingUp,
      title: "Home Selling",
      description: "Strategic marketing and pricing to sell your home quickly and for the best possible price.",
      features: ["Market Valuation", "Professional Photography", "Marketing Strategy", "Buyer Qualification"]
    },
    {
      icon: Search,
      title: "Property Search",
      description: "Access to exclusive listings and off-market properties tailored to your specific needs.",
      features: ["MLS Access", "Off-Market Listings", "Custom Searches", "Property Tours"]
    },
    {
      icon: Calculator,
      title: "Investment Analysis",
      description: "Comprehensive investment property analysis to maximize your real estate portfolio returns.",
      features: ["ROI Analysis", "Market Trends", "Cash Flow Projections", "Property Evaluation"]
    },
    {
      icon: FileText,
      title: "Market Reports",
      description: "Detailed market insights and trends to help you make informed real estate decisions.",
      features: ["Neighborhood Data", "Price Trends", "Market Forecasts", "Comparative Analysis"]
    },
    {
      icon: Shield,
      title: "Transaction Management",
      description: "Complete transaction coordination ensuring smooth closings and protecting your interests.",
      features: ["Contract Review", "Timeline Management", "Vendor Coordination", "Risk Mitigation"]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "We're here when you need us, ensuring you never miss an opportunity."
    },
    {
      icon: Users,
      title: "Team Approach",
      description: "Multiple experts working together to provide comprehensive service."
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Track record of successful transactions and satisfied clients."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              Our Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Comprehensive Real Estate Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From buying your first home to building an investment portfolio, 
              we provide expert guidance and support throughout your real estate journey.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="group p-6 shadow-card hover:shadow-elegant transition-all duration-300 border-0 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-gold rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-navy-deep" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Benefits Section */}
          <div className="border-t border-border pt-16">
            <h3 className="text-2xl md:text-3xl font-semibold text-center text-foreground mb-12">
              Why Choose The Crawford Team?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;