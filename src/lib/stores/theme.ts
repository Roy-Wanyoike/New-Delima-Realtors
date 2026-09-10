import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'delima_theme';

function getInitialTheme(): Theme {
	if (!browser) return 'light';
	try {
		const stored = localStorage.getItem(THEME_KEY);
		if (stored === 'light' || stored === 'dark') return stored;
		// Respect OS preference on first visit.
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
	} catch {
		// ignore
	}
	return 'light';
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(getInitialTheme());

	function apply(t: Theme) {
		if (!browser) return;
		try {
			document.documentElement.setAttribute('data-theme', t);
			localStorage.setItem(THEME_KEY, t);
		} catch {
			// ignore
		}
	}

	// Apply on first client render.
	if (browser) {
		apply(getInitialTheme());
	}

	return {
		subscribe,
		set(t: Theme) {
			apply(t);
			set(t);
		},
		toggle() {
			update((t) => {
				const next: Theme = t === 'dark' ? 'light' : 'dark';
				apply(next);
				return next;
			});
		},
		hydrate() {
			const t = getInitialTheme();
			apply(t);
			set(t);
		}
	};
}

export const theme = createThemeStore();
