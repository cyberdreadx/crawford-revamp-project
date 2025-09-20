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
import { motion } from "framer-motion";

const Services = () => {
  const services = [
    {
      icon: Users,
      title: "Consultation",
      description: "More than property stats, we gain a deep understanding of the clients needs, motivations and goals to develop a game plan specific to each unique client.",
      features: ["Needs Assessment", "Goal Setting", "Custom Strategy", "Personal Game Plan"]
    },
    {
      icon: TrendingUp,
      title: "Performance",
      description: "Whether showing homes to buyers to marketing our listings, we deliver high performance with results to match.",
      features: ["Expert Showings", "Strategic Marketing", "Results-Driven", "Proven Track Record"]
    },
    {
      icon: FileText,
      title: "Advise",
      description: "We advise each client not just through a transaction but through every step of home ownership from worthy property improvements to strategic ways to use their property's equity.",
      features: ["Transaction Guidance", "Property Improvements", "Equity Strategies", "Ongoing Support"]
    },
    {
      icon: Search,
      title: "Connectors",
      description: "We happily connect our clients with our long list of local vetted contractors, service providers, and other affiliates.",
      features: ["Vetted Contractors", "Service Providers", "Local Network", "Trusted Affiliates"]
    },
    {
      icon: Shield,
      title: "Long-Term Support",
      description: "We are your real estate team for life and work hard to nurture our client relationships.",
      features: ["Lifetime Partnership", "Relationship Building", "Ongoing Care", "Always Available"]
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
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                Our Services
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
            >
              Comprehensive Real Estate Services
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              viewport={{ once: true }}
            >
              From buying your first home to building an investment portfolio, 
              we provide expert guidance and support throughout your real estate journey.
            </motion.p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="group p-6 shadow-card hover:shadow-elegant transition-all duration-300 border-0">
                    <CardContent className="p-0">
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-gold rounded-full mb-6"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-8 h-8 text-navy-deep" />
                      </motion.div>
                      
                      <motion.h3 
                        className="text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {service.title}
                      </motion.h3>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <motion.li 
                            key={featureIndex} 
                            className="flex items-center text-sm text-muted-foreground"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + featureIndex * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
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