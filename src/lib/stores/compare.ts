import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Project } from '$lib/types';

/**
 * Comparison store — holds up to 3 projects for side-by-side comparison.
 * Persisted to sessionStorage so a refresh keeps the selection (cleared when
 * the tab closes — appropriate for a session-level intent).
 */
const MAX_COMPARE = 3;
const COMPARE_KEY = 'delima_compare';

function loadCompare(): Project[] {
	if (!browser) return [];
	try {
		const raw = sessionStorage.getItem(COMPARE_KEY);
		return raw ? (JSON.parse(raw) as Project[]) : [];
	} catch {
		return [];
	}
}

function saveCompare(items: Project[]) {
	if (!browser) return;
	try {
		sessionStorage.setItem(COMPARE_KEY, JSON.stringify(items));
	} catch {
		// ignore quota / privacy mode
	}
}

function createCompareStore() {
	const { subscribe, set, update } = writable<Project[]>(loadCompare());

	return {
		subscribe,
		max: MAX_COMPARE,
		toggle(project: Project) {
			update((items) => {
				const existing = items.find((p) => p.id === project.id);
				let next: Project[];
				if (existing) {
					next = items.filter((p) => p.id !== project.id);
				} else if (items.length >= MAX_COMPARE) {
					return items; // full, ignore
				} else {
					next = [...items, project];
				}
				saveCompare(next);
				return next;
			});
		},
		has(id: string) {
			let found = false;
			subscribe((items) => (found = items.some((p) => p.id === id)))();
			return found;
		},
		remove(id: string) {
			update((items) => {
				const next = items.filter((p) => p.id !== id);
				saveCompare(next);
				return next;
			});
		},
		clear() {
			saveCompare([]);
			set([]);
		},
		isFull() {
			let full = false;
			subscribe((items) => (full = items.length >= MAX_COMPARE))();
			return full;
		},
		// rehydrate from sessionStorage (call on mount in case SSR rendered empty)
		hydrate() {
			set(loadCompare());
		}
	};
}

export const compare = createCompareStore();
