import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, TrendingUp, Camera, Users, FileCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const SellerGuide = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would integrate with your email service or CRM
    console.log("Seller guide request:", formData);
    
    toast({
      title: "Success!",
      description: "Your Seller's Guide is on its way to your inbox.",
    });
    
    setSubmitted(true);
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Maximize Your Sale Price",
      description: "Learn proven strategies to increase your home's value and attract premium offers"
    },
    {
      icon: Camera,
      title: "Property Preparation",
      description: "Discover staging secrets and home improvements that deliver the best ROI"
    },
    {
      icon: Users,
      title: "Marketing That Works",
      description: "Our luxury marketing strategy reaches qualified buyers across multiple channels"
    },
    {
      icon: FileCheck,
      title: "Smooth Transaction Process",
      description: "Navigate inspections, negotiations, and closing with confidence"
    }
  ];

  return (
    <div className="pt-[64px]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-coral-light/20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              St. Pete Seller's Guide
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sell your property for top dollar with our proven system. 
              Get expert advice on pricing, preparation, and marketing from agents who consistently deliver results.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Benefits Column */}
            <div>
              <h2 className="text-3xl font-bold mb-8">What's Inside</h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-l-4 border-coral-accent">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="bg-coral-accent/10 p-3 rounded-lg">
                          <benefit.icon className="w-6 h-6 text-coral-accent" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{benefit.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {benefit.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Stats Card */}
              <Card className="mt-8 bg-coral-accent/5">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold text-coral-accent">$150M+</p>
                      <p className="text-sm text-muted-foreground mt-1">Closed Volume</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-coral-accent">500+</p>
                      <p className="text-sm text-muted-foreground mt-1">Homes Sold</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial */}
              <Card className="mt-6 bg-coral-accent/5">
                <CardContent className="pt-6">
                  <p className="italic text-foreground/80 mb-4">
                    "The Crawford Team's marketing strategy got us multiple offers over asking price. 
                    Their Seller's Guide prepared us perfectly!"
                  </p>
                  <p className="font-semibold">— Michael & Jennifer T., Clearwater</p>
                </CardContent>
              </Card>
            </div>

            {/* Form Column */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {submitted ? "Check Your Email!" : "Get Your Free Guide"}
                  </CardTitle>
                  <CardDescription>
                    {submitted 
                      ? "We've sent the Seller's Guide to your email. Don't forget to check your spam folder!"
                      : "Enter your information below to receive your complimentary Seller's Guide"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-coral-accent hover:bg-coral-accent/90 text-white"
                        size="lg"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Free Guide
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting, you agree to receive emails from The Crawford Team. 
                        We respect your privacy and you can unsubscribe anytime.
                      </p>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <CheckCircle2 className="w-20 h-20 text-coral-accent" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-center">
                          Want a personalized home valuation? Schedule a consultation with our team.
                        </p>
                        <Button 
                          className="w-full bg-coral-accent hover:bg-coral-accent/90 text-white"
                          size="lg"
                          asChild
                        >
                          <a href="https://calendly.com/yourcrawfordteam/30min" target="_blank" rel="noopener noreferrer">
                            Book Consultation
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SellerGuide;
