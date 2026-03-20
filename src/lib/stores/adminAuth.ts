import { writable } from 'svelte/store';

export const adminAuth = writable<{ isLoggedIn: boolean; adminEmail?: string }>({
	isLoggedIn: false
});

export function checkAdminAuth() {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('admin_auth');
		if (stored) {
			adminAuth.set(JSON.parse(stored));
			return true;
		}
	}
	return false;
}

export function loginAdmin(email: string) {
	const auth = { isLoggedIn: true, adminEmail: email };
	adminAuth.set(auth);
	if (typeof window !== 'undefined') {
		localStorage.setItem('admin_auth', JSON.stringify(auth));
	}
}

export function logoutAdmin() {
	adminAuth.set({ isLoggedIn: false });
	if (typeof window !== 'undefined') {
		localStorage.removeItem('admin_auth');
	}
}
