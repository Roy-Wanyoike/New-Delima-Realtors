import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-side admin route guard.
 *
 * Reads the Supabase access token from the `sb-access-token` cookie, validates
 * it via `auth.getUser`, and confirms the user is in the `admins` allowlist by
 * calling the `is_admin()` RPC with the caller's JWT (the client is created
 * with `global.headers.Authorization` so `auth.uid()` resolves inside the
 * security-definer function).
 *
 * This is the authoritative gate: even if a client bypasses the store, this
 * `+layout.server.ts` runs on every admin route load server-side, and RLS
 * (supabase/rls.sql) is the data-layer boundary that blocks non-admin
 * reads/writes regardless.
 */
export const load = async ({ cookies }: { cookies: import('@sveltejs/kit').Cookies }) => {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
	const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw redirect(303, '/admin/login?error=server_unavailable');
	}

	const accessToken = cookies.get('sb-access-token');

	if (!accessToken) {
		throw redirect(303, '/admin/login');
	}

	// Client used to validate the token (no Authorization header needed;
	// getUser accepts the token as an argument).
	const validationClient = createClient(supabaseUrl, supabaseAnonKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	const {
		data: { user },
		error
	} = await validationClient.auth.getUser(accessToken);

	if (error || !user) {
		cookies.delete('sb-access-token', { path: '/' });
		throw redirect(303, '/admin/login?error=session_expired');
	}

	// Authenticated client (carries the user's JWT on every request) so that
	// the security-definer is_admin() RPC sees auth.uid() = user.id.
	const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
		auth: { persistSession: false, autoRefreshToken: false },
		global: { headers: { Authorization: `Bearer ${accessToken}` } }
	});

	const { data: isAdmin, error: rpcError } = await authedClient.rpc('is_admin');

	if (rpcError || !isAdmin) {
		throw redirect(303, '/admin/login?error=not_admin');
	}

	return {
		isAdmin: true,
		adminEmail: user.email ?? ''
	};
};
