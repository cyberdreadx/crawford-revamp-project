import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, Home, TrendingUp } from "lucide-react";

const About = () => {
  const achievements = [
    {
      icon: Home,
      number: "500+",
      label: "Homes Sold",
      description: "Successfully closed transactions"
    },
    {
      icon: Users,
      number: "15+",
      label: "Years Experience",
      description: "Serving the Tampa Bay area"
    },
    {
      icon: TrendingUp,
      number: "$50M+",
      label: "Sales Volume",
      description: "In real estate transactions"
    },
    {
      icon: Award,
      number: "98%",
      label: "Client Satisfaction",
      description: "Five-star reviews and referrals"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              About Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet The{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Crawford Team
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're not just real estate agents – we're your neighbors, your advocates, 
              and your partners in making your real estate dreams a reality.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Text Content */}
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
                Your Trusted Real Estate Partners in St. Petersburg
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                With over 15 years of combined experience in the Tampa Bay real estate market, 
                The Crawford Team brings unparalleled expertise and dedication to every transaction. 
                We understand that buying or selling a home is one of life's most significant decisions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our approach combines cutting-edge market analysis with personalized service, 
                ensuring you make informed decisions every step of the way. From first-time homebuyers 
                to luxury property investors, we tailor our services to meet your unique needs.
              </p>
              
              {/* Key Points */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-foreground font-medium">Local Market Expertise</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-foreground font-medium">Personalized Service Approach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-foreground font-medium">Full-Service Support Team</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-foreground font-medium">Proven Track Record</span>
                </div>
              </div>
            </div>

            {/* Team Image Placeholder */}
            <div className="relative">
              <Card className="shadow-elegant border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-gradient-hero flex items-center justify-center">
                    <div className="text-center text-white">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">Professional Team Photo</p>
                      <p className="text-sm opacity-80">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
            </div>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="text-center p-6 shadow-card hover:shadow-elegant transition-shadow duration-300 border-0">
                  <CardContent className="p-0">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-gold rounded-full mb-4">
                      <Icon className="w-8 h-8 text-navy-deep" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {achievement.number}
                    </div>
                    <div className="font-semibold text-foreground mb-1">
                      {achievement.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;