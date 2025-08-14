import { Edit, Trash2, Star, MapPin, Bed, Bath, Square, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  const primaryImage = images.find(img => img.is_primary) || images[0];
  
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
          
          {/* Overlays */}
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