import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ClipboardList, TrendingUp, Camera, Users, FileCheck, DollarSign, Home } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const SellerGuide = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyTypes: [] as string[],
    propertyOther: "",
    city: "",
    address: "",
    estimatedValue: "",
    timeline: "",
    contactPreference: [] as string[],
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

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field as keyof typeof prev] as string[];
      const isChecked = currentValues.includes(value);
      return {
        ...prev,
        [field]: isChecked 
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const handleRadioChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const steps = [
    {
      icon: TrendingUp,
      title: "Maximize Your Sale Price",
      description: "Learn proven strategies to increase your home's value and attract premium offers",
      details: "Discover data-driven pricing strategies and home improvements that deliver the best ROI"
    },
    {
      icon: Camera,
      title: "Property Preparation",
      description: "Discover staging secrets and home improvements that deliver the best ROI",
      details: "Professional staging tips and renovation priorities that increase buyer interest"
    },
    {
      icon: Users,
      title: "Marketing That Works",
      description: "Our luxury marketing strategy reaches qualified buyers across multiple channels",
      details: "Multi-channel marketing approach including digital advertising, social media, and luxury networks"
    },
    {
      icon: FileCheck,
      title: "Smooth Transaction Process",
      description: "Navigate inspections, negotiations, and closing with confidence",
      details: "Step-by-step guidance through inspections, negotiations, and closing procedures"
    }
  ];

  return (
    <div className="pt-[64px]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-coral-light/20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-coral-accent/10 text-coral-accent px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ⏰ Limited Time Offer
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Get Your FREE Seller's Guide
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Discover the proven strategies that helped our clients sell for <span className="text-coral-accent font-bold">$150M+ in total volume</span>
            </p>
            <p className="text-lg text-muted-foreground">
              📧 Instant delivery • 📊 Complete the quick survey to unlock
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Preview Column */}
            <div>
              <h2 className="text-3xl font-bold mb-4">What You'll Learn</h2>
              <p className="text-muted-foreground mb-8">
                Here's a preview of what's inside your FREE Seller's Guide:
              </p>
              
              {/* Preview - Show first 3 steps */}
              <div className="space-y-6 mb-6">
                {steps.slice(0, 3).map((step, index) => (
                  <Card key={index} className="border-l-4 border-coral-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-coral-accent/10 p-3 rounded-lg flex-shrink-0">
                          <step.icon className="w-6 h-6 text-coral-accent" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{step.description}</p>
                          <p className="text-sm text-foreground/70">{step.details}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Blurred remaining steps with overlay */}
              <div className="relative">
                <div className="space-y-6 blur-sm pointer-events-none select-none">
                  {steps.slice(3).map((step, index) => (
                    <Card key={index} className="border-l-4 border-coral-accent">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-coral-accent/10 p-3 rounded-lg flex-shrink-0">
                            <step.icon className="w-6 h-6 text-coral-accent" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{step.description}</p>
                            <p className="text-sm text-foreground/70">{step.details}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Unlock overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
                  <Card className="bg-coral-accent text-white border-0 shadow-xl max-w-sm mx-4">
                    <CardContent className="pt-6 text-center">
                      <div className="mb-4">
                        <div className="inline-block bg-white/20 p-3 rounded-full mb-3">
                          <ClipboardList className="w-8 h-8" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">Unlock Full Guide</h3>
                      <p className="text-white/90 mb-4">
                        Complete the quick survey to get instant access to all strategies, tips, and insider secrets!
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Takes less than 2 minutes</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Stats Card */}
              <Card className="mt-8 bg-coral-accent/5">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <DollarSign className="w-6 h-6 text-coral-accent" />
                        <p className="text-3xl font-bold text-coral-accent">$150M+</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Closed Volume</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Home className="w-6 h-6 text-coral-accent" />
                        <p className="text-3xl font-bold text-coral-accent">500+</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Homes Sold</p>
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
              <Card className="sticky top-24 border-2 border-coral-accent/20 shadow-lg">
                <CardHeader className="bg-coral-accent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-coral-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                      STEP 1
                    </div>
                    <span className="text-sm text-muted-foreground">Quick Survey</span>
                  </div>
                  <CardTitle className="text-2xl">
                    {submitted ? "Check Your Email!" : "Get Instant Access"}
                  </CardTitle>
                  <CardDescription>
                    {submitted 
                      ? "We've sent the Seller's Guide to your email. Don't forget to check your spam folder!"
                      : "Complete this quick survey to unlock your FREE comprehensive Seller's Guide"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <>
                      <div className="bg-coral-accent/5 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-coral-accent" />
                          You'll Receive:
                        </h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-coral-accent mt-0.5 flex-shrink-0" />
                            <span>Complete Seller's Guide PDF</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-coral-accent mt-0.5 flex-shrink-0" />
                            <span>Market insights & pricing strategies</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-coral-accent mt-0.5 flex-shrink-0" />
                            <span>Expert tips from $150M+ in sales</span>
                          </li>
                        </ul>
                      </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Question 1: Property Type */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">1. What type of property are you considering selling?</Label>
                        <p className="text-sm text-muted-foreground">Select all that apply</p>
                        <div className="space-y-2">
                          {[
                            "Luxury Condo",
                            "Waterfront Property",
                            "Single-Family Home",
                            "Investment/Rental Property"
                          ].map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`property-${option}`}
                                checked={formData.propertyTypes.includes(option)}
                                onChange={() => handleCheckboxChange('propertyTypes', option)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`property-${option}`} className="font-normal cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="property-other"
                              checked={formData.propertyTypes.includes('Other')}
                              onChange={() => handleCheckboxChange('propertyTypes', 'Other')}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="property-other" className="font-normal cursor-pointer">
                              Other:
                            </Label>
                            <Input
                              value={formData.propertyOther}
                              onChange={(e) => setFormData(prev => ({ ...prev, propertyOther: e.target.value }))}
                              placeholder="Please specify"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Question 2: Property Location */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">2. Where is the property located?</Label>
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <Label htmlFor="city">City/Neighborhood</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Address (optional)</Label>
                            <Input
                              id="address"
                              value={formData.address}
                              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Question 3: Estimated Value */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">3. What is the estimated value of your property?</Label>
                        <div className="space-y-2">
                          {[
                            "$250,000 – $400,000",
                            "$405,000 – $750,000",
                            "$750,000 – $1,500,000",
                            "$1,500,000+",
                            "Not sure – I'd like a professional opinion"
                          ].map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`value-${option}`}
                                name="estimatedValue"
                                checked={formData.estimatedValue === option}
                                onChange={() => handleRadioChange('estimatedValue', option)}
                                className="border-gray-300"
                              />
                              <Label htmlFor={`value-${option}`} className="font-normal cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Question 4: Timeline */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">4. When are you planning to sell?</Label>
                        <div className="space-y-2">
                          {[
                            "Immediately",
                            "In 3–6 months",
                            "In 6+ months",
                            "Just exploring my options"
                          ].map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`timeline-${option}`}
                                name="timeline"
                                checked={formData.timeline === option}
                                onChange={() => handleRadioChange('timeline', option)}
                                className="border-gray-300"
                              />
                              <Label htmlFor={`timeline-${option}`} className="font-normal cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Question 5: Contact Preference */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">5. How would you prefer to connect with us?</Label>
                        <div className="space-y-2">
                          {[
                            "Please email me the Seller's Guide",
                            "I'd like to schedule a home valuation or consultation call",
                            "I'd like both"
                          ].map(option => (
                            <div key={option} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`contact-${option}`}
                                checked={formData.contactPreference.includes(option)}
                                onChange={() => handleCheckboxChange('contactPreference', option)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`contact-${option}`} className="font-normal cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                      </div>

                       <Button 
                         type="submit" 
                         className="w-full bg-coral-accent hover:bg-coral-accent/90 text-white"
                         size="lg"
                       >
                         Send Me My Free Guide
                       </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting, you agree to receive emails from The Crawford Team. 
                        We respect your privacy and you can unsubscribe anytime.
                      </p>
                    </form>
                    </>
                  
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
