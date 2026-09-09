import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Project } from '$lib/types';

/**
 * Comparison store — holds up to 3 projects for side-by-side comparison.
 * Not persisted (comparison is a session-level intent).
 */
const MAX_COMPARE = 3;

function createCompareStore() {
	const { subscribe, set, update } = writable<Project[]>([]);

	return {
		subscribe,
		max: MAX_COMPARE,
		toggle(project: Project) {
			update((items) => {
				const existing = items.find((p) => p.id === project.id);
				if (existing) {
					return items.filter((p) => p.id !== project.id);
				}
				if (items.length >= MAX_COMPARE) return items; // full, ignore
				return [...items, project];
			});
		},
		has(id: string) {
			let found = false;
			subscribe((items) => (found = items.some((p) => p.id === id)))();
			return found;
		},
		remove(id: string) {
			update((items) => items.filter((p) => p.id !== id));
		},
		clear() {
			set([]);
		},
		isFull() {
			let full = false;
			subscribe((items) => (full = items.length >= MAX_COMPARE))();
			return full;
		}
	};
}

export const compare = createCompareStore();
