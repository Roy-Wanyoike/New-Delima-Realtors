-- ============================================================================
-- Delima Realtors — Seed data (demo listings)
-- ----------------------------------------------------------------------------
-- Apply with:  psql "$DATABASE_URL" -f supabase/seed.sql
-- Run AFTER schema.sql + rls.sql. Optional.
-- Idempotent: uses ON CONFLICT DO NOTHING keyed by a stable title.
-- ============================================================================

insert into public.projects
    (title, description, location, price, bedrooms, bathrooms, image_url, category, status, featured, amenities)
values
    ('2, 3 & 4 Bedroom Apartments',
     'Modern apartments in the heart of Westlands with excellent finishes, spacious balconies, and proximity to shopping centers.',
     'Westlands, Nairobi', '17700000', '3', '2', '/lib/assets/project-1.jpg', 'Apartment', 'published', true,
     'Parking, Lift, Generator, Borehole, Gym, CCTV'),
    ('3, 4 & 5 Bedroom Apartments with DSQs',
     'Luxury apartments in Kilimani featuring servant quarters, high-end finishes, and rooftop terrace with city views.',
     'Kilimani, Nairobi', '29400000', '4', '3', '/lib/assets/apartments-3.jpg', 'Apartment', 'published', true,
     'DSQ, Swimming Pool, Gym, Parking, Solar'),
    ('5 Bedroom Villa',
     'Magnificent 5-bedroom villa in Loresho sitting on half-acre land. Features swimming pool, mature garden, and guest house.',
     'Loresho, Nairobi', '150000000', '5', '6', '/lib/assets/project-2.jpg', 'Villa', 'published', true,
     'Swimming Pool, Garden, Guest House, Parking, Security'),
    ('4 Bedroom Villa',
     'Elegant 4-bedroom villa in Kitisuru with panoramic views. Open-plan living, modern kitchen, and expansive garden.',
     'Kitisuru, Nairobi', '85000000', '4', '5', '/lib/assets/project-3.jpg', 'Villa', 'published', true,
     'Garden, Parking, Staff Quarters, Security, View'),
    ('4 Bedroom Townhouses',
     'Modern townhouses in Langata with shared swimming pool and playground. Perfect for families.',
     'Langata, Nairobi', '35900000', '4', '4', '/lib/assets/amenities-1.jpg', 'Townhouse', 'published', false,
     'Swimming Pool, Garden, Parking, Playground'),
    ('5 Bedroom Penthouse',
     'Luxurious penthouse in Kileleshwa with panoramic views, private lift, and rooftop terrace.',
     'Kileleshwa, Nairobi', '41000000', '5', '6', '/lib/assets/amenities-4.jpg', 'Penthouse', 'published', true,
     'DSQ, Private Lift, Rooftop Terrace, Parking, Gym')
on conflict do nothing;
