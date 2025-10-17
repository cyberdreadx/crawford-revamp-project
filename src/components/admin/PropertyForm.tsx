import { useState, useEffect, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built?: number;
  property_type: string;
  status: string;
  description?: string;
  key_features?: string[];
  taxes?: number;
  flood_zone?: string;
  is_featured: boolean;
}

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSuccess: () => void;
}

export const PropertyForm = ({ isOpen, onClose, property, onSuccess }: PropertyFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    year_built: '',
    property_type: 'House',
    status: 'For Sale',
    description: '',
    key_features: '',
    taxes: '',
    flood_zone: '',
    is_featured: false
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        location: property.location,
        price: property.price.toString(),
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        sqft: property.sqft.toString(),
        year_built: property.year_built?.toString() || '',
        property_type: property.property_type,
        status: property.status,
        description: property.description || '',
        key_features: property.key_features?.join(', ') || '',
        taxes: property.taxes?.toString() || '',
        flood_zone: property.flood_zone || '',
        is_featured: property.is_featured
      });
    } else {
      resetForm();
    }
  }, [property, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      sqft: '',
      year_built: '',
      property_type: 'House',
      status: 'For Sale',
      description: '',
      key_features: '',
      taxes: '',
      flood_zone: '',
      is_featured: false
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const propertyData = {
        title: formData.title,
        location: formData.location,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        sqft: parseInt(formData.sqft),
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        property_type: formData.property_type,
        status: formData.status,
        description: formData.description || null,
        key_features: formData.key_features ? formData.key_features.split(',').map(f => f.trim()) : null,
        taxes: formData.taxes ? parseFloat(formData.taxes) : null,
        flood_zone: formData.flood_zone || null,
        is_featured: formData.is_featured
      };

      let result;
      if (property) {
        result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', property.id);
      } else {
        result = await supabase
          .from('properties')
          .insert([propertyData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Property ${property ? 'updated' : 'created'} successfully!`
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save property: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const propertyTypes = [
    'House',
    'Condo',
    'Townhouse',
    'Luxury Estate',
    'Waterfront Estate',
    'Penthouse',
    'Villa',
    'Mansion',
    'Commercial',
    'Land'
  ];

  const statusOptions = [
    'For Sale',
    'Sold',
    'Pending',
    'Off Market',
    'Coming Soon'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? 'Edit Property' : 'Add New Property'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Beautiful Waterfront Estate"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="123 Ocean Drive, Miami, FL"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="1500000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                placeholder="4"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                placeholder="3.5"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sqft">Square Feet *</Label>
              <Input
                id="sqft"
                type="number"
                value={formData.sqft}
                onChange={(e) => handleInputChange('sqft', e.target.value)}
                placeholder="3500"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_built">Year Built</Label>
              <Input
                id="year_built"
                type="number"
                value={formData.year_built}
                onChange={(e) => handleInputChange('year_built', e.target.value)}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxes">Annual Taxes</Label>
              <Input
                id="taxes"
                type="number"
                value={formData.taxes}
                onChange={(e) => handleInputChange('taxes', e.target.value)}
                placeholder="25000"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flood_zone">Flood Zone</Label>
              <Input
                id="flood_zone"
                value={formData.flood_zone}
                onChange={(e) => handleInputChange('flood_zone', e.target.value)}
                placeholder="X (No Flood Zone)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the property..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_features">Key Features (comma-separated)</Label>
            <Textarea
              id="key_features"
              value={formData.key_features}
              onChange={(e) => handleInputChange('key_features', e.target.value)}
              placeholder="Ocean Views, Pool, Gourmet Kitchen, Private Beach Access"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
            />
            <Label htmlFor="is_featured">Feature this property</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};