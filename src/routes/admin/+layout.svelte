<script lang="ts">
        import { page } from '$app/stores';
        import { goto } from '$app/navigation';

        // $page.data is populated by +layout.server.ts (the server-side guard).
        // If we got here at all, the guard has confirmed isAdmin === true.
        let data = $page.data as { isAdmin?: boolean; adminEmail?: string };

        async function handleLogout() {
                try {
                        const { supabase } = await import('$lib/supabase');
                        if (supabase) {
                                await supabase.auth.signOut();
                        }
                } catch {
                        // ignore — clearing the cookie below is the important part
                }
                // Clear the access-token cookie.
                document.cookie = 'sb-access-token=; path=/; SameSite=Lax; Secure; max-age=0';
                await goto('/admin/login');
        }
</script>

{#if data?.isAdmin}
        <div class="admin-shell">
                <header class="admin-topbar">
                        <a href="/admin" class="admin-brand">
                                <img src="/lib/assets/logo/delima-logo.svg" alt="Delima Realtors" class="brand-logo" />
                                <span>Admin</span>
                        </a>
                        <div class="admin-topbar-right">
                                {#if data?.adminEmail}
                                        <span class="admin-email">{data.adminEmail}</span>
                                {/if}
                                <button type="button" class="logout-btn" on:click={handleLogout}>Sign out</button>
                        </div>
                </header>
                <main class="admin-main">
                        <slot />
                </main>
        </div>
{:else}
        <!-- The +layout.server.ts guard redirects before we ever render this. -->
        <p style="padding:2rem;text-align:center;">Redirecting to sign in…</p>
{/if}

<style>
        .admin-shell {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                background: #f5f5f5;
        }

        .admin-topbar {
                background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
                color: #fff;
                padding: 12px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                position: sticky;
                top: 0;
                z-index: 10;
        }

        .admin-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #fff;
                text-decoration: none;
                font-weight: 600;
        }

        .brand-logo {
                height: 32px;
        }

        .admin-topbar-right {
                display: flex;
                align-items: center;
                gap: 16px;
        }

        .admin-email {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.85rem;
        }

        .logout-btn {
                background: #d4af37;
                color: #1f1810;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.85rem;
                font-family: inherit;
                transition: background 0.2s;
        }

        .logout-btn:hover {
                background: #efbe5c;
        }

        .admin-main {
                flex: 1;
                width: 100%;
        }

        @media (max-width: 600px) {
                .admin-email {
                        display: none;
                }
        }
</style>
