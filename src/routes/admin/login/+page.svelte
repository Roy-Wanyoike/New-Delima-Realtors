<script lang="ts">
        import { goto } from '$app/navigation';
        import { page } from '$app/stores';
        import { onMount } from 'svelte';

        let email = '';
        let password = '';
        let error = '';
        let loading = false;

        const presetError = $page.url.searchParams.get('error');
        if (presetError === 'session_expired') {
                error = 'Your session has expired. Please sign in again.';
        } else if (presetError === 'not_admin') {
                error = 'This account does not have admin access.';
        } else if (presetError === 'server_unavailable') {
                error = 'Authentication is currently unavailable. Please try again later.';
        }

        onMount(async () => {
                // If already signed in as an admin, skip straight to the dashboard.
                try {
                        const { supabase } = await import('$lib/supabase');
                        if (!supabase) return;
                        const { data } = await supabase.auth.getSession();
                        if (data.session?.user) {
                                const { data: isAdmin } = await supabase.rpc('is_admin');
                                if (isAdmin) {
                                        await goto('/admin/dashboard');
                                }
                        }
                } catch {
                        // ignore — show the login form
                }
        });

        async function handleLogin(e: SubmitEvent) {
                e.preventDefault();
                error = '';

                if (!email || !password) {
                        error = 'Please fill in all fields';
                        return;
                }

                loading = true;

                try {
                        const { supabase } = await import('$lib/supabase');
                        if (!supabase) {
                                error = 'Authentication is currently unavailable.';
                                loading = false;
                                return;
                        }

                        const { data, error: authError } = await supabase.auth.signInWithPassword({
                                email: email.trim(),
                                password
                        });

                        if (authError || !data.session) {
                                error = authError?.message ?? 'Invalid email or password.';
                                loading = false;
                                return;
                        }

                        // Confirm this account is an admin (admins table membership).
                        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
                        if (rpcError || !isAdmin) {
                                await supabase.auth.signOut();
                                error = 'This account does not have admin access.';
                                loading = false;
                                return;
                        }

                        // Persist the access token in a cookie so the server-side guard
                        // (+layout.server.ts) can validate it on subsequent navigations.
                        document.cookie = `sb-access-token=${data.session.access_token}; path=/; SameSite=Lax; Secure; max-age=${60 * 60 * 24 * 7}`;

                        await goto('/admin/dashboard');
                } catch (err) {
                        console.error('Login failed:', err);
                        error = 'Login failed. Please try again.';
                        loading = false;
                }
        }
</script>

<svelte:head>
        <title>Admin Login | Delima Realtors</title>
        <meta name="robots" content="noindex" />
</svelte:head>

<div class="admin-login-container">
        <div class="login-box">
                <div class="login-header">
                        <img src="/lib/assets/logo/delima-logo.svg" alt="Delima Realtors logo" class="login-logo" />
                        <h1>Admin Login</h1>
                        <p>Delima Realtors Dashboard</p>
                </div>

                {#if error}
                        <div class="error-message" role="alert">{error}</div>
                {/if}

                <form on:submit={handleLogin}>
                        <div class="form-group">
                                <label for="email">Email</label>
                                <input
                                        id="email"
                                        type="email"
                                        bind:value={email}
                                        placeholder="admin@delimarealtors.com"
                                        autocomplete="username"
                                        required
                                />
                        </div>

                        <div class="form-group">
                                <label for="password">Password</label>
                                <input
                                        id="password"
                                        type="password"
                                        bind:value={password}
                                        placeholder="Enter your password"
                                        autocomplete="current-password"
                                        required
                                />
                        </div>

                        <button type="submit" class="login-btn" disabled={loading}>
                                {#if loading}
                                        <span class="spinner" aria-hidden="true"></span>
                                        Signing in...
                                {:else}
                                        Login
                                {/if}
                        </button>
                </form>

                <div class="login-footer">
                        <p>Authorized personnel only. Access is logged and role-checked server-side.</p>
                </div>
        </div>
</div>

<style>
        .admin-login-container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #1f1810 0%, #2a2115 100%);
                padding: 20px;
        }

        .login-box {
                background: white;
                padding: 45px 40px;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 400px;
        }

        .login-header {
                text-align: center;
                margin-bottom: 30px;
        }

        .login-logo {
                height: 50px;
                margin-bottom: 15px;
        }

        .login-header h1 {
                color: #1f1810;
                font-size: 26px;
                margin: 0 0 5px;
        }

        .login-header p {
                color: #d4af37;
                font-size: 14px;
                margin: 0;
        }

        .form-group {
                margin-bottom: 20px;
        }

        label {
                display: block;
                margin-bottom: 8px;
                color: #1f1810;
                font-weight: 600;
                font-size: 14px;
        }

        input {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s, box-shadow 0.2s;
                font-family: inherit;
        }

        input:focus {
                outline: none;
                border-color: #d4af37;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
        }

        .error-message {
                background: #f8d7da;
                color: #721c24;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 20px;
                font-size: 14px;
                border: 1px solid #f5c6cb;
        }

        .login-btn {
                width: 100%;
                padding: 13px;
                background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                color: #1f1810;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-family: inherit;
        }

        .login-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        .login-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
        }

        .spinner {
                width: 14px;
                height: 14px;
                border: 2px solid rgba(31, 24, 16, 0.3);
                border-top-color: #1f1810;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
                to {
                        transform: rotate(360deg);
                }
        }

        .login-footer {
                text-align: center;
                margin-top: 25px;
                color: #999;
                font-size: 12px;
                line-height: 1.5;
        }

        @media (max-width: 480px) {
                .login-box {
                        padding: 35px 25px;
                }
        }
</style>
