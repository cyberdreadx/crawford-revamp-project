import { useState, useRef } from 'react';
import { Edit, Trash2, Star, MapPin, Bed, Bath, Square, Calendar, Cloud, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  is_featured: boolean;
  created_at: string;
}

interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface PropertyCardProps {
  property: Property;
  images: PropertyImage[];
  onEdit: () => void;
  onDelete: () => void;
  featured?: boolean;
}

export const PropertyCard = ({ property, images, onEdit, onDelete, featured }: PropertyCardProps) => {
  const [isDriveDialogOpen, setIsDriveDialogOpen] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const primaryImage = images.find(img => img.is_primary) || images[0];
  
  const handleGoogleDriveSync = async () => {
    if (!driveUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Drive folder URL",
        variant: "destructive"
      });
      return;
    }

    // Extract folder ID from the URL
    const match = driveUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      toast({
        title: "Error",
        description: "Invalid Google Drive folder URL. Please use a valid folder link.",
        variant: "destructive"
      });
      return;
    }

    const folderId = match[1];
    setIsSyncing(true);

    try {
      const { data, error } = await supabase.functions.invoke('sync-property-images', {
        body: { folderId, propertyId: property.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Synced ${data.count} images from Google Drive`,
      });

      setIsDriveDialogOpen(false);
      setDriveUrl('');
      // Trigger a refresh of the parent component
      window.location.reload();
    } catch (error: any) {
      console.error('Google Drive sync error:', error);
      toast({
        title: "Error",
        description: "Failed to sync images: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let uploadedCount = 0;
      const newImages: { property_id: string; image_url: string; is_primary: boolean; display_order: number }[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file",
            description: `${file.name} is not an image file`,
            variant: "destructive"
          });
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${property.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${uploadError.message}`,
            variant: "destructive"
          });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        newImages.push({
          property_id: property.id,
          image_url: urlData.publicUrl,
          is_primary: images.length === 0 && uploadedCount === 0, // First image is primary if no existing images
          display_order: images.length + uploadedCount + 1
        });

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      // Insert image records into database
      if (newImages.length > 0) {
        const { error: insertError } = await supabase
          .from('property_images')
          .insert(newImages);

        if (insertError) {
          console.error('Database insert error:', insertError);
          toast({
            title: "Error",
            description: "Failed to save image records to database",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: `Uploaded ${newImages.length} image${newImages.length > 1 ? 's' : ''} successfully`,
          });
          // Refresh the page to show new images
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSquareFeet = (sqft: number) => {
    return new Intl.NumberFormat('en-US').format(sqft);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'for sale':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sold':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off market':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          
          {/* Status and Featured Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(property.status)} font-medium`}
            >
              {property.status}
            </Badge>
            {property.is_featured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>

          {/* Photo count */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/20 text-white border-0 backdrop-blur-sm">
              {images.length} photo{images.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              onClick={onEdit}
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDelete}
              className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-500 backdrop-blur-sm"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Image management buttons */}
          <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 bg-white/90 hover:bg-white backdrop-blur-sm text-xs px-2"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-1" />
              {isUploading ? `${uploadProgress}%` : 'Upload'}
            </Button>
            
            <Dialog open={isDriveDialogOpen} onOpenChange={setIsDriveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 bg-white/90 hover:bg-white backdrop-blur-sm text-xs px-2"
                  disabled={isSyncing}
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  {isSyncing ? 'Syncing...' : 'Drive'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sync from Google Drive</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="drive-url">Google Drive Folder URL</Label>
                    <Input
                      id="drive-url"
                      placeholder="https://drive.google.com/drive/folders/your-folder-id"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Make sure the folder is publicly accessible (Anyone with the link can view)
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDriveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGoogleDriveSync} disabled={isSyncing}>
                      {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sync Images
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Price */}
        <div className="text-2xl font-bold text-primary">
          {formatPrice(property.price)}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-1">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm line-clamp-1">{property.location}</span>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{formatSquareFeet(property.sqft)} sqft</span>
          </div>
        </div>

        {/* Property type and year */}
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline">{property.property_type}</Badge>
          {property.year_built && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{property.year_built}</span>
            </div>
          )}
        </div>

        {/* Key features preview */}
        {property.key_features && property.key_features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {property.key_features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {property.key_features.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{property.key_features.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};