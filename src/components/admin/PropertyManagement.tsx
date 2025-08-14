import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Star, Home, Building, Crown, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PropertyForm } from './PropertyForm';
import { PropertyCard } from './PropertyCard';

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

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [allPropertyImages, setAllPropertyImages] = useState<{ [key: string]: PropertyImage[] }>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (properties.length > 0) {
      fetchAllPropertyImages();
    }
  }, [properties]);

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

  const fetchAllPropertyImages = async () => {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      const imagesByProperty = (data || []).reduce((acc: { [key: string]: PropertyImage[] }, image) => {
        if (!acc[image.property_id]) {
          acc[image.property_id] = [];
        }
        acc[image.property_id].push(image);
        return acc;
      }, {});
      
      setAllPropertyImages(imagesByProperty);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch property images: " + error.message,
        variant: "destructive"
      });
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

  const openDialog = (property?: Property) => {
    setSelectedProperty(property || null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedProperty(null);
  };

  // Filter properties by type and luxury status
  const luxuryProperties = properties.filter(p => 
    p.is_featured || 
    p.property_type.toLowerCase().includes('luxury') ||
    p.property_type.toLowerCase().includes('estate') ||
    p.price >= 1000000
  );

  const waterfrontProperties = properties.filter(p => 
    p.location.toLowerCase().includes('waterfront') ||
    p.location.toLowerCase().includes('beach') ||
    p.location.toLowerCase().includes('ocean') ||
    p.key_features?.some(f => f.toLowerCase().includes('waterfront'))
  );

  const standardProperties = properties.filter(p => 
    !luxuryProperties.includes(p) && !waterfrontProperties.includes(p)
  );

  const featuredProperties = properties.filter(p => p.is_featured);

  const getCategoryStats = () => ({
    luxury: luxuryProperties.length,
    waterfront: waterfrontProperties.length,
    standard: standardProperties.length,
    featured: featuredProperties.length,
    total: properties.length
  });

  const stats = getCategoryStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Property Management</h2>
          <p className="text-muted-foreground">Organized by luxury categories</p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Luxury</p>
                <p className="text-2xl font-bold">{stats.luxury}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Waterfront</p>
                <p className="text-2xl font-bold">{stats.waterfront}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Standard</p>
                <p className="text-2xl font-bold">{stats.standard}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Categories */}
      <Tabs defaultValue="luxury" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="luxury" className="gap-2">
            <Crown className="h-4 w-4" />
            Luxury ({stats.luxury})
          </TabsTrigger>
          <TabsTrigger value="waterfront" className="gap-2">
            <Waves className="h-4 w-4" />
            Waterfront ({stats.waterfront})
          </TabsTrigger>
          <TabsTrigger value="standard" className="gap-2">
            <Home className="h-4 w-4" />
            Standard ({stats.standard})
          </TabsTrigger>
          <TabsTrigger value="featured" className="gap-2">
            <Star className="h-4 w-4" />
            Featured ({stats.featured})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="luxury" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Luxury Properties</h3>
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3 w-3" />
              Premium Collection
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {luxuryProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                images={allPropertyImages[property.id] || []}
                onEdit={() => openDialog(property)}
                onDelete={() => handleDelete(property.id)}
              />
            ))}
            {luxuryProperties.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No luxury properties found. Add high-end properties to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="waterfront" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Waterfront Properties</h3>
            <Badge variant="secondary" className="gap-1">
              <Waves className="h-3 w-3" />
              Ocean & Lake Views
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waterfrontProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                images={allPropertyImages[property.id] || []}
                onEdit={() => openDialog(property)}
                onDelete={() => handleDelete(property.id)}
              />
            ))}
            {waterfrontProperties.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No waterfront properties found. Add ocean or lake properties to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="standard" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Standard Properties</h3>
            <Badge variant="secondary" className="gap-1">
              <Home className="h-3 w-3" />
              Residential Collection
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standardProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                images={allPropertyImages[property.id] || []}
                onEdit={() => openDialog(property)}
                onDelete={() => handleDelete(property.id)}
              />
            ))}
            {standardProperties.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No standard properties found. Add residential properties to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Featured Properties</h3>
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              Highlighted Listings
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                images={allPropertyImages[property.id] || []}
                onEdit={() => openDialog(property)}
                onDelete={() => handleDelete(property.id)}
                featured
              />
            ))}
            {featuredProperties.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No featured properties found. Mark properties as featured to highlight them.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Property Form Dialog */}
      <PropertyForm
        isOpen={isDialogOpen}
        onClose={closeDialog}
        property={selectedProperty}
        onSuccess={() => {
          fetchProperties();
          closeDialog();
        }}
      />
    </div>
  );
};

export default PropertyManagement;