import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Download, CheckCircle2, Clock, Shield, TrendingUp, Camera, Users, FileCheck, DollarSign, Home } from "lucide-react";
import { toast } from "sonner";

const SellerGuide = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast.success("Thank you! We'll be in touch shortly.");
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

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-coral-light/10 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-4 px-4 py-2 bg-coral-accent/10 rounded-full">
                <p className="text-coral-accent font-semibold text-sm">🔥 Limited Time Offer</p>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Get Your Free Seller's Guide</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Skip the research. Get insider knowledge from St. Petersburg's top real estate experts — completely free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-coral-accent" />
                  <span>Only takes 2 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-coral-accent" />
                  <span>100% Free, No Obligations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-16 bg-gradient-to-br from-coral-light/5 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-center">What You'll Get Inside</h2>
              <p className="text-center text-muted-foreground mb-12">Your complete roadmap to selling your home in St. Petersburg</p>
              
              <div className="space-y-4 relative">
                {/* First 3 steps - visible */}
                {[
                  { step: "Maximize Your Sale Price", icon: TrendingUp, desc: "Learn proven strategies to increase your home's value and attract premium offers" },
                  { step: "Property Preparation", icon: Camera, desc: "Discover staging secrets and home improvements that deliver the best ROI" },
                  { step: "Marketing That Works", icon: Users, desc: "Our luxury marketing strategy reaches qualified buyers across multiple channels" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 rounded-lg bg-background border border-border hover:border-coral-accent/50 transition-all">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coral-accent/20 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-coral-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1">{item.step}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
                
                {/* Blurred preview of remaining steps */}
                <div className="relative">
                  <div className="blur-sm pointer-events-none opacity-60">
                    {[
                      { step: "Smooth Transaction Process", icon: FileCheck },
                      { step: "Professional Photography & Staging", icon: Camera },
                      { step: "Pricing Strategy & Market Analysis", icon: DollarSign },
                      { step: "Plus 4 more critical steps...", icon: CheckCircle2 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-6 rounded-lg bg-background border border-border mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-coral-accent/20 flex items-center justify-center">
                          <item.icon className="w-6 h-6 text-coral-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{item.step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Overlay CTA */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background via-background/95 to-transparent">
                    <div className="text-center p-8 max-w-md">
                      <h3 className="text-2xl font-bold mb-4">Unlock All 10 Steps</h3>
                      <p className="text-muted-foreground mb-6">Complete the quick survey below to get instant access to your complete Seller's Guide</p>
                      <Button 
                        onClick={() => document.getElementById('survey')?.scrollIntoView({ behavior: 'smooth' })} 
                        size="lg" 
                        className="bg-gradient-gold text-navy-deep hover:opacity-90 font-semibold shadow-button"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Get My Free Guide Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Survey Form Section */}
        <section id="survey" className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Quick Survey — Get Instant Access</h2>
                <p className="text-muted-foreground">
                  Answer a few quick questions so we can personalize your guide and send you the most relevant insights for selling your St. Petersburg property.
                </p>
              </div>
              <Card className="border-coral-accent/20">
                <CardHeader>
                  <CardTitle>Tell Us About Your Home Selling Journey</CardTitle>
                  <CardDescription>
                    This helps us provide personalized recommendations in your guide.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                            placeholder="e.g., St. Petersburg, Clearwater"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address (optional)</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="123 Main Street"
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
                          placeholder="John Doe"
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
                          placeholder="john@example.com"
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
                          placeholder="(727) 555-0123"
                        />
                      </div>
                    </div>

                    <div className="bg-coral-light/10 rounded-lg p-4 border border-coral-accent/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-coral-accent flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">You'll receive instantly:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>✓ Complete seller's timeline and checklist</li>
                            <li>✓ Personalized market insights</li>
                            <li>✓ Expert pricing strategies</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-gold text-navy-deep hover:opacity-90 font-semibold shadow-button" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Submit & Get the Guide
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      By submitting, you agree to receive helpful home selling tips via email. Unsubscribe anytime.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SellerGuide;
