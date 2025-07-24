import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, Home, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="about" className="relative py-20 bg-gradient-subtle">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1920&q=80)`
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/90"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8">
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
                About Us
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
            >
              Meet The Crawford Team
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              viewport={{ once: true }}
            >
              The Crawford Team is a top-producing real estate team in Tampa Bay. Comprised of fierce females with a shared commitment to educating and empowering our clients, The Crawford Team is powered by Keller Williams St Pete Realty, the top producing real estate brokerage in Pinellas County. Our team consistently performs in the Top 5% of Pinellas County and has helped more than 425 families achieve their real estate goals with closed volume of more than $141 million... and counting!
            </motion.p>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              viewport={{ once: true }}
            >
              Creating A Referable Experience (C.A.R.E.) is our commitment to every client, and it's achieved with the unique systems and processes designed to guide clients through their real estate journey. As a result, we are proud and honored that nearly 90% of our business comes from referrals and repeat clients.
            </motion.p>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              viewport={{ once: true }}
            >
              Each member of The Crawford Team provides her own area of expertise to our clients, whether you are an investor building your portfolio, shopping for your first home, or finally getting that waterfront luxury home of your dreams. We are here to learn more about you and your goals and dreams and to utilize our experience and expertise to develop a strategy, just for you!
            </motion.p>
          </div>

          {/* Team Overview */}
          <div className="text-center mb-16">
          </div>

          {/* Team Members */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Monica Crawford */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-elegant border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/e93072c1-2cf4-49ac-8e59-cfe8cd60fa84.png" 
                        alt="Monica Crawford"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">Monica Crawford</h3>
                    <Badge variant="secondary" className="mb-4">Owner & Lead Listing Agent</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Born and raised in Kentucky, Monica made St. Petersburg her home in 2012. Licensed since 2013, 
                      she's honored to be part of Keller Williams St Pete MarketCenter and consistently ranks in the 
                      Top 100 Agents of Pinellas County.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      With over 425 clients served and $141M+ in volume, Monica's C.A.R.E. approach has earned 95% 
                      referral business, building lasting relationships through exceptional results.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Ashley Eidam */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-elegant border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/1e002cfa-b4a8-4a25-a05e-1590c51406c1.png" 
                        alt="Ashley Eidam"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">Ashley Eidam</h3>
                    <Badge variant="secondary" className="mb-4">Team Coordinator & Realtor</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Brazilian-American from Miami, Ashley brings a vibrant multicultural perspective to real estate. 
                      Fluent in three languages and highly tech-savvy, she uses innovative solutions to streamline 
                      operations and elevate client experiences.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Whether paddleboarding at sunrise or organizing seamless transactions, Ashley delivers 
                      white-glove service with passion for meaningful connections.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Aline Sarria */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-elegant border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/c4bbf418-3d6b-4bb3-a237-32fffd29e34f.png" 
                        alt="Aline Sarria"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">Aline Sarria</h3>
                    <Badge variant="secondary" className="mb-4">Luxury Property Matchmaker</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Specializing in waterfront condos and high-end real estate in downtown St. Petersburg, 
                      Aline brings a visionary approach to luxury properties. Her decades as an educator 
                      help her identify and nurture potential in every property.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Offering multilingual service in English, Spanish, and French, Aline serves global 
                      clientele seeking Florida's Gulf Coast lifestyle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Sabra Charpentier */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-elegant border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/cc60f5df-ced2-4e6a-ad9d-688f36ca956c.png" 
                        alt="Sabra Charpentier"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">Sabra Charpentier</h3>
                    <Badge variant="secondary" className="mb-4">Realtor</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      With 10 years at Keller Williams, Sabra specializes in first-time homebuyers and investors. 
                      As a young property owner herself, she brings real-world investment knowledge to help 
                      clients navigate the market.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      A former athlete, Sabra brings determination, discipline, and teamwork to every client 
                      interaction, combining competitive spirit with emotional intelligence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="text-center p-6 shadow-card hover:shadow-elegant transition-shadow duration-300 border-0">
                    <CardContent className="p-0">
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-gold rounded-full mb-4"
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-8 h-8 text-navy-deep" />
                      </motion.div>
                      <motion.div 
                        className="text-3xl font-bold text-foreground mb-2"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {achievement.number}
                      </motion.div>
                      <div className="font-semibold text-foreground mb-1">
                        {achievement.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.description}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;