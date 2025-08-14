import { useState, useEffect } from 'react';
import { Settings, Users, BarChart3, Shield, Globe, Database, Home, Upload, X, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PropertyManagement from '@/components/admin/PropertyManagement';

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
  const [users, setUsers] = useState<User[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedHeroImage, setSelectedHeroImage] = useState<HeroImage | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isHeroDialogOpen, setIsHeroDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingHeroImages, setUploadingHeroImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFile, setCurrentFile] = useState(0);
  const [activeSection, setActiveSection] = useState('properties');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

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
          .insert([heroData]);
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

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, heroId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!heroId) {
      toast({
        title: "Error",
        description: "Please save the hero image first before uploading images",
        variant: "destructive"
      });
      return;
    }

    setUploadingHeroImages(true);
    setTotalFiles(files.length);
    setCurrentFile(0);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(i + 1);
        setUploadProgress(((i + 1) / files.length) * 100);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('hero-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hero-images')
          .getPublicUrl(fileName);

        // Update hero image with the uploaded image URL
        const { error: updateError } = await supabase
          .from('hero_images')
          .update({ image_url: publicUrl })
          .eq('id', heroId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: "Hero images uploaded successfully!"
      });

      fetchHeroImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload images: " + error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingHeroImages(false);
    }
  };

  const deleteHeroImage = async (heroId: string) => {
    if (!confirm('Are you sure you want to delete this hero image?')) return;

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
    }
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

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Please log in to access the admin panel.</p>
            <Link to="/auth">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your application settings and content</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Site
            </Button>
          </Link>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="properties" className="gap-2">
              <Home className="h-4 w-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-2">
              <Image className="h-4 w-4" />
              Hero Images
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2" disabled={!isAdmin}>
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <PropertyManagement />
          </TabsContent>

          <TabsContent value="hero" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Hero Images</h2>
              <Dialog open={isHeroDialogOpen} onOpenChange={setIsHeroDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setSelectedHeroImage(null); resetHeroForm(); }}>
                    Add Hero Image
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedHeroImage ? 'Edit Hero Image' : 'Add New Hero Image'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleHeroSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title">Title</Label>
                      <Input
                        id="hero-title"
                        value={heroFormData.title}
                        onChange={(e) => setHeroFormData({ ...heroFormData, title: e.target.value })}
                        placeholder="Hero image title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-description">Description</Label>
                      <Textarea
                        id="hero-description"
                        value={heroFormData.description}
                        onChange={(e) => setHeroFormData({ ...heroFormData, description: e.target.value })}
                        placeholder="Hero image description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-order">Display Order</Label>
                      <Input
                        id="hero-order"
                        type="number"
                        value={heroFormData.display_order}
                        onChange={(e) => setHeroFormData({ ...heroFormData, display_order: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hero-active"
                        checked={heroFormData.is_active}
                        onCheckedChange={(checked) => setHeroFormData({ ...heroFormData, is_active: checked })}
                      />
                      <Label htmlFor="hero-active">Active</Label>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsHeroDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : selectedHeroImage ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroImages.map((heroImage) => (
                <Card key={heroImage.id}>
                  <CardHeader className="p-0">
                    {heroImage.image_url ? (
                      <img
                        src={heroImage.image_url}
                        alt={heroImage.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                        <span className="text-muted-foreground">No Image</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{heroImage.title}</h3>
                      {heroImage.description && (
                        <p className="text-sm text-muted-foreground">{heroImage.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant={heroImage.is_active ? 'default' : 'secondary'}>
                          {heroImage.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Order: {heroImage.display_order}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedHeroImage(heroImage);
                          setHeroFormData({
                            title: heroImage.title,
                            description: heroImage.description || '',
                            display_order: heroImage.display_order.toString(),
                            is_active: heroImage.is_active
                          });
                          setIsHeroDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      {!heroImage.image_url && (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id={`hero-upload-${heroImage.id}`}
                            accept="image/*"
                            onChange={(e) => handleHeroImageUpload(e, heroImage.id)}
                            className="hidden"
                          />
                          <Button
                            size="sm"
                            onClick={() => document.getElementById(`hero-upload-${heroImage.id}`)?.click()}
                            disabled={uploadingHeroImages}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteHeroImage(heroImage.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {uploadingHeroImages && (
              <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
                <div className="text-sm font-medium mb-2">
                  Uploading {currentFile} of {totalFiles} files...
                </div>
                <Progress value={uploadProgress} className="w-64" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {!isAdmin ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
                  <p className="text-muted-foreground">You need admin privileges to access user management.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <Button onClick={fetchUsers} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Refresh Users'}
                  </Button>
                </div>

                <div className="grid gap-6">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user.email}
                            </h3>
                            <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                            {user.phone && (
                              <p className="text-sm text-muted-foreground">Phone: {user.phone}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {user.roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant={user.status === 'active' ? 'destructive' : 'default'}
                              onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics features will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Security settings will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Application Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Application settings will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;