-- Drop the misleading public SELECT policy that grants access to all columns
DROP POLICY IF EXISTS "Public can view property details (excluding agent contact)" ON public.properties;

-- The admin policy remains, granting full access only to admins:
-- "Admin users can view all property data including agent contact"
-- This ensures agent_phone and agent_email are only accessible to authenticated admins

-- Application code now handles public access by explicitly selecting
-- only non-sensitive columns (id, title, location, price, etc.)
-- without agent_phone and agent_email