-- Fix security warnings by setting search_path for functions
ALTER FUNCTION public.generate_slug(text) SET search_path = public;
ALTER FUNCTION public.set_blog_post_slug() SET search_path = public;