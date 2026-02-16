DELETE FROM public.property_images WHERE property_id IN (SELECT id FROM public.properties WHERE is_mls_listing = true);
DELETE FROM public.properties WHERE is_mls_listing = true;