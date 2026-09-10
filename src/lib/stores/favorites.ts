import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Favorites (wishlist) store — backed by localStorage.
 * Stores an array of project IDs the user has hearted.
 */
const FAV_KEY = 'delima_favorites';

function loadFavorites(): string[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(FAV_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveFavorites(ids: string[]) {
	if (!browser) return;
	try {
		localStorage.setItem(FAV_KEY, JSON.stringify(ids));
	} catch {
		// ignore quota / privacy mode
	}
}

function createFavoritesStore() {
	const { subscribe, set, update } = writable<string[]>(loadFavorites());

	return {
		subscribe,
		toggle(id: string) {
			update((ids) => {
				const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
				saveFavorites(next);
				return next;
			});
		},
		has(id: string) {
			let found = false;
			subscribe((ids) => (found = ids.includes(id)))();
			return found;
		},
		clear() {
			saveFavorites([]);
			set([]);
		},
		// rehydrate from localStorage (call on mount in case SSR rendered empty)
		hydrate() {
			set(loadFavorites());
		}
	};
}

export const favorites = createFavoritesStore();
