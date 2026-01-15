-- Delete property images for MLS listings first (foreign key constraint)
DELETE FROM property_images 
WHERE property_id IN (SELECT id FROM properties WHERE is_mls_listing = true);

-- Delete MLS properties
DELETE FROM properties WHERE is_mls_listing = true;

-- Clear sync logs to start fresh
DELETE FROM mls_sync_log;