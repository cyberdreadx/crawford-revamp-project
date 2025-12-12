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
      // Save to database
      const { error: dbError } = await supabase.from("luxury_surveys").insert({
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

      // Send email notifications
      const { error: emailError } = await supabase.functions.invoke("send-luxury-survey-email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          serviceTypes: formData.serviceTypes,
          advisorQualities: formData.advisorQualities,
          propertyTypes: formData.propertyTypes,
          lifestylePreferences: formData.lifestylePreferences,
          valueFactors: formData.valueFactors,
          priceRange: formData.priceRange,
          preferredLocations: formData.preferredLocations,
          timeline: formData.timeline,
          contactPreference: formData.contactPreference,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
      }

      toast({
        title: "Survey Submitted!",
        description: "Thank you for completing the Luxury Survey. We'll be in touch soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceTypes: [],
        advisorQualities: [],
        propertyTypes: [],
        lifestylePreferences: [],
        valueFactors: [],
        priceRange: "",
        preferredLocations: [],
        timeline: "",
        contactPreference: [],
      });

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
              Tell us about your luxury real estate goals. Your responses will help us create a personalized Luxury Match Report tailored to your lifestyle and preferences.
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
