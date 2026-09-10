// Shared domain types for Delima Realtors.
// Keep these in sync with supabase/schema.sql.

export type ProjectStatus = 'published' | 'draft' | 'sold';

export interface Project {
	id: string;
	title: string;
	description: string;
	location: string;
	price: string;
	bedrooms: string;
	bathrooms: string;
	imageUrl: string;
	category: string;
	status: ProjectStatus;
	featured: boolean;
	amenities?: string;
	created_at?: string;
	updated_at?: string;
}

export type ContactStatus = 'new' | 'contacted' | 'closed';

export interface Contact {
	id: string;
	name: string;
	email: string;
	phone?: string;
	subject?: string;
	message: string;
	property_id?: string;
	interested_in?: string;
	status: ContactStatus;
	created_at?: string;
}

// A project as returned by Supabase may have partial fields (e.g. during edit).
export type ProjectInput = Partial<Project> & Pick<Project, 'title' | 'description' | 'location' | 'price'>;
