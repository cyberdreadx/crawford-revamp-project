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
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/e93072c1-2cf4-49ac-8e59-cfe8cd60fa84.png" 
                        alt="Monica Crawford"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-2">Monica Crawford</h3>
                    <Badge variant="secondary" className="mb-4">Owner & Lead Listing Agent</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Monica Crawford was born and raised among the beautiful horse farms and Bourbon trails in Kentucky. In 2012, she and her husband, Adam, traded the Bluegrass for the sandy Gulf beaches and decided to call Gulfport their home. Along with their two children, Leeland and Willa, they love to spend time playing outside at the various parks and beaches and taking family road trips to visit National Parks.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Monica has been a licensed Realtor® since 2013 and is honored to be part of the Keller Williams St Pete MarketCenter; the #1 brokerage in the county. She served as the Lead Buyer's Agent for one of the highest producing teams in Pinellas County before launching The Crawford Team in 2019. You will find Monica's name consistently in the Top 100 Agents of Pinellas County and her team is in the Top 5% of the Keller Williams St Pete brokerage.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Since 2013, Monica and her teammates have helped more than 425 clients achieve their real estate goals and have closed over $141 Million in volume. She is most proud of the fact that nearly 95% of her team's business comes from referrals and repeat clients and she credits this achievement with her C.A.R.E. approach; Creating A Referable Experience.
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/1e002cfa-b4a8-4a25-a05e-1590c51406c1.png" 
                        alt="Ashley Eidam"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-2">Ashley Eidam</h3>
                    <Badge variant="secondary" className="mb-4">Team Coordinator & Realtor</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Ashley Eidam is a Brazilian-American, originally from Miami, who brings a vibrant and multicultural perspective to the real estate industry. After relocating to Texas in 2016, she returned to Florida in 2023 to be closer to family and embrace the coastal lifestyle she cherishes. As the Team Coordinator at The Crawford Team, Ashley combines her expertise in real estate and property management with a deep passion for organization and client success.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Fluent in three languages and highly tech-savvy, Ashley uses innovative solutions to streamline operations and elevate the client experience, delivering a white-glove level of service.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Outside of real estate, Ashley is an avid music lover and adventure enthusiast. Whether she's paddleboarding at sunrise or immersing herself in music festivals, she thrives on building meaningful connections and making every experience seamless and enjoyable for those she works with.
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/c4bbf418-3d6b-4bb3-a237-32fffd29e34f.png" 
                        alt="Aline Sarria"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-2">Aline Sarria</h3>
                    <Badge variant="secondary" className="mb-4">Luxury Property Matchmaker</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Aline Sarria is a dedicated luxury property matchmaker specializing in waterfront condos and high-end real estate in downtown St. Petersburg (DTSP). Known for her ability to uncover the hidden potential in every property, Aline brings a visionary approach to both buying and selling luxury homes. Whether it's a sleek penthouse overlooking Tampa Bay or a modern retreat near the vibrant arts district, she helps clients discover properties that align with their dreams and elevate their investment portfolios.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Before launching her real estate career, Aline spent decades as an educator and principal, where she mastered the art of identifying and nurturing human potential. That same talent now drives her success in luxury real estate, where she transforms overlooked spaces into valuable assets and curates personalized experiences for her clients.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Now a proud St. Petersburg resident, Aline is passionate about showcasing the city's best properties to local buyers and international investors alike, especially those drawn to Florida's Gulf Coast lifestyle. She offers multilingual service in English, Spanish, and French, ensuring seamless communication for global clientele.
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                  <div className="flex-shrink-0 self-center sm:self-start">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                      <img 
                        src="/lovable-uploads/cc60f5df-ced2-4e6a-ad9d-688f36ca956c.png" 
                        alt="Sabra Charpentier"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-2">Sabra Charpentier</h3>
                    <Badge variant="secondary" className="mb-4">Realtor</Badge>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Sabra Charpentier is a licensed Realtor serving and specializing in St Petersburg, Florida, and has been a licensed Realtor with Keller Williams for a total of 10 years. Throughout those years, Sabra has found her niche with first time home buyers and investors. She currently owns multiple properties that were acquired at a young age, and uses the knowledge from those experiences to help investors navigate the market.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                      Sabra is passionate about bringing knowledge and financial literacy into the experience, while connecting them to their dream homes. She brings a unique blend of energy, emotional intelligence, and competitive spirit to the real estate market.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      As a former athlete, Sabra understands the importance of determination, discipline and teamwork- qualities that apply to every client interaction. Beyond her professional expertise, she is deeply committed to her community, whether it's through local Chamber of Commerce events or team activities.
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