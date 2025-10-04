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
        <section className="bg-gradient-to-br from-background via-background to-coral-light/10 py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Guide for Buyers</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Your comprehensive roadmap to buying a home in St. Petersburg
              </p>
            </div>
          </div>
        </section>

        {/* What Not to Do Section */}
        <section className="py-16 bg-destructive/5">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">What NOT to Do During the Home Buying Process</h2>
              <Card className="border-destructive/20">
                <CardContent className="pt-6">
                  <p className="mb-6 text-center text-muted-foreground">
                    It's extremely important not to do any of the following until after the home buying process is complete:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Buy or lease a car",
                      "Change jobs",
                      "Miss a bill payment",
                      "Open a new line of credit",
                      "Move money around",
                      "Make a major purchase"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-background">
                        <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground text-center">
                    Any of these changes could jeopardize your loan approval. Lenders do a final credit check before closing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Home Buying Timeline</h2>
              <div className="space-y-4">
                {[
                  { step: "Prepare finances & get preapproved", icon: DollarSign },
                  { step: "Buyer's Consultation", icon: FileText },
                  { step: "Home search set up through One Home", icon: Home },
                  { step: "Tour homes and neighborhoods", icon: TrendingUp },
                  { step: "Make an offer", icon: FileText },
                  { step: "Inspections", icon: CheckCircle2 },
                  { step: "Negotiate repairs, extensions, or credits", icon: FileText },
                  { step: "Lender orders appraisal", icon: DollarSign },
                  { step: "Final walk through", icon: Home },
                  { step: "Closing", icon: CheckCircle2 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-coral-light/10 hover:bg-coral-light/20 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral-accent/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-coral-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.step}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Survey CTA */}
              <div className="mt-12 text-center">
                <p className="text-lg font-medium mb-4">Get our Buyer's Guide by completing this brief survey.</p>
                <Button onClick={() => window.location.href = '#survey'} size="lg" className="bg-gradient-teal hover:shadow-button text-teal-700">
                  <FileText className="w-5 h-5 mr-2" />
                  Take Buyer's Survey
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Financing Section */}
        <section className="py-16 bg-coral-light/5">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Prepare Your Finances</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Preapproved</CardTitle>
                    <CardDescription>The difference between prequalified and preapproved</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-background">
                        <h4 className="font-semibold mb-2">Prequalified</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• No mortgage application needed</li>
                          <li>• No credit check</li>
                          <li>• Estimate of loan amount</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-coral-accent/10">
                        <h4 className="font-semibold mb-2">Preapproved ✓</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Full mortgage application</li>
                          <li>• Credit history check</li>
                          <li>• Specific loan amount</li>
                          <li>• Interest rate information</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Loan Application Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="income">
                        <AccordionTrigger>Income Documents</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm">
                            <li>• Federal tax returns (last 2 years)</li>
                            <li>• W-2s (last 2 years)</li>
                            <li>• Pay stubs (last 2 months)</li>
                            <li>• Additional income documentation</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="assets">
                        <AccordionTrigger>Asset Documents</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm">
                            <li>• Bank statements (2 most recent)</li>
                            <li>• 401(k) or retirement statements</li>
                            <li>• Other assets (IRAs, stocks, bonds)</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="other">
                        <AccordionTrigger>Other Documents</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm">
                            <li>• Government issued photo ID</li>
                            <li>• Social Security card</li>
                            <li>• Addresses for past 2-5 years</li>
                            <li>• Student loan statements</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Types of Loans</CardTitle>
                  <CardDescription>Choose the right loan for your situation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">Conventional Loan</h4>
                      <p className="text-sm text-muted-foreground">
                        Best if you have a strong credit score, stable income, and can make a substantial down payment. 
                        Offers competitive interest rates and flexible terms.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">VA Loan</h4>
                      <p className="text-sm text-muted-foreground">
                        For veterans, active-duty service members, and eligible spouses. Usually requires no down payment 
                        and offers favorable terms.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">FHA Loan</h4>
                      <p className="text-sm text-muted-foreground">
                        Great for first-time homebuyers or those with lower credit scores. More lenient credit requirements 
                        and lower down payment options.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Home Search Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Home Search & Tours</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-6 text-muted-foreground">
                    Before you begin looking at homes, remember that there is no "perfect" home and no "right" time to buy. 
                    We'll set up a search through One Home where you'll receive daily listings matching your criteria.
                  </p>
                  <h3 className="font-semibold mb-4">Questions to Ask About the Neighborhood:</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "What's your commute?",
                      "What are the property taxes?",
                      "How are the schools in the area?",
                      "Is it close to places I like to go?",
                      "How walkable is the neighborhood?",
                      "How is the noise level?",
                      "What is the neighborhood culture like?",
                      "Does this match my lifestyle?",
                      "Do I like what I see?",
                      "Is it a good investment?"
                    ].map((question) => (
                      <div key={question} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-coral-accent mt-1 flex-shrink-0" />
                        <span className="text-sm">{question}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground italic">
                    Pro tip: We recommend touring no more than 5 properties a day to avoid exhaustion.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Making an Offer Section */}
        <section className="py-16 bg-coral-light/5">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Making an Offer</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What's Included in Your Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {[
                        "Purchase Price",
                        "Closing Date",
                        "Inspection Period",
                        "Items to Convey With The Home",
                        "Earnest Money Amount",
                        "Prequalification Letter or Proof of Funds"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-coral-accent flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>After You Submit Your Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <p className="font-medium">1. Seller Accepts</p>
                        <p className="text-sm text-muted-foreground">You're under contract!</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10">
                        <p className="font-medium">2. Seller Rejects</p>
                        <p className="text-sm text-muted-foreground">Back to the search</p>
                      </div>
                      <div className="p-3 rounded-lg bg-coral-accent/10">
                        <p className="font-medium">3. Seller Counters (Most Common)</p>
                        <p className="text-sm text-muted-foreground">Negotiation on price, dates, or terms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Getting to Finish Line */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Getting to the Finish Line</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Home Inspection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Professional inspectors evaluate the condition of your potential home to check for issues that may be unknown. 
                      We always recommend a general home inspection, 4-point, and pest inspection.
                    </p>
                    <p className="text-sm font-medium mb-2">After inspection, you can:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Terminate offer if major problems are discovered</li>
                      <li>• Negotiate credits for repairs</li>
                      <li>• Negotiate for seller to make repairs before closing</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      Typical costs: $550-600 for home inspection, $100 for pest inspection
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Insurance & Appraisal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Title Insurance</h4>
                        <p className="text-sm text-muted-foreground">
                          Protects your ownership rights from fraudulent claims and mistakes in earlier sales. 
                          Required by your lender.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Home Insurance</h4>
                        <p className="text-sm text-muted-foreground">
                          Required by your lender. We'll connect you with our trusted local insurance team.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Appraisal</h4>
                        <p className="text-sm text-muted-foreground">
                          Lender sends an appraiser to ensure the purchase price aligns with property value. 
                          Protects you from overpaying.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Final Steps Before Closing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Closing Disclosure (3 days before)</h4>
                        <p className="text-sm text-muted-foreground">
                          Review your final loan terms and closing costs (typically 2-5% of purchase price).
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Final Walk Through (24 hours before)</h4>
                        <p className="text-sm text-muted-foreground">
                          Verify no damage has occurred, agreed repairs are complete, and nothing has been removed.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Wiring Funds</h4>
                        <p className="text-sm text-muted-foreground">
                          Wire your closing costs the day before closing. Amount listed on closing disclosure.
                        </p>
                        <p className="text-sm font-semibold text-destructive mt-2">
                          ⚠️ Beware of cyber-fraud. Wiring instructions will NEVER be emailed.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-coral-accent/10 mt-4">
                        <h4 className="font-semibold mb-2">Items to Bring to Closing:</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Government issued photo ID</li>
                          <li>• Certified funds or cashier's check</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-gradient-to-br from-coral-light/5 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground">
                  Let us know how we can help you with your home buying journey in St. Petersburg.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>
                    Fill out the form and we'll be in touch shortly to discuss your home buying goals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label htmlFor="message">Tell us about your home buying goals</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="I'm looking for a 3-bedroom home in downtown St. Pete..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-coral-accent hover:bg-coral-accent/90 text-white" size="lg">
                      Send Message
                    </Button>
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
