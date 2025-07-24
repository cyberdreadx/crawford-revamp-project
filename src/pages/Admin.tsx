import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  created_at: string;
  updated_at: string;
}

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

const Admin = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
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
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch properties: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyImages = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('display_order');

      if (error) throw error;
      setPropertyImages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch property images: " + error.message,
        variant: "destructive"
      });
    }
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
      if (selectedProperty) {
        result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', selectedProperty.id);
      } else {
        result = await supabase
          .from('properties')
          .insert([propertyData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Property ${selectedProperty ? 'updated' : 'created'} successfully!`
      });

      setIsDialogOpen(false);
      resetForm();
      fetchProperties();
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

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property deleted successfully!"
      });

      fetchProperties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete property: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, propertyId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}-${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            image_url: urlData.publicUrl,
            is_primary: i === 0 && propertyImages.length === 0,
            display_order: propertyImages.length + i
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: "Images uploaded successfully!"
      });

      fetchPropertyImages(propertyId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload images: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      
      // Delete from storage
      if (fileName) {
        await supabase.storage
          .from('property-images')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully!"
      });

      if (selectedProperty) {
        fetchPropertyImages(selectedProperty.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete image: " + error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (property: Property) => {
    setSelectedProperty(property);
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
    fetchPropertyImages(property.id);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedProperty(null);
    setPropertyImages([]);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Property Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedProperty ? 'Edit Property' : 'Add New Property'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sqft">Square Feet</Label>
                    <Input
                      id="sqft"
                      type="number"
                      value={formData.sqft}
                      onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year_built">Year Built</Label>
                    <Input
                      id="year_built"
                      type="number"
                      value={formData.year_built}
                      onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="property_type">Property Type</Label>
                    <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Cabin">Cabin</SelectItem>
                        <SelectItem value="Estate">Estate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="For Sale">For Sale</SelectItem>
                        <SelectItem value="For Rent">For Rent</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taxes">Annual Taxes</Label>
                    <Input
                      id="taxes"
                      type="number"
                      step="0.01"
                      value={formData.taxes}
                      onChange={(e) => setFormData({ ...formData, taxes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flood_zone">Flood Zone</Label>
                    <Input
                      id="flood_zone"
                      value={formData.flood_zone}
                      onChange={(e) => setFormData({ ...formData, flood_zone: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Featured Property</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="key_features">Key Features (comma-separated)</Label>
                  <Input
                    id="key_features"
                    value={formData.key_features}
                    onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                    placeholder="Ocean Views, Private Pool, Gourmet Kitchen"
                  />
                </div>

                {selectedProperty && (
                  <div>
                    <Label>Property Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {propertyImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.image_url}
                            alt="Property"
                            className="w-full h-24 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => handleDeleteImage(image.id, image.image_url)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {image.is_primary && (
                            <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, selectedProperty.id)}
                        disabled={uploadingImages}
                      />
                      {uploadingImages && <p className="text-sm text-muted-foreground mt-1">Uploading images...</p>}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : selectedProperty ? 'Update Property' : 'Create Property'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(property)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    ${property.price.toLocaleString()}
                  </p>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <span>{property.bedrooms} beds</span>
                    <span>{property.bathrooms} baths</span>
                    <span>{property.sqft.toLocaleString()} sqft</span>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">{property.property_type}</Badge>
                    <Badge variant={property.status === 'For Sale' ? 'default' : 'outline'}>
                      {property.status}
                    </Badge>
                    {property.is_featured && (
                      <Badge variant="destructive">Featured</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {properties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found. Add your first property to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;