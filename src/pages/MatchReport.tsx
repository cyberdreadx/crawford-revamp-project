import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Sparkles, Home, MapPin, DollarSign, Calendar, ArrowLeft, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Survey {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service_types?: string[];
  advisor_qualities?: string[];
  property_types?: string[];
  lifestyle_preferences?: string[];
  value_factors?: string[];
  price_range?: string;
  preferred_locations?: string[];
  timeline?: string;
  contact_preference?: string[];
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_images?: { image_url: string; is_primary: boolean }[];
}

const MatchReport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const surveyId = searchParams.get("surveyId");
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (surveyId) {
      generateReport();
    } else {
      setLoading(false);
    }
  }, [surveyId]);

  const generateReport = async () => {
    if (!surveyId) return;
    
    setGenerating(true);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-match-report', {
        body: { surveyId }
      });

      if (error) throw error;

      setReport(data.report);
      setSurvey(data.survey);
      setProperties(data.properties || []);
      
      toast({
        title: "Report Generated",
        description: "Your personalized match report is ready!",
      });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!report || !survey) return;
    
    // Create printable content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Luxury Property Match Report - ${survey.name}</title>
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.8; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; }
            h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
            h2 { color: #115e59; margin-top: 30px; }
            h3 { color: #1a1a1a; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
            .date { color: #666; font-size: 14px; }
            .client-info { background: #f0fdfa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">The Crawford Team</div>
            <h1>Luxury Property Match Report</h1>
            <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div class="client-info">
            <strong>Prepared for:</strong> ${survey.name}<br>
            <strong>Email:</strong> ${survey.email}<br>
            ${survey.phone ? `<strong>Phone:</strong> ${survey.phone}<br>` : ''}
          </div>
          <div class="content">
            ${report.replace(/#{1,6}\s/g, (match) => {
              const level = match.trim().length;
              return `<h${level}>`;
            }).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>The Crawford Team | St. Petersburg, FL</p>
            <p>Phone: (727) 599-1944 | Email: hello@yourcrawfordteam.com</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!surveyId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Property Match Report</h1>
            <p className="text-muted-foreground mb-8">
              Complete our Luxury Survey to receive your personalized property match report powered by AI.
            </p>
            <Button onClick={() => navigate('/luxury-survey')} className="bg-accent hover:bg-accent/90">
              Take the Luxury Survey
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-accent" />
                Your Property Match Report
              </h1>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={generateReport}
                disabled={generating}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={!report}
                className="bg-accent hover:bg-accent/90"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
                <p className="text-lg text-muted-foreground">
                  Analyzing your preferences and matching properties...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Report */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      AI-Generated Match Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{report || ''}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Client Summary */}
                {survey && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-semibold">{survey.name}</p>
                        <p className="text-sm text-muted-foreground">{survey.email}</p>
                      </div>
                      
                      {survey.price_range && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-accent" />
                          <span className="text-sm">{survey.price_range}</span>
                        </div>
                      )}
                      
                      {survey.timeline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span className="text-sm">{survey.timeline}</span>
                        </div>
                      )}

                      {survey.preferred_locations && survey.preferred_locations.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">Preferred Locations</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {survey.preferred_locations.map((loc, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {loc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {survey.property_types && survey.property_types.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Home className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">Property Types</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {survey.property_types.map((type, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Matched Properties Preview */}
                {properties.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Featured Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {properties.slice(0, 3).map((property) => (
                        <div 
                          key={property.id}
                          className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => navigate(`/property/${property.id}`)}
                        >
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                            {property.property_images?.[0]?.image_url ? (
                              <img 
                                src={property.property_images[0].image_url} 
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{property.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{property.location}</p>
                            <p className="text-sm font-semibold text-accent">
                              ${property.price?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/luxury')}
                      >
                        View All Properties
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Ready to Take the Next Step?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Schedule a personalized consultation with our luxury real estate experts.
                    </p>
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90"
                      onClick={() => navigate('/#contact')}
                    >
                      Contact Us
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MatchReport;
