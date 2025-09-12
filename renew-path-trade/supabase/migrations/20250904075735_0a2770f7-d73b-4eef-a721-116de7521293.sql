-- Insert sample recycler profiles
INSERT INTO public.profiles (id, name, mobile, address, role, avatar_url) VALUES 
(gen_random_uuid(), 'GreenCycle Solutions', '+91 9876543210', '123 Eco Street, Green Valley, Mumbai', 'recycler', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'EcoWaste Management', '+91 8765432109', '456 Recycle Road, Sustainable City, Delhi', 'recycler', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'Planet Recyclers Pvt Ltd', '+91 7654321098', '789 Environment Lane, Clean Town, Bangalore', 'recycler', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'Zero Waste Experts', '+91 6543210987', '321 Nature Avenue, Earth City, Chennai', 'recycler', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
(gen_random_uuid(), 'Circular Economy Hub', '+91 5432109876', '654 Sustainability Street, Green Park, Pune', 'recycler', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face');