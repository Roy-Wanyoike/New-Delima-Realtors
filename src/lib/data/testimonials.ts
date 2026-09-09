export interface Testimonial {
	id: number;
	name: string;
	role: string;
	location: string;
	rating: number;
	quote: string;
	avatar: string;
	date: string;
}

export const testimonials: Testimonial[] = [
	{
		id: 1,
		name: 'James Mwangi',
		role: 'Home Buyer',
		location: 'Westlands',
		rating: 5,
		quote: 'Roy and the Delima team made buying our first home in Westlands genuinely stress-free. They handled the financing, legal, and handover — we just moved in. Couldn’t recommend them more.',
		avatar: '/lib/assets/author-1.jpg',
		date: 'March 2026'
	},
	{
		id: 2,
		name: 'Sarah Njoki',
		role: 'Property Investor',
		location: 'Kilimani',
		rating: 5,
		quote: 'I’ve bought three apartments through Delima over the past two years. Their market analysis is sharp, and they always tell me the truth — even when it’s not what I want to hear. That’s rare.',
		avatar: '/lib/assets/author-2.jpg',
		date: 'February 2026'
	},
	{
		id: 3,
		name: 'Daniel Ochieng',
		role: 'Villa Seller',
		location: 'Karen',
		rating: 5,
		quote: 'Sold our Karen villa in 6 weeks at full asking price. David’s valuation was spot-on and the marketing was beautiful. The whole process felt premium from start to finish.',
		avatar: '/lib/assets/team-3.jpg',
		date: 'January 2026'
	},
	{
		id: 4,
		name: 'Grace Achieng',
		role: 'Tenant',
		location: 'Kileleshwa',
		rating: 4,
		quote: 'Grace Wanjiru manages our building and she’s always responsive. Maintenance gets sorted within a day and rent payments are seamless. Happy tenant of 2 years.',
		avatar: '/lib/assets/team-4.jpg',
		date: 'December 2025'
	}
];
