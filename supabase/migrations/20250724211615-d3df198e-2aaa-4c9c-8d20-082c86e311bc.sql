-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3,1) NOT NULL,
  sqft INTEGER NOT NULL,
  year_built INTEGER,
  property_type TEXT NOT NULL DEFAULT 'House',
  status TEXT NOT NULL DEFAULT 'For Sale',
  description TEXT,
  key_features TEXT[],
  taxes DECIMAL(10,2),
  flood_zone TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_images table
CREATE TABLE public.property_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Create policies for properties (public read, admin write)
CREATE POLICY "Properties are viewable by everyone" 
ON public.properties 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert properties" 
ON public.properties 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update properties" 
ON public.properties 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete properties" 
ON public.properties 
FOR DELETE 
TO authenticated
USING (true);

-- Create policies for property_images
CREATE POLICY "Property images are viewable by everyone" 
ON public.property_images 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert property images" 
ON public.property_images 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update property images" 
ON public.property_images 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete property images" 
ON public.property_images 
FOR DELETE 
TO authenticated
USING (true);

-- Create storage policies
CREATE POLICY "Property images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can update property images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can delete property images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'property-images');

-- Create trigger for timestamps
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.properties (title, location, price, bedrooms, bathrooms, sqft, year_built, property_type, status, description, key_features, taxes, flood_zone, is_featured)
VALUES 
('Luxury Oceanfront Villa', 'Miami Beach, FL', 2850000.00, 4, 3.5, 3200, 2019, 'Villa', 'For Sale', 'Stunning oceanfront villa with panoramic views and modern amenities.', ARRAY['Ocean Views', 'Private Pool', 'Gourmet Kitchen', 'Master Suite'], 28500.00, 'Zone X', true),
('Modern Downtown Condo', 'Seattle, WA', 875000.00, 2, 2.0, 1450, 2021, 'Condo', 'For Sale', 'Contemporary condo in the heart of downtown with city views.', ARRAY['City Views', 'Gym Access', 'Rooftop Deck', 'In-unit Laundry'], 8750.00, 'Zone X', true),
('Historic Colonial Home', 'Boston, MA', 1250000.00, 5, 3.0, 2800, 1895, 'House', 'For Sale', 'Beautifully restored colonial home with original hardwood floors.', ARRAY['Original Details', 'Hardwood Floors', 'Large Yard', 'Updated Kitchen'], 15600.00, 'Zone X', true),
('Mountain Retreat Cabin', 'Aspen, CO', 1850000.00, 3, 2.5, 2100, 2018, 'Cabin', 'For Sale', 'Cozy mountain retreat with ski-in/ski-out access.', ARRAY['Ski Access', 'Mountain Views', 'Fireplace', 'Hot Tub'], 12400.00, 'Zone X', true),
('Waterfront Estate', 'Napa Valley, CA', 3200000.00, 6, 4.5, 4500, 2020, 'Estate', 'For Sale', 'Luxurious waterfront estate with vineyard views and wine cellar.', ARRAY['Vineyard Views', 'Wine Cellar', 'Pool & Spa', 'Guest House'], 32000.00, 'Zone X', true);

-- Insert sample images (using placeholder images)
INSERT INTO public.property_images (property_id, image_url, is_primary, display_order)
SELECT 
  p.id,
  '/placeholder.svg',
  true,
  0
FROM public.properties p;