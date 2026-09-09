import type { Handle } from '@sveltejs/kit';

/**
 * Applies security headers to every response.
 *
 * These are set here (rather than in vercel.json) so they apply uniformly
 * regardless of deploy target and so they're auditable in one place.
 *
 * CSP allows:
 *  - self for everything
 *  - fonts.googleapis.com / fonts.gstatic.com (Google Fonts in app.html)
 *  - https://avolfbxzuxpjszjhhftf.supabase.co (Supabase REST + Storage)
 *  - data: for the Supabase image URLs + inline svgs + map images
 *  - https://www.google.com/maps (Google Maps embed on /contact)
 *
 * NOTE: the Supabase project URL above should match VITE_SUPABASE_URL.
 */
const csp = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'", // vendored scripts are local; 'unsafe-inline' for the inline wow/cursor initializers
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com data:",
	"img-src 'self' data: https: blob:", // allow Supabase storage + maps tiles + data: svgs
	"connect-src 'self' https://*.supabase.co https://avolfbxzuxpjszjhhftf.supabase.co wss://*.supabase.co",
	"frame-src https://www.google.com",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"upgrade-insecure-requests"
].join('; ');

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('Content-Security-Policy', csp);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
	// HSTS only meaningful on https; harmless on localhost dev.
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

	return response;
};
