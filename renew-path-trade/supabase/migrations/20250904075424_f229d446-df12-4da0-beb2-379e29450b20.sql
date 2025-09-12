-- Add avatar_url field to profiles table for recycler pictures
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT;