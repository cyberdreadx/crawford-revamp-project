-- Create blog posts table for luxury market insights
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL DEFAULT 'market-insights',
  tags TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog posts
CREATE POLICY "Published blog posts are viewable by everyone" 
ON public.blog_posts 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION public.set_blog_post_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_blog_post_slug_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_blog_post_slug();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, publish_date DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Insert sample St. Pete luxury market insights
INSERT INTO public.blog_posts (
  title, 
  excerpt, 
  content, 
  category, 
  tags, 
  is_published, 
  is_featured,
  publish_date,
  author_id
) VALUES 
(
  'St. Petersburg Luxury Market Q4 2024 Report',
  'Discover the latest trends in St. Pete''s luxury real estate market, featuring record-breaking sales and emerging neighborhoods.',
  '# St. Petersburg Luxury Market Q4 2024 Report

## Market Overview

The St. Petersburg luxury real estate market continues to demonstrate remarkable resilience and growth in Q4 2024. With waterfront properties leading the charge, we''ve seen unprecedented demand across all luxury segments.

## Key Highlights

- **Average luxury home price**: $2.8M (+12% YoY)
- **Days on market**: 45 days (-15% from Q3)
- **Inventory levels**: Limited supply driving competitive market

## Emerging Neighborhoods

### Downtown St. Pete
The urban core continues to attract high-net-worth individuals seeking luxury condominiums with city amenities.

### Snell Isle
Prestigious waterfront community seeing renewed interest from international buyers.

### Old Northeast
Historic charm meets modern luxury in this established neighborhood.

## Investment Outlook

The St. Petersburg luxury market presents compelling opportunities for both domestic and international investors. Key factors driving growth include:

1. **Infrastructure Development**: Major city improvements enhancing property values
2. **Cultural Attractions**: World-class museums and arts district
3. **Waterfront Access**: Unparalleled bay and gulf access
4. **Business Climate**: Growing tech and finance sectors

## Conclusion

As we move into 2025, St. Petersburg''s luxury market is positioned for continued growth. Limited inventory and strong demand fundamentals support our positive outlook for the coming year.',
  'market-insights',
  ARRAY['st-pete', 'luxury-market', 'real-estate-trends', 'investment'],
  true,
  true,
  now(),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Waterfront Living: The Crown Jewel of St. Pete Real Estate',
  'Explore why waterfront properties in St. Petersburg represent the pinnacle of luxury living in Florida.',
  '# Waterfront Living: The Crown Jewel of St. Pete Real Estate

St. Petersburg''s waterfront properties represent the absolute pinnacle of luxury living in the Tampa Bay area. With over 200 miles of waterfront and stunning views of Tampa Bay and the Gulf of Mexico, these properties offer an unparalleled lifestyle.

## Why Waterfront Properties Command Premium Prices

### Unobstructed Views
- Panoramic bay and gulf vistas
- Spectacular sunrises and sunsets
- Ever-changing water scenery

### Exclusive Amenities
- Private docks and boat slips
- Waterfront pools and entertainment areas
- Direct water access for recreation

### Investment Security
- Limited supply ensures value appreciation
- High rental income potential
- International buyer interest

## Featured Waterfront Communities

### Snell Isle
Historic island community with deep-water access and prestigious addresses.

### Bayway Isles
Modern luxury developments with state-of-the-art amenities.

### Tierra Verde
Private island living with championship golf and marina facilities.

## Market Trends

Waterfront properties in St. Pete have shown consistent appreciation, with luxury waterfront homes averaging 15-20% annual growth over the past three years.',
  'lifestyle',
  ARRAY['waterfront', 'luxury-living', 'st-pete', 'investment'],
  true,
  false,
  now() - INTERVAL '1 week',
  (SELECT id FROM auth.users LIMIT 1)
);