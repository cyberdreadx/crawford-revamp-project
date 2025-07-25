import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Image, Star, Home, Settings, Users, BarChart3, Shield, UserX, UserCheck, Crown, Globe, Database, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

interface HeroImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'suspended' | 'pending';
  last_login?: string;
  created_at: string;
  roles: string[];
}

const Admin = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedHeroImage, setSelectedHeroImage] = useState<HeroImage | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [allPropertyImages, setAllPropertyImages] = useState<{ [key: string]: PropertyImage[] }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isHeroDialogOpen, setIsHeroDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingHeroImages, setUploadingHeroImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFile, setCurrentFile] = useState(0);
  const [activeSection, setActiveSection] = useState('properties');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

  const [heroFormData, setHeroFormData] = useState({
    title: '',
    description: '',
    display_order: '0',
    is_active: true
  });

  useEffect(() => {
    checkUserAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProperties();
      fetchHeroImages();
      if (activeSection === 'users' && isAdmin) {
        fetchUsers();
      }
    }
  }, [activeSection, currentUser, isAdmin]);

  const checkUserAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the admin panel",
          variant: "destructive"
        });
        return;
      }

      setCurrentUser(session.user);

      // Check if user has admin role
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      const hasAdminRole = userRoles?.some(role => role.role === 'admin') || false;
      setIsAdmin(hasAdminRole);

      if (!hasAdminRole) {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access user management",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to check authentication: " + error.message,
        variant: "destructive"
      });
    }
  };

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

  const fetchAllPropertyImages = async () => {
    try {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      // Group images by property_id
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
        description: "Failed to fetch all property images: " + error.message,
        variant: "destructive"
      });
    }
  };

  const fetchHeroImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setHeroImages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch hero images: " + error.message,
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

  const fetchUsers = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required to view users",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch profiles data only (without auth.users since we can't access that from client)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          phone,
          avatar_url,
          status,
          last_login,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Since we can't access auth.users from client, we'll work with what we have
      // For email, we'll need to implement a different approach or use the current user's session
      const usersWithRoles = profiles?.map(profile => {
        const roles = userRoles?.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role) || [];
        
        return {
          id: profile.user_id,
          email: profile.user_id, // We'll show user ID instead of email since we can't access auth.users
          first_name: profile.first_name || undefined,
          last_name: profile.last_name || undefined,
          phone: profile.phone || undefined,
          avatar_url: profile.avatar_url || undefined,
          status: (profile.status as 'active' | 'suspended' | 'pending') || 'active',
          last_login: profile.last_login || undefined,
          created_at: profile.created_at,
          roles: roles as string[]
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch users: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required to update user status",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${status === 'active' ? 'activated' : 'suspended'} successfully!`
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user status: " + error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user', action: 'add' | 'remove') => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required to update user roles",
        variant: "destructive"
      });
      return;
    }

    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Role ${action === 'add' ? 'added' : 'removed'} successfully!`
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user role: " + error.message,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, propertyId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setTotalFiles(files.length);
    setCurrentFile(0);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFile(i + 1);
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
        
        // Update progress
        const progressPercent = ((i + 1) / files.length) * 100;
        setUploadProgress(progressPercent);
      }

      toast({
        title: "Success",
        description: "Images uploaded successfully!"
      });

      fetchPropertyImages(propertyId);
      fetchAllPropertyImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload images: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
      setCurrentFile(0);
      setTotalFiles(0);
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
      fetchAllPropertyImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete image: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSetPrimaryImage = async (imageId: string, propertyId: string) => {
    try {
      // First, set all images for this property to not primary
      const { error: clearError } = await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId);

      if (clearError) throw clearError;

      // Then set the selected image as primary
      const { error: setPrimaryError } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (setPrimaryError) throw setPrimaryError;

      toast({
        title: "Success",
        description: "Primary image updated successfully!"
      });

      if (selectedProperty) {
        fetchPropertyImages(selectedProperty.id);
      }
      fetchAllPropertyImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to set primary image: " + error.message,
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

  // Hero Images Management Functions
  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const heroData = {
        title: heroFormData.title,
        description: heroFormData.description || null,
        display_order: parseInt(heroFormData.display_order),
        is_active: heroFormData.is_active,
        image_url: '' // Will be updated after image upload
      };

      let result;
      if (selectedHeroImage) {
        result = await supabase
          .from('hero_images')
          .update(heroData)
          .eq('id', selectedHeroImage.id);
      } else {
        result = await supabase
          .from('hero_images')
          .insert(heroData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Hero image ${selectedHeroImage ? 'updated' : 'created'} successfully!`
      });

      setIsHeroDialogOpen(false);
      resetHeroForm();
      fetchHeroImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save hero image: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHeroImage = async (heroId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', heroId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hero image deleted successfully!"
      });

      fetchHeroImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete hero image: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const editHeroImage = (heroImage: HeroImage) => {
    setSelectedHeroImage(heroImage);
    setHeroFormData({
      title: heroImage.title,
      description: heroImage.description || '',
      display_order: heroImage.display_order.toString(),
      is_active: heroImage.is_active
    });
    setIsHeroDialogOpen(true);
  };

  const resetHeroForm = () => {
    setSelectedHeroImage(null);
    setHeroFormData({
      title: '',
      description: '',
      display_order: '0',
      is_active: true
    });
  };

  const handleHeroImageUpload = async (files: FileList, heroId?: string) => {
    if (files.length === 0) return;

    setUploadingHeroImages(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(filePath);

      if (heroId) {
        // Update existing hero image
        const { error: updateError } = await supabase
          .from('hero_images')
          .update({ image_url: publicUrlData.publicUrl })
          .eq('id', heroId);

        if (updateError) throw updateError;
      } else {
        // Create new hero image with uploaded image
        const { error: insertError } = await supabase
          .from('hero_images')
          .insert({
            title: heroFormData.title || 'New Hero Image',
            description: heroFormData.description,
            image_url: publicUrlData.publicUrl,
            display_order: parseInt(heroFormData.display_order),
            is_active: heroFormData.is_active
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Hero image uploaded successfully!"
      });

      fetchHeroImages();
      resetHeroForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload hero image: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingHeroImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Admin Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Back to Site</span>
              </Link>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-6">
                <span className="text-sm font-medium text-muted-foreground">Admin Panel</span>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={activeSection === 'properties' ? "text-primary bg-primary/10" : "text-muted-foreground"}
                    onClick={() => setActiveSection('properties')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Properties
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={activeSection === 'users' ? "text-primary bg-primary/10" : "text-muted-foreground"}
                    onClick={() => setActiveSection('users')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={activeSection === 'settings' ? "text-primary bg-primary/10" : "text-muted-foreground"}
                    onClick={() => setActiveSection('settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm} 
                  className="h-10 px-6"
                  style={{ display: activeSection === 'properties' ? 'flex' : 'none' }}
                >
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
                        {uploadingImages && (
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Uploading {currentFile} of {totalFiles} files...</span>
                              <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                          </div>
                        )}
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
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeSection === 'properties' && 'Property Management'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'settings' && 'Admin Settings'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeSection === 'properties' && 'Manage your property listings and details'}
            {activeSection === 'users' && 'Manage user accounts and permissions'}
            {activeSection === 'settings' && 'Configure application settings'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeSection === 'properties' && (
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="images">Image Management</TabsTrigger>
              <TabsTrigger value="hero">Hero Carousel</TabsTrigger>
            </TabsList>

          <TabsContent value="properties" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {properties.length}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Properties</p>
                </CardContent>
              </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {properties.filter(p => p.status === 'For Sale').length}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">For Sale</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {properties.filter(p => p.is_featured).length}
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Featured</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {properties.filter(p => p.status === 'Sold').length}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400">Sold</p>
            </CardContent>
          </Card>
        </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold leading-tight mb-1">
                          {property.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(property)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-foreground">
                    ${property.price.toLocaleString()}
                  </p>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <span className="font-medium">{property.bedrooms}</span> beds
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">{property.bathrooms}</span> baths
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium">{property.sqft.toLocaleString()}</span> sqft
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {property.property_type}
                    </Badge>
                    <Badge 
                      variant={property.status === 'For Sale' ? 'default' : property.status === 'Sold' ? 'destructive' : 'outline'} 
                      className="text-xs px-2 py-1"
                    >
                      {property.status}
                    </Badge>
                    {property.is_featured && (
                      <Badge variant="destructive" className="text-xs px-2 py-1">
                        ⭐ Featured
                      </Badge>
                    )}
                    {property.price > 600000 && (
                      <Badge className="text-xs px-2 py-1 bg-amber-100 text-amber-800 border-amber-200">
                        <Crown className="w-3 h-3 mr-1" />
                        Luxury
                      </Badge>
                    )}
                  </div>
                  {property.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
            </div>

            {/* Empty State */}
            {properties.length === 0 && !isLoading && (
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-sm">
                    Get started by adding your first property listing to the system.
                  </p>
                  <Button onClick={resetForm} className="h-9 px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Property
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Image Management</h2>
              <p className="text-muted-foreground">Upload and manage images for all your properties</p>
            </div>

            <div className="grid gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {property.title}
                          {property.price > 600000 && (
                            <Badge className="text-xs px-2 py-1 bg-amber-100 text-amber-800 border-amber-200">
                              <Crown className="w-3 h-3 mr-1" />
                              Luxury
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={property.is_featured ? "default" : "secondary"}>
                          {property.is_featured ? "Featured" : "Standard"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ${property.price.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Property Images</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            id={`upload-${property.id}`}
                            onChange={async (e) => {
                              await handleImageUpload(e, property.id);
                              // Clear the input to allow re-uploading the same file
                              e.target.value = '';
                            }}
                            disabled={uploadingImages}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            disabled={uploadingImages}
                          >
                            <label htmlFor={`upload-${property.id}`} className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingImages ? "Uploading..." : "Add Images"}
                            </label>
                          </Button>
                        </div>
                        
                        {/* Upload Progress */}
                        {uploadingImages && (
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Uploading {currentFile} of {totalFiles} files...</span>
                              <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                          </div>
                        )}
                      </div>
                      
                      {/* Images Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {(allPropertyImages[property.id] || []).map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image_url}
                              alt="Property"
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1">
                              {!image.is_primary && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleSetPrimaryImage(image.id, property.id)}
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeleteImage(image.id, image.image_url)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {image.is_primary && (
                              <Badge className="absolute top-1 left-1 text-xs py-0 px-1">
                                Primary
                              </Badge>
                            )}
                          </div>
                        ))}
                        
                        {/* Empty state for no images */}
                        {(!allPropertyImages[property.id] || allPropertyImages[property.id].length === 0) && (
                          <div className="col-span-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                            <Image className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No images uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hero" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Hero Carousel Management</h2>
              <p className="text-muted-foreground">Manage images for the homepage hero carousel</p>
            </div>

            {/* Hero Images Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Hero Images</h3>
                <Badge variant="secondary">{heroImages.length} images</Badge>
              </div>
              <Dialog open={isHeroDialogOpen} onOpenChange={setIsHeroDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetHeroForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hero Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedHeroImage ? 'Edit Hero Image' : 'Add Hero Image'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleHeroSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="hero-title">Title</Label>
                      <Input
                        id="hero-title"
                        value={heroFormData.title}
                        onChange={(e) => setHeroFormData({...heroFormData, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-description">Description</Label>
                      <Textarea
                        id="hero-description"
                        value={heroFormData.description}
                        onChange={(e) => setHeroFormData({...heroFormData, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-order">Display Order</Label>
                      <Input
                        id="hero-order"
                        type="number"
                        value={heroFormData.display_order}
                        onChange={(e) => setHeroFormData({...heroFormData, display_order: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={heroFormData.is_active}
                        onCheckedChange={(checked) => setHeroFormData({...heroFormData, is_active: checked})}
                      />
                      <Label>Active</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsHeroDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : (selectedHeroImage ? "Update" : "Create")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Hero Images Grid */}
            <div className="grid gap-6">
              {heroImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {heroImages.map((heroImage) => (
                    <Card key={heroImage.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        {heroImage.image_url ? (
                          <img 
                            src={heroImage.image_url} 
                            alt={heroImage.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Image className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          {!heroImage.is_active && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Inactive
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            Order: {heroImage.display_order}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{heroImage.title}</h4>
                        {heroImage.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {heroImage.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editHeroImage(heroImage)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteHeroImage(heroImage.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`hero-upload-${heroImage.id}`}
                              onChange={(e) => e.target.files && handleHeroImageUpload(e.target.files, heroImage.id)}
                            />
                            <Button 
                              size="sm"
                              variant="secondary"
                              onClick={() => document.getElementById(`hero-upload-${heroImage.id}`)?.click()}
                              disabled={uploadingHeroImages}
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              {uploadingHeroImages ? "Uploading..." : "Upload"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Hero Images</h3>
                      <p className="text-muted-foreground mb-4">
                        Add images for your homepage hero carousel to showcase your best properties.
                      </p>
                      <Button onClick={resetHeroForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Hero Image
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Upload Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Quick Upload
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag and drop images or click to upload directly to hero carousel
                </p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="hero-quick-upload"
                    onChange={(e) => e.target.files && e.target.files.length > 0 && handleHeroImageUpload(e.target.files)}
                  />
                  <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload Hero Images</p>
                  <p className="text-muted-foreground mb-4">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                  <Button 
                    onClick={() => document.getElementById('hero-quick-upload')?.click()}
                    disabled={uploadingHeroImages}
                  >
                    {uploadingHeroImages ? "Uploading..." : "Choose Files"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}

        {activeSection === 'users' && (
          <div className="space-y-6">
            {!isAdmin ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
                    <p className="text-muted-foreground">You need admin privileges to access user management features.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {users.length}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {users.filter(u => u.status === 'active').length}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">Active Users</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {users.filter(u => u.roles.includes('admin')).length}
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Admins</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {users.filter(u => u.status === 'suspended').length}
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Suspended</p>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <p className="text-sm text-muted-foreground">Manage user accounts, roles, and permissions</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name} 
                            {(!user.first_name && !user.last_name) && 'User Profile'}
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {user.email}</div>
                          <div className="flex space-x-1 mt-1">
                            {user.roles.map(role => (
                              <Badge 
                                key={role} 
                                variant={role === 'admin' ? 'default' : role === 'moderator' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                                {role === 'moderator' && <Shield className="w-3 h-3 mr-1" />}
                                {role}
                              </Badge>
                            ))}
                            <Badge 
                              variant={user.status === 'active' ? 'secondary' : user.status === 'suspended' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Role Management */}
                        {!user.roles.includes('admin') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, 'admin', 'add')}
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            Make Admin
                          </Button>
                        )}
                        
                        {user.roles.includes('admin') && user.roles.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, 'admin', 'remove')}
                          >
                            Remove Admin
                          </Button>
                        )}
                        
                        {/* Status Management */}
                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'active')}
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {users.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No users found</h3>
                      <p className="text-muted-foreground">Users will appear here when they sign up for your application.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Site Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Site Configuration
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">General site settings and information</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Site Name</label>
                    <Input 
                      defaultValue="Premier Real Estate" 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Site Description</label>
                    <Input 
                      defaultValue="Your trusted partner in real estate"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Email</label>
                    <Input 
                      type="email"
                      defaultValue="info@premierrealestate.com"
                      className="mt-1"
                    />
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>

              {/* Authentication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Authentication
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Manage authentication and security settings</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow User Registration</p>
                      <p className="text-sm text-muted-foreground">Let users create new accounts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Property Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    Property Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Configure property listing options</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Property Type</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>House</option>
                      <option>Apartment</option>
                      <option>Condo</option>
                      <option>Townhouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Images per Property</label>
                    <Input 
                      type="number"
                      defaultValue="10"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-approve Listings</p>
                      <p className="text-sm text-muted-foreground">Automatically approve new property listings</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    System Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">System status and information</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Database Status</p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-600">Connected</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Storage Usage</p>
                      <p className="font-medium mt-1">2.4 GB / 10 GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Properties</p>
                      <p className="font-medium mt-1">{properties.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Users</p>
                      <p className="font-medium mt-1">{users.length}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && properties.length === 0 && (
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 bg-muted rounded w-1/3 mb-3"></div>
                    <div className="flex space-x-4 mb-3">
                      <div className="h-3 bg-muted rounded w-12"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-5 bg-muted rounded w-16"></div>
                      <div className="h-5 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;