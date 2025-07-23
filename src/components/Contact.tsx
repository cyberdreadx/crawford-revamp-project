import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Star
} from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyType: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", message: "", propertyType: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      value: "(727) 599-1944",
      href: "tel:727-599-1944",
      description: "Available 24/7 for urgent inquiries"
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "hello@yourcrawfordteam.com",
      href: "mailto:hello@yourcrawfordteam.com",
      description: "We respond within 2 hours"
    },
    {
      icon: MapPin,
      title: "Office Location",
      value: "St. Petersburg, FL",
      href: "#",
      description: "Serving the entire Tampa Bay area"
    },
    {
      icon: Clock,
      title: "Office Hours",
      value: "Mon - Sun: 8AM - 8PM",
      href: "#",
      description: "Extended hours for your convenience"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              Contact Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Let's discuss your real estate goals. Whether you're buying, selling, or investing, 
              we're here to provide expert guidance every step of the way.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-elegant border-0">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-gold rounded-full">
                      <MessageSquare className="w-6 h-6 text-navy-deep" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">Send us a message</h3>
                      <p className="text-muted-foreground">We'll get back to you within 24 hours</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          required
                          className="border-border focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                          className="border-border focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(727) 555-0123"
                          className="border-border focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          I'm interested in...
                        </label>
                        <select
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:border-accent bg-background"
                        >
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
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your real estate needs, timeline, budget, or any questions you have..."
                        rows={4}
                        required
                        className="border-border focus:border-accent resize-none"
                      />
                    </div>

                    <Button 
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-gold hover:shadow-button transition-all duration-200"
                    >
                      Send Message
                      <Send className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card key={index} className="p-6 shadow-card hover:shadow-elegant transition-shadow duration-300 border-0">
                    <CardContent className="p-0">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-accent/10 rounded-full flex-shrink-0">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            {info.title}
                          </h4>
                          {info.href.startsWith('tel:') || info.href.startsWith('mailto:') ? (
                            <a 
                              href={info.href}
                              className="text-foreground hover:text-accent transition-colors font-medium"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-foreground font-medium">{info.value}</p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Trust Indicators */}
              <Card className="p-6 shadow-card border-0 bg-gradient-subtle">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="flex justify-center items-center space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-gold-warm text-gold-warm" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      "Exceptional service and expertise. The Crawford Team made our home buying experience seamless and stress-free."
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      - Sarah & Mike Johnson
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;