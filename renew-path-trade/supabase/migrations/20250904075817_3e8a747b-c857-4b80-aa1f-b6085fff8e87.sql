-- Add policy to allow viewing recycler profiles publicly
CREATE POLICY "Anyone can view recycler profiles" 
ON public.profiles 
FOR SELECT 
USING (role = 'recycler');