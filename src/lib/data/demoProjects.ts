import type { Project } from '$lib/types';

/**
 * Centralized demo property data — single source of truth.
 * Used by: /projects, /projects/[id], /favorites, search index.
 * In production (with Supabase configured), these serve as fallback when
 * the database is empty or unreachable.
 */
export const demoProjects: Project[] = [
	{ id: 'koch-1', title: '2, 3 & 4 Bedroom Apartments', description: 'Modern apartments in the heart of Westlands with excellent finishes, spacious balconies, and proximity to shopping centers.', location: 'Westlands, Nairobi', price: '17700000', bedrooms: '3', bathrooms: '2', imageUrl: '/lib/assets/project-1.jpg', category: 'Apartment', status: 'published', featured: true, amenities: 'Parking, Lift, Generator, Borehole, Gym, CCTV' },
	{ id: 'koch-2', title: '2, 3, 4 & 5 Bedroom Apartments', description: 'Spacious family apartments on Riara Road with DSQs, modern kitchen fittings, and secure gated community.', location: 'Riara Road, Nairobi', price: '10700000', bedrooms: '3', bathrooms: '2', imageUrl: '/lib/assets/apartments-2.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Garden, Security, Play Area' },
	{ id: 'koch-3', title: '3, 4 & 5 Bedroom Apartments with DSQs', description: 'Luxury apartments in Kilimani featuring servant quarters, high-end finishes, and rooftop terrace with city views.', location: 'Kilimani, Nairobi', price: '29400000', bedrooms: '4', bathrooms: '3', imageUrl: '/lib/assets/apartments-3.jpg', category: 'Apartment', status: 'published', featured: true, amenities: 'DSQ, Swimming Pool, Gym, Parking, Solar' },
	{ id: 'koch-4', title: '1, 2 & 3 Bedroom Apartment', description: 'Affordable apartments in Kilimani suitable for young professionals and small families. Close to schools and hospitals.', location: 'Kilimani, Nairobi', price: '5900000', bedrooms: '2', bathrooms: '1', imageUrl: '/lib/assets/apartments-1.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'Parking, Security, Water Storage' },
	{ id: 'koch-5', title: '1 Bedroom Apartment', description: 'Stylish 1-bedroom apartment in Westlands perfect for singles. Modern finishes with balcony and city views.', location: 'Westlands, Nairobi', price: '21900000', bedrooms: '1', bathrooms: '1', imageUrl: '/lib/assets/apartments-4.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'Gym, Parking, Rooftop Terrace, Security' },
	{ id: 'koch-6', title: '5 Bedroom Villa', description: 'Magnificent 5-bedroom villa in Loresho sitting on half-acre land. Features swimming pool, mature garden, and guest house.', location: 'Loresho, Nairobi', price: '150000000', bedrooms: '5', bathrooms: '6', imageUrl: '/lib/assets/project-2.jpg', category: 'Villa', status: 'published', featured: true, amenities: 'Swimming Pool, Garden, Guest House, Parking, Security' },
	{ id: 'koch-7', title: '4 Bedroom Villa', description: 'Elegant 4-bedroom villa in Kitisuru with panoramic views. Open-plan living, modern kitchen, and expansive garden.', location: 'Kitisuru, Nairobi', price: '85000000', bedrooms: '4', bathrooms: '5', imageUrl: '/lib/assets/project-3.jpg', category: 'Villa', status: 'published', featured: true, amenities: 'Garden, Parking, Staff Quarters, Security, View' },
	{ id: 'koch-8', title: '4 Bedroom Townhouses', description: 'Modern townhouses in Langata with shared swimming pool and playground. Perfect for families.', location: 'Langata, Nairobi', price: '35900000', bedrooms: '4', bathrooms: '4', imageUrl: '/lib/assets/amenities-1.jpg', category: 'Townhouse', status: 'published', featured: false, amenities: 'Swimming Pool, Garden, Parking, Playground' },
	{ id: 'koch-9', title: '3 Bedroom Apartment With DSQ', description: 'Executive 3-bedroom apartment in Westlands with servant quarters. Close to Sarit Centre and international schools.', location: 'Westlands, Nairobi', price: '22100000', bedrooms: '3', bathrooms: '3', imageUrl: '/lib/assets/amenities-2.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Lift, Generator, Security' },
	{ id: 'koch-10', title: '4 Bedroom Apartment with DSQ', description: 'Spacious 4-bedroom apartment in Kileleshwa with DSQ, master ensuite, and modern finishes throughout.', location: 'Kileleshwa, Nairobi', price: '22000000', bedrooms: '4', bathrooms: '4', imageUrl: '/lib/assets/amenities-3.jpg', category: 'Apartment', status: 'published', featured: false, amenities: 'DSQ, Parking, Gym, Lift, Security' },
	{ id: 'koch-11', title: '5 Bedroom Apartment With DSQ', description: 'Luxurious 5-bedroom penthouse in Kileleshwa with panoramic views, private lift, and rooftop terrace.', location: 'Kileleshwa, Nairobi', price: '41000000', bedrooms: '5', bathrooms: '6', imageUrl: '/lib/assets/amenities-4.jpg', category: 'Penthouse', status: 'published', featured: true, amenities: 'DSQ, Private Lift, Rooftop Terrace, Parking, Gym' },
	{ id: 'koch-12', title: 'Studio And 1 Bedroom Apartment', description: 'Compact studio and 1-bedroom units in Kilimani ideal for students and young professionals.', location: 'Kilimani, Nairobi', price: '6400000', bedrooms: '1', bathrooms: '1', imageUrl: '/lib/assets/amenities-5.jpg', category: 'Studio', status: 'published', featured: false, amenities: 'Parking, Security, Internet Ready' }
];

/** Gallery stock images (placeholder for a future project_images table). */
export const galleryStockImages = [
	'/lib/assets/project-1.jpg',
	'/lib/assets/project-2.jpg',
	'/lib/assets/project-3.jpg',
	'/lib/assets/apartments-1.jpg',
	'/lib/assets/apartments-2.jpg',
	'/lib/assets/apartments-3.jpg',
	'/lib/assets/apartments-4.jpg',
	'/lib/assets/amenities-1.jpg',
	'/lib/assets/amenities-2.jpg',
	'/lib/assets/amenities-3.jpg',
	'/lib/assets/amenities-4.jpg',
	'/lib/assets/amenities-5.jpg'
];

/** Build a 6-image gallery from a project's primary image + complementary stock. */
export function buildGallery(primaryImage: string): string[] {
	return [primaryImage, ...galleryStockImages.filter((c) => c !== primaryImage)].slice(0, 6);
}

/** Get the demo project by ID (for /projects/[id] offline fallback). */
export function getDemoProject(id: string): Project | undefined {
	return demoProjects.find((p) => p.id === id);
}

/** Get related demo projects by category (for /projects/[id] related section). */
export function getRelatedDemoProjects(id: string, category: string, limit = 3): Project[] {
	return demoProjects.filter((p) => p.id !== id && p.category === category).slice(0, limit);
}
