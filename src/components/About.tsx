import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, Home, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const achievements = [
    {
      icon: Users,
      number: "500+",
      label: "Families Helped",
      description: "Successfully closed transactions"
    },
    {
      icon: TrendingUp,
      number: "$150M+",
      label: "Closed Volume",
      description: "In real estate transactions"
    },
    {
      icon: Award,
      number: "300+",
      label: "Five Star Reviews",
      description: "Client testimonials and referrals"
    },
    {
      icon: Home,
      number: "Top 5%",
      label: "Pinellas County",
      description: "Ranking among all agents"
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
              <Badge variant="outline" className="mb-4 px-4 py-2 bg-seafoam-light/20 text-seafoam-dark border-seafoam-light">
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
              The Crawford Team is a top-producing real estate team in Tampa Bay. Comprised of fierce females with a shared commitment to educating and empowering our clients, The Crawford Team is powered by Keller Williams St Pete Realty, the top producing real estate brokerage in Pinellas County. Our team consistently performs in the Top 5% of Pinellas County and has helped more than 500 families achieve their real estate goals with closed volume of more than $150 million... and counting!
            </motion.p>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              viewport={{ once: true }}
            >
              Creating Authentic Referrable Experiences (C.A.R.E.) is our commitment to every client, and it's achieved with the unique systems and processes designed to guide clients through their real estate journey. As a result, we are proud and honored that nearly 90% of our business comes from referrals and repeat clients.
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

          {/* Team Members - Hero Layout */}
          <div className="space-y-20 mb-16">
            {/* Monica Crawford */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="max-w-lg mx-auto lg:mx-0">
                    <img 
                      src="/lovable-uploads/a3981d27-8283-4f63-bf4a-14cfc1f69f8d.png" 
                      alt="Monica Crawford"
                      className="w-full h-auto object-cover rounded-lg shadow-elegant"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-5xl lg:text-6xl font-bold text-foreground mb-2">Monica Crawford</h3>
                    <Badge variant="outline" className="text-lg px-6 py-2 bg-seafoam-light/20 text-seafoam-dark border-seafoam-light">Owner & Lead Listing Agent</Badge>
                  </div>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      Monica Crawford was born and raised among the beautiful horse farms and Bourbon trails in Kentucky. In 2012, she and her husband, Adam, traded the Bluegrass for the sandy Gulf Beaches and decided to call Gulfport their home.
                    </p>
                    <p>
                      Monica has been a licensed Realtor® since 2013 and is honored to be part of the Keller Williams St Pete MarketCenter; the #1 brokerage in the county. She served as the Lead Buyer's Agent for one of the highest producing teams in Pinellas County before launching The Crawford Team in 2019 and has served on the Agent Leadership Council, as the Chairperson of the KW Luxury Division and is a Certified Keller Williams Instructor.
                    </p>
                    <p>
                      When she isn't selling houses or spending time in nature with her family, Monica helps empower women to live aligned, designed lives through her coaching company Her True North.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Ashley Eidam */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="lg:order-2 relative">
                  <div className="max-w-lg mx-auto lg:mx-0">
                    <img 
                      src="/lovable-uploads/c9f0030f-440e-4f22-be50-e9e50d1e6f87.png" 
                      alt="Ashley Eidam"
                      className="w-full h-auto object-cover rounded-lg shadow-elegant"
                    />
                  </div>
                </div>
                <div className="lg:order-1 space-y-6">
                  <div>
                    <h3 className="text-5xl lg:text-6xl font-bold text-foreground mb-2">Ashley Eidam</h3>
                    <Badge variant="outline" className="text-lg px-6 py-2 bg-seafoam-light/20 text-seafoam-dark border-seafoam-light">Team Coordinator & Realtor</Badge>
                  </div>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      Ashley Eidam is a Brazilian-American, originally from Miami, who brings a vibrant and multicultural perspective to the real estate industry. After relocating to Texas in 2016, she returned to Florida in 2023 to be closer to family and embrace the coastal lifestyle she cherishes.
                    </p>
                    <p>
                      Fluent in three languages and highly tech-savvy, Ashley uses innovative solutions to streamline operations and elevate the client experience, delivering a white-glove level of service.
                    </p>
                    <p>
                      Outside of real estate, Ashley is an avid music lover and adventure enthusiast. Whether she's paddleboarding at sunrise or immersing herself in music festivals, she thrives on building meaningful connections.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Aline Sarria */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="max-w-lg mx-auto lg:mx-0">
                    <img 
                      src="/lovable-uploads/af237420-08c6-4ffc-84bf-7e85f6f3df22.png" 
                      alt="Aline Sarria"
                      className="w-full h-auto object-cover rounded-lg shadow-elegant"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-5xl lg:text-6xl font-bold text-foreground mb-2">Aline Sarria</h3>
                    <Badge variant="outline" className="text-lg px-6 py-2 bg-seafoam-light/20 text-seafoam-dark border-seafoam-light">Luxury Property Matchmaker</Badge>
                  </div>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      Aline Sarria is a dedicated luxury property matchmaker specializing in waterfront condos and high-end real estate in downtown St. Petersburg (DTSP). Known for her ability to uncover the hidden potential in every property, Aline brings a visionary approach to both buying and selling luxury homes.
                    </p>
                    <p>
                      Before launching her real estate career, Aline spent decades as an educator and principal, where she mastered the art of identifying and nurturing human potential. That same talent now drives her success in luxury real estate. Native Spanish speaker and fluent in French, Aline serves a diverse clientele.
                    </p>
                    <p>
                      Now a proud St. Petersburg resident, Aline is passionate about showcasing the city's best properties to local buyers and international investors alike, especially those drawn to Florida's Gulf Coast lifestyle.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sabra Charpentier */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="lg:order-2 relative">
                  <div className="max-w-lg mx-auto lg:mx-0">
                    <img 
                      src="/lovable-uploads/606fc2f7-c96c-420f-b90d-41d5d6c7cdb8.png" 
                      alt="Sabra Charpentier"
                      className="w-full h-auto object-cover rounded-lg shadow-elegant"
                    />
                  </div>
                </div>
                <div className="lg:order-1 space-y-6">
                  <div>
                    <h3 className="text-5xl lg:text-6xl font-bold text-foreground mb-2">Sabra Charpentier</h3>
                    <Badge variant="outline" className="text-lg px-6 py-2 bg-seafoam-light/20 text-seafoam-dark border-seafoam-light">Realtor & Investor Specialist</Badge>
                  </div>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      Sabra Charpentier is a licensed Realtor serving and specializing in St Petersburg, Florida, and has been a licensed Realtor with Keller Williams for a total of 10 years. Throughout those years, Sabra has found her niche with first time home buyers and investors.
                    </p>
                    <p>
                      Sabra is passionate about bringing knowledge and financial literacy into the experience, while connecting them to their dream homes. She brings a unique blend of energy, emotional intelligence, and competitive spirit to the real estate market.
                    </p>
                    <p>
                      As a former athlete, Sabra understands the importance of determination, discipline and teamwork- qualities that apply to every client interaction. Beyond her professional expertise, she is deeply committed to her community.
                    </p>
                  </div>
                </div>
              </div>
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