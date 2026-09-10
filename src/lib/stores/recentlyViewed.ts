import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Project } from '$lib/types';

/**
 * Recently viewed properties store — backed by localStorage.
 * Keeps the last 4 unique projects the user has visited (most-recent-first).
 */
const RECENT_KEY = 'delima_recently_viewed';
const MAX_RECENT = 4;

function loadRecent(): Project[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(RECENT_KEY);
		return raw ? (JSON.parse(raw) as Project[]) : [];
	} catch {
		return [];
	}
}

function saveRecent(items: Project[]) {
	if (!browser) return;
	try {
		localStorage.setItem(RECENT_KEY, JSON.stringify(items));
	} catch {
		// ignore quota / privacy mode
	}
}

function createRecentStore() {
	const { subscribe, set, update } = writable<Project[]>(loadRecent());

	return {
		subscribe,
		/**
		 * Add (or move to front) a project the user just viewed.
		 * Keeps only the last MAX_RECENT unique projects.
		 */
		add(project: Project) {
			update((items) => {
				const filtered = items.filter((p) => p.id !== project.id);
				const next = [project, ...filtered].slice(0, MAX_RECENT);
				saveRecent(next);
				return next;
			});
		},
		clear() {
			saveRecent([]);
			set([]);
		},
		hydrate() {
			set(loadRecent());
		}
	};
}

export const recentlyViewed = createRecentStore();
export const RECENT_MAX = MAX_RECENT;
