import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SERVICE_TYPES = [
  "Purchase a primary residence",
  "Purchase a second/vacation home",
  "Acquire a long-term investment property",
  "Acquire a short-term rental or seasonal asset",
  "Sell a current property",
  "Confidential off-market consultation",
  "Portfolio advisory (multiple properties)",
];

const ADVISOR_QUALITIES = [
  "Deep local + building-specific expertise",
  "Discretion and confidentiality",
  "Negotiation strategy + deal structure expertise",
  "White-glove concierge service",
  "Access to exclusive/off-market listings",
  "Strong network (attorneys, CPAs, designers, contractors)",
  "Multilingual + international experience",
  "Tech-savvy + responsive communication",
];

const PROPERTY_TYPES = [
  "High-rise luxury condos (new, modern)",
  "Waterfront condos with panoramic bay/Gulf views",
  "Historic or architecturally significant homes",
  "Modern coastal single-family homes",
  "Gated or private communities",
  "Penthouses or large-format residences (2,500+ sq ft)",
  "Walkable downtown properties",
  "Investment-grade condos in high-demand buildings",
];

const LIFESTYLE_PREFERENCES = [
  "Walkability to dining + culture",
  "Waterfront living / boating access",
  "Privacy + low-maintenance lock-and-leave",
];

const VALUE_FACTORS = [
  "Appreciation potential / investment performance",
  "Architectural design + finishes",
  "View corridor / orientation",
  "Building reputation, reserves, and inspections",
  "Amenities + services",
  "Rental flexibility",
  "Exclusivity + long-term desirability",
];

const PRICE_RANGES = [
  "$750,000 – $1.2M",
  "$1.2M – $2.5M",
  "$2.5M – $5M",
  "$5M–$10M",
  "Open / based on value",
];

const LOCATIONS = [
  "Downtown St. Petersburg (arts, walkability, skyline)",
  "Snell Isle (waterfront estates, prestige)",
  "Old Northeast (historic charm, brick streets)",
  "Shore Acres (new construction waterfront)",
  "Venetian Isles (deep-water boating)",
  "Tierra Verde / Isla del Sol (island lifestyle)",
  "Beach communities (Pass-a-Grille, Treasure Island, St. Pete Beach)",
  "Open to recommendations",
];

const TIMELINES = [
  "Immediate",
  "3–6 months",
  "6–12 months",
  "12+ months",
];

const CONTACT_PREFERENCES = [
  "Schedule a private call",
  "Email introduction",
  "Both",
];

