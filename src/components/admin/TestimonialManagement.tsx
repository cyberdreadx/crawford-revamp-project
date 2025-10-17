import { useState, useEffect } from 'react';
import { Star, Trash2, Edit, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  id: string;
  name: string;
  title?: string;
  company?: string;
  content: string;
  rating?: number;
  image_url?: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    content: '',
    rating: 5,
    display_order: 0,
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch testimonials: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const testimonialData = {
        name: formData.name,
        title: formData.title || null,
        company: formData.company || null,
        content: formData.content,
        rating: formData.rating,
        display_order: formData.display_order,
        is_featured: formData.is_featured,
        is_active: formData.is_active
      };

      let result;
      if (selectedTestimonial) {
        result = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', selectedTestimonial.id);
      } else {
        result = await supabase
          .from('testimonials')
          .insert([testimonialData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Testimonial ${selectedTestimonial ? 'updated' : 'created'} successfully!`
      });

      setIsDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save testimonial: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, testimonialId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('testimonials')
        .update({ image_url: publicUrl })
        .eq('id', testimonialId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image uploaded successfully!"
      });

      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload image: " + error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testimonial deleted successfully!"
      });

      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial: " + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setSelectedTestimonial(null);
    setFormData({
      name: '',
      title: '',
      company: '',
      content: '',
      rating: 5,
      display_order: 0,
      is_featured: false,
      is_active: true
    });
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      title: testimonial.title || '',
      company: testimonial.company || '',
      content: testimonial.content,
      rating: testimonial.rating || 5,
      display_order: testimonial.display_order,
      is_featured: testimonial.is_featured,
      is_active: testimonial.is_active
    });
    setIsDialogOpen(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimonials</h2>
          <p className="text-muted-foreground">Manage client testimonials and reviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., CEO, Homeowner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Testimonial Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {testimonial.image_url ? (
                    <img
                      src={testimonial.image_url}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      {testimonial.is_featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {!testimonial.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    {(testimonial.title || testimonial.company) && (
                      <p className="text-sm text-muted-foreground">
                        {[testimonial.title, testimonial.company].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    {testimonial.rating && renderStars(testimonial.rating)}
                    <p className="text-sm">{testimonial.content}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      id={`image-${testimonial.id}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, testimonial.id)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById(`image-${testimonial.id}`)?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(testimonial)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTestimonial(testimonial.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No testimonials yet. Add your first testimonial to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestimonialManagement;
