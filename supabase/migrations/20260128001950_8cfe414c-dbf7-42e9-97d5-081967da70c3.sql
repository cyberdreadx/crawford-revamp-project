-- Add unique constraint on listing_id for upsert support
ALTER TABLE public.properties ADD CONSTRAINT properties_listing_id_unique UNIQUE (listing_id);