export default function LuxurySurvey() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceTypes: [] as string[],
    advisorQualities: [] as string[],
    propertyTypes: [] as string[],
    lifestylePreferences: [] as string[],
    valueFactors: [] as string[],
    priceRange: "",
    preferredLocations: [] as string[],
    timeline: "",
    contactPreference: [] as string[],
  });

  const handleCheckboxChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    const current = formData[field] as string[];
    if (checked) {
      setFormData({ ...formData, [field]: [...current, value] });
    } else {
      setFormData({ ...formData, [field]: current.filter((v) => v !== value) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Required Fields",
        description: "Please provide your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate ID client-side since we can't select after insert (no SELECT permission for anon)
      const surveyId = crypto.randomUUID();
      
      // Save to database
      const { error: dbError } = await supabase.from("luxury_surveys").insert({
        id: surveyId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        service_types: formData.serviceTypes,
        advisor_qualities: formData.advisorQualities,
        property_types: formData.propertyTypes,
        lifestyle_preferences: formData.lifestylePreferences,
        value_factors: formData.valueFactors,
        price_range: formData.priceRange || null,
        preferred_locations: formData.preferredLocations,
        timeline: formData.timeline || null,
        contact_preference: formData.contactPreference,
      });

      if (dbError) throw dbError;

      // Generate and email the report
      const { error: reportError } = await supabase.functions.invoke("generate-and-email-report", {
        body: { surveyId },
      });

      if (reportError) {
        console.error("Report generation error:", reportError);
        // Still show success to user - the survey was saved
      }

      toast({
        title: "Survey Submitted Successfully!",
        description: "Your personalized property match report will be emailed to you shortly.",
      });

      // Show confirmation page instead of redirecting to report
      setIsSubmitted(true);

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show confirmation after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="bg-accent/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Your personalized Luxury Property Match Report is being generated and will be sent to <strong>{formData.email}</strong> within the next few minutes.
            </p>
            
            <Card className="mb-8 text-left">
              <CardHeader>
                <CardTitle className="text-lg">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">1</span>
                  <p>Our AI analyzes your preferences against available luxury properties</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">2</span>
                  <p>You'll receive a comprehensive match report via email with property recommendations</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">3</span>
                  <p>A Crawford Team advisor will reach out to discuss your personalized results</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/mls-search')} variant="default">
                Browse MLS Listings
              </Button>
              <Button onClick={() => navigate('/luxury')} variant="outline">
                View Luxury Properties
              </Button>
              <Button onClick={() => navigate('/')} variant="ghost">
                Return Home
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Luxury Survey
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us about your luxury real estate goals. Your responses will help us create a personalized Luxury Match Report that will be emailed directly to you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Question 1: Service Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. What type of service are you exploring?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SERVICE_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-3">
                    <Checkbox
                      id={`service-${type}`}
                      checked={formData.serviceTypes.includes(type)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("serviceTypes", type, checked as boolean)
                      }
                    />
                    <Label htmlFor={`service-${type}`} className="cursor-pointer">{type}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Question 2: Advisor Qualities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. What qualities matter most in a luxury real estate advisor? (Select top 3)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ADVISOR_QUALITIES.map((quality) => (
                  <div key={quality} className="flex items-center space-x-3">
                    <Checkbox
                      id={`advisor-${quality}`}
                      checked={formData.advisorQualities.includes(quality)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("advisorQualities", quality, checked as boolean)
                      }
                    />
                    <Label htmlFor={`advisor-${quality}`} className="cursor-pointer">{quality}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Question 3: Property Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">3. What type of luxury properties interest you?</CardTitle>
                <p className="text-sm text-muted-foreground">(Select all that apply — this fuels your custom match report)</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {PROPERTY_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-3">
                    <Checkbox
                      id={`property-${type}`}
                      checked={formData.propertyTypes.includes(type)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("propertyTypes", type, checked as boolean)
                      }
                    />
                    <Label htmlFor={`property-${type}`} className="cursor-pointer">{type}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Question 4: Lifestyle Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">4. What lifestyle should your next property support?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LIFESTYLE_PREFERENCES.map((pref) => (
                  <div key={pref} className="flex items-center space-x-3">
                    <Checkbox
                      id={`lifestyle-${pref}`}
                      checked={formData.lifestylePreferences.includes(pref)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("lifestylePreferences", pref, checked as boolean)
                      }
                    />
                    <Label htmlFor={`lifestyle-${pref}`} className="cursor-pointer">{pref}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Question 5: Value Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">5. How do you evaluate value in a luxury purchase? (Select top 2)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {VALUE_FACTORS.map((factor) => (
                  <div key={factor} className="flex items-center space-x-3">
                    <Checkbox
                      id={`value-${factor}`}
                      checked={formData.valueFactors.includes(factor)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("valueFactors", factor, checked as boolean)
                      }
                    />
                    <Label htmlFor={`value-${factor}`} className="cursor-pointer">{factor}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Question 6: Price Range */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">6. What is your preferred price range for your next acquisition?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.priceRange}
                  onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
                  className="space-y-3"
                >
                  {PRICE_RANGES.map((range) => (
                    <div key={range} className="flex items-center space-x-3">
                      <RadioGroupItem value={range} id={`price-${range}`} />
                      <Label htmlFor={`price-${range}`} className="cursor-pointer">{range}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Question 7: Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">7. Where do you envision your ideal St. Pete lifestyle?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {LOCATIONS.map((location) => (
                  <div key={location} className="flex items-center space-x-3">
                    <Checkbox
                      id={`location-${location}`}
                      checked={formData.preferredLocations.includes(location)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("preferredLocations", location, checked as boolean)
                      }
                    />
                    <Label htmlFor={`location-${location}`} className="cursor-pointer">{location}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Question 8: Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">8. Preferred timeline:</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.timeline}
                  onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                  className="space-y-3"
                >
                  {TIMELINES.map((timeline) => (
                    <div key={timeline} className="flex items-center space-x-3">
                      <RadioGroupItem value={timeline} id={`timeline-${timeline}`} />
                      <Label htmlFor={`timeline-${timeline}`} className="cursor-pointer">{timeline}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Question 9: Contact Preference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">9. How would you like to begin?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {CONTACT_PREFERENCES.map((pref) => (
                  <div key={pref} className="flex items-center space-x-3">
                    <Checkbox
                      id={`contact-${pref}`}
                      checked={formData.contactPreference.includes(pref)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("contactPreference", pref, checked as boolean)
                      }
                    />
                    <Label htmlFor={`contact-${pref}`} className="cursor-pointer">{pref}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Question 10: Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">10. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
