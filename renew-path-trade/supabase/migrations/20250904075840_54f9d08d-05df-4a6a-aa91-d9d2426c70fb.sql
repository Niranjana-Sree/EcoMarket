-- Allow everyone to view recycler profiles publicly
CREATE POLICY "Public can view recycler profiles" 
ON public.profiles 
FOR SELECT 
USING (role = 'recycler');