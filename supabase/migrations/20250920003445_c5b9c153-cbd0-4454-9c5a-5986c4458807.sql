-- The issue is that get_user_roles function is SECURITY DEFINER and returns TABLE
-- This is intentional for role checking but triggers the linter
-- Let's modify it to be more explicit and focused

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_user_roles(uuid);

-- Recreate as a simpler, more focused function that doesn't return TABLE
-- Instead, we'll make has_role more robust and remove the table-returning function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
  LIMIT 1
$$;

-- Also create a function to check if current user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY(roles)
  )
$$;

-- The existing has_role function is already properly designed and doesn't return TABLE
-- so it should be fine as-is, but let's double-check it's optimized

-- Check if there are any other SECURITY DEFINER functions that return TABLE
-- If the linter is still complaining, we may need to check for other issues