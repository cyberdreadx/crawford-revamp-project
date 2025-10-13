import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Download, Home, FileText, CheckCircle2, XCircle, Clock, DollarSign, TrendingUp, Shield } from "lucide-react";
import { toast } from "sonner";

const BuyerGuide = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    toast.success("Thank you! We'll be in touch shortly.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDownload = () => {
    window.open('/guides/buyers-guide.pdf', '_blank');
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
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Get Your Free Buyer's Guide</h1>
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
              <p className="text-center text-muted-foreground mb-12">Your complete 10-step roadmap to buying a home in St. Petersburg</p>
              
              <div className="space-y-4 relative">
                {/* First 3 steps - visible */}
                {[
                  { step: "Prepare finances & get preapproved", icon: DollarSign, desc: "Learn exactly what lenders look for and how to maximize your buying power" },
                  { step: "Buyer's Consultation", icon: FileText, desc: "Get personalized guidance tailored to your specific needs and goals" },
                  { step: "Home search set up through One Home", icon: Home, desc: "Access exclusive listings before they hit the market" }
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
                      { step: "Tour homes and neighborhoods", icon: TrendingUp },
                      { step: "Make an offer", icon: FileText },
                      { step: "Inspections", icon: CheckCircle2 },
                      { step: "Plus 4 more critical steps...", icon: FileText }
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
                      <p className="text-muted-foreground mb-6">Complete the quick survey below to get instant access to your complete Buyer's Guide</p>
                      <Button 
                        onClick={() => document.getElementById('survey')?.scrollIntoView({ behavior: 'smooth' })} 
                        size="lg" 
                        className="bg-gradient-gold text-navy-deep hover:opacity-90 font-semibold shadow-button"
                      >
                        <FileText className="w-5 h-5 mr-2" />
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
                  Answer a few quick questions so we can personalize your guide and send you the most relevant insights for your St. Petersburg home search.
                </p>
              </div>
              <Card className="border-coral-accent/20">
                <CardHeader>
                  <CardTitle>Tell Us About Your Home Buying Journey</CardTitle>
                  <CardDescription>
                    This helps us provide personalized recommendations in your guide.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(727) 555-0123"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">What are your home buying goals? *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Example: Looking for a 3-bedroom home in downtown St. Pete, move-in ready, budget around $500k..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">The more details you share, the better we can personalize your guide.</p>
                    </div>

                    <div className="bg-coral-light/10 rounded-lg p-4 border border-coral-accent/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-coral-accent flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">You'll receive instantly:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>✓ Complete 10-step buyer's timeline</li>
                            <li>✓ Personalized market insights</li>
                            <li>✓ Exclusive access to off-market listings</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-gold text-navy-deep hover:opacity-90 font-semibold shadow-button" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Send Me My Free Guide
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      By submitting, you agree to receive helpful home buying tips via email. Unsubscribe anytime.
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

export default BuyerGuide;
