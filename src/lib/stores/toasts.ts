import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ToastType = 'success' | 'error' | 'info';
export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	duration?: number;
}

let nextId = 0;

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function push(message: string, type: ToastType = 'info', duration = 3500) {
		if (!browser) return;
		const id = ++nextId;
		update((toasts) => [...toasts, { id, message, type, duration }]);
		if (duration > 0) {
			setTimeout(() => remove(id), duration);
		}
		return id;
	}

	function remove(id: number) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		push,
		remove,
		success: (m: string, d?: number) => push(m, 'success', d),
		error: (m: string, d?: number) => push(m, 'error', d ?? 5000),
		info: (m: string, d?: number) => push(m, 'info', d)
	};
}

export const toasts = createToastStore();
