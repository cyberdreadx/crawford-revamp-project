-- Delete property images for MLS listings first (foreign key constraint)
DELETE FROM public.property_images 
WHERE property_id IN (SELECT id FROM public.properties WHERE is_mls_listing = true);

-- Delete all MLS-synced properties (keeps 13 manual listings)
DELETE FROM public.properties WHERE is_mls_listing = true;