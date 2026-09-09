/**
 * Instagram post interface — matches the `instagram_posts` table
 * (see supabase/schema.sql).
 */
export interface InstagramPost {
        id: string;
        instagram_id: string;          // The IG media ID (from Graph API or manual)
        caption: string;
        media_url: string;             // URL to the image (Supabase Storage or IG CDN)
        permalink: string;             // Link back to the IG post
        posted_at: string;             // ISO timestamp from Instagram
        tags: string[];                // Hashtags extracted from caption
        created_at: string;
}

/**
 * Manual upload form data (for the admin fallback flow).
 */
export interface ManualUpload {
        caption: string;
        imageUrl: string;
        permalink: string;
        postedAt: string;
}

/**
 * Extract hashtags from an Instagram caption.
 * e.g. "#Nairobi #RealEstate #LuxuryLiving" → ["Nairobi", "RealEstate", "LuxuryLiving"]
 */
export function extractHashtags(caption: string): string[] {
        const matches = caption.match(/#(\w+)/g) ?? [];
        return matches.map((m) => m.replace('#', ''));
}

/**
 * Format an ISO date for display.
 */
export function formatInstagramDate(iso: string): string {
        return new Date(iso).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
        });
}

/**
 * Truncate a caption for card display.
 */
export function truncateCaption(caption: string, max = 120): string {
        if (caption.length <= max) return caption;
        return caption.slice(0, max).trim() + '…';
}

// ────────────────────────────────────────────────────────────────────────────
// Instagram Graph API integration (reference — not active until configured)
// ────────────────────────────────────────────────────────────────────────────
//
// PREREQUISITES (owner action):
// 1. Convert the @delima_realtors Instagram account to a Business or Creator account.
// 2. Create a Meta Developer App at https://developers.facebook.com/apps/
// 3. Add the "Instagram Graph API" product to the app.
// 4. Get: IG_USER_ID (numeric) + a long-lived ACCESS_TOKEN.
// 5. Set env vars: INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN
//
// SYNC FLOW (server-side, e.g. in a SvelteKit endpoint or Vercel Cron):
//
//   // GET /api/instagram/sync  (cron-triggered)
//   const res = await fetch(
//     `https://graph.facebook.com/v21.0/${IG_USER_ID}/media` +
//     `?fields=id,caption,media_url,permalink,timestamp` +
//     `&access_token=${ACCESS_TOKEN}&limit=12`
//   );
//   const { data } = await res.json();
//   // Insert each post into `instagram_posts` (idempotent on instagram_id).
//   // Download media_url → upload to Supabase Storage → update media_url.
//
// RATE LIMITS:
//   - Instagram Graph API: 200 calls/hour per app per user.
//   - Sync once per hour is more than sufficient for @delima_realtors's posting volume.
//
// FALLBACK (active now):
//   Admin manual upload at /admin/instagram — paste image URL + caption + permalink.
//   When Graph API access is configured, the sync endpoint can be enabled.
