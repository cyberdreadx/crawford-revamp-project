import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Star, Facebook, Instagram, Linkedin, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  title?: string;
  company?: string;
  content: string;
  rating?: number;
  image_url?: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Contact = () => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyType: ""
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order')
        .limit(3);

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          property_type: formData.propertyType,
          message: formData.message,
        });

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          propertyType: formData.propertyType,
          message: formData.message,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Continue even if email fails - data is saved
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        propertyType: ""
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const contactInfo = [{
    icon: Phone,
    title: "Call or Text Us",
    value: "(727) 599-1944",
    href: "tel:727-599-1944",
    description: "Call or text for assistance"
  }, {
    icon: Mail,
    title: "Email Us",
    value: "hello@yourcrawfordteam.com",
    href: "mailto:hello@yourcrawfordteam.com",
    description: "Send us a message anytime"
  }, {
    icon: MapPin,
    title: "Office Location",
    value: "360 Central Ave St. 600, St. Petersburg, FL 33701",
    href: "https://maps.google.com/?q=360+Central+Ave+St+600+St+Petersburg+FL+33701",
    description: "Visit us at our downtown office"
  }, {
    icon: Clock,
    title: "Office Hours",
    value: "Monday-Friday 9am-5pm",
    href: "#",
    description: "Weekend by appointment"
  }];
  const socialMedia = [{
    icon: Facebook,
    href: "#",
    label: "Facebook"
  }, {
    icon: Instagram,
    href: "#",
    label: "Instagram"
  }, {
    icon: Linkedin,
    href: "#",
    label: "LinkedIn"
  }];

  const teamMembers = [
    {
      name: "Aline",
      calendlyUrl: "https://calendly.com/aline-yourcrawfordteam/30min",
      description: "Senior Real Estate Specialist"
    },
    {
      name: "Monica", 
      calendlyUrl: "https://calendly.com/monica-yourcrawfordteam/30min",
      description: "Luxury Property Expert"
    },
    {
      name: "Sabra",
      calendlyUrl: "https://calendly.com/sabra-ssgroup/30min", 
      description: "Investment Property Consultant"
    },
    {
      name: "Ashley",
      calendlyUrl: "https://calendly.com/ash-eidam/30-minute-general-real-estate-consultation",
      description: "General Real Estate Advisor"
    }
  ];
  return <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div initial={{
            opacity: 0,
            x: 50
          }} whileInView={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.1,
            duration: 0.8
          }} viewport={{
            once: true
          }}>
              <Badge variant="secondary" className="mb-4 px-4 py-2 bg-[#7bbcb0]">
                Contact Us
              </Badge>
            </motion.div>
            <motion.h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6" initial={{
            opacity: 0,
            scale: 0.8
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.3,
            duration: 1,
            type: "spring",
            stiffness: 100
          }} viewport={{
            once: true
          }}>
              Ready to Get Started?
            </motion.h2>
            <motion.p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed" initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5,
            duration: 1
          }} viewport={{
            once: true
          }}>
              Let's discuss your real estate goals. Whether you're buying, selling, or investing, 
              we're here to provide expert guidance every step of the way.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div initial={{
              opacity: 0,
              x: -50
            }} whileInView={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.8,
              delay: 0.2
            }} viewport={{
              once: true
            }}>
                <Card className="shadow-elegant border-0">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-gold rounded-full">
                      <MessageSquare className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">Send us a message</h3>
                      <p className="text-muted-foreground">We'll get back to you soon</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Smith" required className="border-border focus:border-accent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required className="border-border focus:border-accent" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number
                        </label>
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(727) 555-0123" className="border-border focus:border-accent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          I'm interested in...
                        </label>
                        <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:border-accent bg-background">
                          <option value="">Select an option</option>
                          <option value="buying">Buying a home</option>
                          <option value="selling">Selling my home</option>
                          <option value="investing">Investment properties</option>
                          <option value="renting">Rental properties</option>
                          <option value="consultation">Free consultation</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Message *
                      </label>
                      <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your real estate needs, timeline, budget, or any questions you have..." rows={4} required className="border-border focus:border-accent resize-none" />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-gradient-gold hover:shadow-button transition-all duration-200">
                      Send Message
                      <Send className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
              </motion.div>

              {/* Trust Indicators - Moved under Send Message */}
              {testimonials.length > 0 && (
                <motion.div initial={{
                opacity: 0,
                y: 30
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.8,
                delay: 0.8
              }} viewport={{
                once: true
              }}>
                  <div className="mt-6 space-y-4">
                    <h4 className="text-lg font-semibold text-foreground text-center mb-4">
                      What Our Clients Say
                    </h4>
                    <div className="grid gap-4">
                      {testimonials.map((testimonial, index) => (
                        <Card key={testimonial.id} className="p-4 shadow-card border-0 bg-gradient-subtle">
                          <CardContent className="p-0">
                            <div className="text-center">
                              <div className="flex justify-center items-center space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${
                                      i < (testimonial.rating || 5)
                                        ? 'fill-gold-warm text-gold-warm'
                                        : 'text-muted-foreground/30'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 italic">
                                "{testimonial.content}"
                              </p>
                              <p className="text-xs text-muted-foreground font-medium">
                                - {testimonial.name}
                                {testimonial.title && `, ${testimonial.title}`}
                                {testimonial.company && ` at ${testimonial.company}`}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Schedule a Consultation */}
              <motion.div 
                id="schedule-consultation"
                initial={{
                opacity: 0,
                y: 30
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.8,
                delay: 1.0
              }} viewport={{
                once: true
              }}>
                <div className="mt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-gold rounded-full">
                      <Calendar className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-foreground">Schedule a Consultation</h4>
                      <p className="text-muted-foreground">Book a 30-minute call with our team</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {teamMembers.map((member, index) => (
                      <Card key={member.name} className="p-4 shadow-card border-0 bg-gradient-subtle hover:shadow-elegant transition-all duration-300">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-accent/10 rounded-full">
                                <Users className="w-5 h-5 text-accent" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-foreground">{member.name}</h5>
                                <p className="text-sm text-muted-foreground">{member.description}</p>
                              </div>
                            </div>
                            <Button 
                              asChild
                              size="sm"
                              className="bg-gradient-gold hover:shadow-button transition-all duration-200"
                            >
                              <a 
                                href={member.calendlyUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2"
                              >
                                <Calendar className="w-4 h-4" />
                                <span>Book Now</span>
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return <motion.div key={index} initial={{
                opacity: 0,
                x: 50
              }} whileInView={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.6,
                delay: 0.3 + index * 0.1
              }} viewport={{
                once: true
              }} whileHover={{
                scale: 1.02
              }}>
                     <Card className="p-6 shadow-card hover:shadow-elegant transition-shadow duration-300 border-0">
                     <CardContent className="p-0">
                       <div className="flex items-start space-x-4">
                         <div className="p-3 bg-accent/10 rounded-full flex-shrink-0">
                           <Icon className="w-6 h-6 text-accent" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-foreground mb-2">
                             {info.title}
                           </h4>
                           {info.href.startsWith('tel:') || info.href.startsWith('mailto:') ? <a href={info.href} className="text-foreground hover:text-accent transition-colors font-medium text-sm block">
                               {info.value}
                             </a> : info.href.startsWith('https://maps') ? <a href={info.href} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors font-medium block">
                               {info.value}
                             </a> : <p className="text-foreground font-medium">{info.value}</p>}
                           <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                             {info.description}
                           </p>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                  </motion.div>;
            })}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;