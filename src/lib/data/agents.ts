export interface Agent {
	slug: string;
	name: string;
	role: string;
	image: string;
	phone: string;
	email: string;
	specialties: string[];
	experience: string;
	listingsSold: number;
	rating: number;
	bio: string;
	languages: string[];
	certifications: string[];
}

/**
 * Nairobi real estate agents. In production this would come from Supabase;
 * for now it's a static curated list shared by /agents and /agents/[slug].
 */
export const agents: Agent[] = [
	{
		slug: 'roy-wanyoike',
		name: 'Roy Wanyoike',
		role: 'Founder & Lead Realtor',
		image: '/lib/assets/team-1.jpg',
		phone: '+254 727 523 752',
		email: 'roy@delimarealtors.com',
		specialties: ['Luxury Villas', 'Karen & Muthaiga', 'Investment Advisory'],
		experience: '12+ years',
		listingsSold: 240,
		rating: 4.9,
		bio: 'Roy founded Delima Realtors in 2014 after a decade in Nairobi’s luxury market. He has closed over 240 transactions across Karen, Muthaiga, and Runda, and is known for his straight-talking, data-driven approach to valuations.',
		languages: ['English', 'Swahili', 'Kikuyu'],
		certifications: ['EREB Licensed', 'EAC Valuer', 'RICS Affiliate']
	},
	{
		slug: 'aisha-mohamed',
		name: 'Aisha Mohamed',
		role: 'Senior Property Consultant',
		image: '/lib/assets/team-2.jpg',
		phone: '+254 722 100 200',
		email: 'aisha@delimarealtors.com',
		specialties: ['Westlands Apartments', 'First-time Buyers', 'Mortgage Advisory'],
		experience: '8 years',
		listingsSold: 156,
		rating: 4.8,
		bio: 'Aisha specializes in Westlands and Kilimani apartments and is our go-to for first-time buyers. She walks clients through every step — from financing to handover — and has a 100% client-satisfaction record.',
		languages: ['English', 'Swahili', 'Arabic'],
		certifications: ['EREB Licensed', 'Mortgage Advisor Cert.']
	},
	{
		slug: 'david-kamau',
		name: 'David Kamau',
		role: 'Commercial & Investment Specialist',
		image: '/lib/assets/team-3.jpg',
		phone: '+254 733 400 600',
		email: 'david@delimarealtors.com',
		specialties: ['Commercial Leasing', 'Off-Plan Sales', 'ROI Analysis'],
		experience: '10 years',
		listingsSold: 98,
		rating: 4.9,
		bio: 'David leads our commercial desk, advising investors on office space in Upper Hill and Westlands, and off-plan purchases along Thika Road. He holds an MBA in Real Estate Finance.',
		languages: ['English', 'Swahili', 'Kikuyu'],
		certifications: ['EREB Licensed', 'MBA Real Estate Finance']
	},
	{
		slug: 'grace-wanjiru',
		name: 'Grace Wanjiru',
		role: 'Property Manager',
		image: '/lib/assets/team-4.jpg',
		phone: '+254 720 800 100',
		email: 'grace@delimarealtors.com',
		specialties: ['Property Management', 'Tenant Relations', 'Maintenance'],
		experience: '6 years',
		listingsSold: 0,
		rating: 4.7,
		bio: 'Grace manages our landlord portfolio — overseeing 60+ units across Kilimani and Kileleshwa, from tenant onboarding to rent collection and maintenance coordination.',
		languages: ['English', 'Swahili'],
		certifications: ['EREB Licensed', 'Property Mgmt Cert.']
	}
];

export function getAgentBySlug(slug: string): Agent | undefined {
	return agents.find((a) => a.slug === slug);
}
