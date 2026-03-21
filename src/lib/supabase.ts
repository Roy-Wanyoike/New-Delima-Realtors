import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only if environment variables are available
let supabase: any = null;

if (supabaseUrl && supabaseKey) {
	supabase = createClient(supabaseUrl, supabaseKey);
} else {
	console.warn('Supabase environment variables not found, running in offline mode');
}

// Export a function that returns the client, or null if not available
export function getSupabaseClient() {
	return supabase;
}

// For backward compatibility, export the client directly but handle gracefully
export { supabase };
