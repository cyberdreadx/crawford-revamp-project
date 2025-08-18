import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Tag,
  Clock,
  Eye,
  Search
} from 'lucide-react';

interface SEOSettings {
  id?: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

export default function ContentManager() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings[]>([]);
  const [selectedSEO, setSelectedSEO] = useState<SEOSettings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState<SEOSettings>({
    page: '',
    title: '',
    description: '',
    keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: ''
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    setLoading(true);
    try {
      // For now, we'll create a mock data structure since there's no SEO table
      // In a real implementation, you'd create an SEO table in Supabase
      const mockSEOData: SEOSettings[] = [
        {
          id: '1',
          page: 'Home',
          title: 'Luxury Waterfront Properties | Premier Real Estate',
          description: 'Discover exclusive luxury waterfront properties and premier real estate listings. Expert service for buyers and sellers.',
          keywords: 'luxury real estate, waterfront properties, premium homes',
          canonical_url: 'https://yoursite.com/',
          og_title: 'Luxury Waterfront Properties',
          og_description: 'Discover exclusive luxury waterfront properties',
          og_image: 'https://yoursite.com/og-image.jpg'
        },
        {
          id: '2',
          page: 'Properties',
          title: 'Property Listings | Luxury Real Estate',
          description: 'Browse our collection of luxury properties including waterfront estates, modern homes, and exclusive listings.',
          keywords: 'property listings, luxury homes, real estate search',
          canonical_url: 'https://yoursite.com/properties',
          og_title: 'Property Listings',
          og_description: 'Browse luxury property listings',
          og_image: 'https://yoursite.com/properties-og.jpg'
        }
      ];
      setSeoSettings(mockSEOData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch SEO settings: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock save operation - in real implementation, save to Supabase
      toast({
        title: "Success",
        description: `SEO settings ${selectedSEO ? 'updated' : 'created'} successfully!`
      });

      setIsDialogOpen(false);
      resetForm();
      fetchSEOSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seo: SEOSettings) => {
    setSelectedSEO(seo);
    setFormData(seo);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete these SEO settings?')) return;

    try {
      // Mock delete operation
      toast({
        title: "Success",
        description: "SEO settings deleted successfully!"
      });
      fetchSEOSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete SEO settings: " + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setSelectedSEO(null);
    setFormData({
      page: '',
      title: '',
      description: '',
      keywords: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      og_image: ''
    });
  };

  const filteredSEO = seoSettings.filter(seo =>
    seo.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
          <p className="text-muted-foreground">Manage SEO settings, meta tags, and site content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add SEO Settings
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seo" className="gap-2">
            <Globe className="h-4 w-4" />
            SEO Settings
          </TabsTrigger>
          <TabsTrigger value="meta" className="gap-2">
            <Tag className="h-4 w-4" />
            Meta Tags
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            Site Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SEO settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredSEO.map((seo) => (
              <Card key={seo.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{seo.page}</CardTitle>
                      <p className="text-sm text-muted-foreground">{seo.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(seo)}
                        className="gap-2"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => seo.id && handleDelete(seo.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">{seo.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {seo.keywords.split(',').map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure global meta tags, Open Graph settings, and Twitter cards for your site.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage site-wide content, contact information, and static page content.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSEO ? 'Edit SEO Settings' : 'Add SEO Settings'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="page">Page Name</Label>
                <Input
                  id="page"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  placeholder="Home, About, Properties, etc."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="SEO-optimized page title (60 chars max)"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Characters: {formData.title.length}/60
                </p>
              </div>

              <div>
                <Label htmlFor="description">Meta Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for search engines (160 chars max)"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Characters: {formData.description.length}/160
                </p>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input
                  id="canonical"
                  type="url"
                  value={formData.canonical_url}
                  onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                  placeholder="https://yoursite.com/page"
                />
              </div>

              <div>
                <Label htmlFor="og_title">Open Graph Title</Label>
                <Input
                  id="og_title"
                  value={formData.og_title}
                  onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                  placeholder="Title for social media sharing"
                />
              </div>

              <div>
                <Label htmlFor="og_description">Open Graph Description</Label>
                <Textarea
                  id="og_description"
                  value={formData.og_description}
                  onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                  placeholder="Description for social media sharing"
                />
              </div>

              <div>
                <Label htmlFor="og_image">Open Graph Image URL</Label>
                <Input
                  id="og_image"
                  type="url"
                  value={formData.og_image}
                  onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                  placeholder="https://yoursite.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : selectedSEO ? 'Update' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}