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
                <Button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="bg-gradient-teal hover:shadow-button text-teal-700">
                  <FileText className="w-5 h-5 mr-2" />
                  Take Buyer's Survey
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="py-16 bg-gradient-to-br from-coral-light/5 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Get Your Free Buyer's Guide</h2>
                <p className="text-muted-foreground">
                  Complete this brief survey and we'll email you the complete guide plus personalized insights for your home buying journey.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>
                    Fill out your contact details below to receive your free Buyer's Guide via email.
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
