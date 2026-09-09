import { blogPosts } from './blog';
import { agents } from './agents';

export interface SearchResult {
	type: 'property' | 'blog' | 'agent' | 'page';
	title: string;
	subtitle?: string;
	href: string;
	icon: string;
}

// Static demo properties for the search index (mirrors the projects page demo data).
const demoProperties = [
	{ id: 'koch-1', title: '2, 3 & 4 Bedroom Apartments', location: 'Westlands, Nairobi', price: '17700000', imageUrl: '/lib/assets/project-1.jpg', category: 'Apartment' },
	{ id: 'koch-2', title: '2, 3, 4 & 5 Bedroom Apartments', location: 'Riara Road, Nairobi', price: '10700000', imageUrl: '/lib/assets/apartments-2.jpg', category: 'Apartment' },
	{ id: 'koch-3', title: '3, 4 & 5 Bedroom Apartments with DSQs', location: 'Kilimani, Nairobi', price: '29400000', imageUrl: '/lib/assets/apartments-3.jpg', category: 'Apartment' },
	{ id: 'koch-4', title: '1, 2 & 3 Bedroom Apartment', location: 'Kilimani, Nairobi', price: '5900000', imageUrl: '/lib/assets/apartments-1.jpg', category: 'Apartment' },
	{ id: 'koch-5', title: '1 Bedroom Apartment', location: 'Westlands, Nairobi', price: '21900000', imageUrl: '/lib/assets/apartments-4.jpg', category: 'Apartment' },
	{ id: 'koch-6', title: '5 Bedroom Villa', location: 'Loresho, Nairobi', price: '150000000', imageUrl: '/lib/assets/project-2.jpg', category: 'Villa' },
	{ id: 'koch-7', title: '4 Bedroom Villa', location: 'Kitisuru, Nairobi', price: '85000000', imageUrl: '/lib/assets/project-3.jpg', category: 'Villa' },
	{ id: 'koch-8', title: '4 Bedroom Townhouses', location: 'Langata, Nairobi', price: '35900000', imageUrl: '/lib/assets/amenities-1.jpg', category: 'Townhouse' },
	{ id: 'koch-9', title: '3 Bedroom Apartment With DSQ', location: 'Westlands, Nairobi', price: '22100000', imageUrl: '/lib/assets/amenities-2.jpg', category: 'Apartment' },
	{ id: 'koch-10', title: '4 Bedroom Apartment with DSQ', location: 'Kileleshwa, Nairobi', price: '22000000', imageUrl: '/lib/assets/amenities-3.jpg', category: 'Apartment' },
	{ id: 'koch-11', title: '5 Bedroom Apartment With DSQ', location: 'Kileleshwa, Nairobi', price: '41000000', imageUrl: '/lib/assets/amenities-4.jpg', category: 'Penthouse' },
	{ id: 'koch-12', title: 'Studio And 1 Bedroom Apartment', location: 'Kilimani, Nairobi', price: '6400000', imageUrl: '/lib/assets/amenities-5.jpg', category: 'Studio' }
];

const staticPages: SearchResult[] = [
	{ type: 'page', title: 'Home', subtitle: 'Delima Realtors homepage', href: '/', icon: '🏠' },
	{ type: 'page', title: 'Properties', subtitle: 'Browse all listings', href: '/projects', icon: '🏘️' },
	{ type: 'page', title: 'Neighborhoods', subtitle: 'Nairobi area guides', href: '/neighborhoods', icon: '🗺️' },
	{ type: 'page', title: 'Agents', subtitle: 'Meet our team', href: '/agents', icon: '👥' },
	{ type: 'page', title: 'Blog', subtitle: 'Guides & market insights', href: '/blog', icon: '📖' },
	{ type: 'page', title: 'Contact', subtitle: 'Get in touch', href: '/contact', icon: '✉️' },
	{ type: 'page', title: 'Favorites', subtitle: 'Your saved properties', href: '/favorites', icon: '❤️' },
	{ type: 'page', title: 'Compare', subtitle: 'Side-by-side comparison', href: '/compare', icon: '⚖️' }
];

export function buildSearchIndex(): SearchResult[] {
	const propertyResults: SearchResult[] = demoProperties.map((p) => ({
		type: 'property',
		title: p.title,
		subtitle: `📍 ${p.location} · KES ${parseInt(p.price).toLocaleString()}`,
		href: `/projects/${p.id}`,
		icon: p.category === 'Villa' ? '🏡' : p.category === 'Penthouse' ? '🏙️' : '🏢'
	}));

	const blogResults: SearchResult[] = blogPosts.map((b) => ({
		type: 'blog',
		title: b.title,
		subtitle: `📰 ${b.category} · ${b.readTime}`,
		href: `/blog/${b.slug}`,
		icon: '📖'
	}));

	const agentResults: SearchResult[] = agents.map((a) => ({
		type: 'agent',
		title: a.name,
		subtitle: `👤 ${a.role}`,
		href: `/agents/${a.slug}`,
		icon: '👤'
	}));

	return [...propertyResults, ...blogResults, ...agentResults, ...staticPages];
}

export function search(query: string, index: SearchResult[]): SearchResult[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	return index
		.filter(
			(r) =>
				r.title.toLowerCase().includes(q) ||
				(r.subtitle?.toLowerCase().includes(q) ?? false) ||
				r.type.includes(q)
		)
		.slice(0, 8);
}
