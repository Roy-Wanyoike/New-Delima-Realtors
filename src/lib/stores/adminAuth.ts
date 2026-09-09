import { writable } from 'svelte/store';

/**
 * Admin auth store.
 *
 * NOTE: This store is a CLIENT-SIDE convenience only and is NOT a security
 * boundary. Authoritative admin access control is enforced by:
 *   1. src/routes/admin/+layout.server.ts (server-side route guard), and
 *   2. Supabase Row-Level Security (supabase/rls.sql) on the data layer.
 *
 * The store simply mirrors the Supabase auth session so the UI can react
 * (e.g. show the logged-in state). It no longer writes a forgeable boolean
 * flag to localStorage.
 */
export interface AdminAuthState {
	isLoggedIn: boolean;
	adminEmail?: string;
}

export const adminAuth = writable<AdminAuthState>({ isLoggedIn: false });

/**
 * Initialise the store from a known server-validated state (called from
 * admin layout components that receive `$page.data` from +layout.server.ts).
 */
export function setAdminAuth(state: AdminAuthState) {
	adminAuth.set(state);
}

// Legacy helpers retained only as no-op stubs for any remaining callers
// during the migration; new code should read $page.data instead.
export function checkAdminAuth() {
	return false;
}
export function loginAdmin(_email: string) {
	// no-op — use Supabase Auth (supabase.auth.signInWithPassword) in /admin/login.
}
export function logoutAdmin() {
	// no-op — use the layout's handleLogout (supabase.auth.signOut + cookie clear).
}
