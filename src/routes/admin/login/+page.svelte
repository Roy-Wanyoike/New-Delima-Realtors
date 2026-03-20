<script>
	import { goto } from '$app/navigation';
	import { loginAdmin } from '$lib/stores/adminAuth';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			if (!email || !password) {
				error = 'Please fill in all fields';
				loading = false;
				return;
			}

			if (password !== adminPassword) {
				error = 'Invalid password';
				loading = false;
				return;
			}

			loginAdmin(email);
			await goto('/admin/dashboard');
		} catch (err) {
			error = 'Login failed. Please try again.';
			loading = false;
		}
	}
</script>

<div class="admin-login-container">
	<div class="login-box">
		<div class="login-header">
			<h1>Admin Login</h1>
			<p>Delima Realtors Dashboard</p>
		</div>

		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="admin@delimarealtors.com"
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Enter admin password"
					required
				/>
			</div>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<button type="submit" class="login-btn" disabled={loading}>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>

		<div class="login-footer">
			<p>Authorized personnel only</p>
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
	}

	.login-box {
		background: white;
		padding: 50px 40px;
		border-radius: 8px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		width: 100%;
		max-width: 400px;
	}

	.login-header {
		text-align: center;
		margin-bottom: 30px;
	}

	.login-header h1 {
		color: #1f1810;
		font-size: 28px;
		margin-bottom: 5px;
	}

	.login-header p {
		color: #d4af37;
		font-size: 14px;
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
		border-radius: 4px;
		font-size: 14px;
		transition: border-color 0.3s;
	}

	input:focus {
		outline: none;
		border-color: #d4af37;
		box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
	}

	.error-message {
		background: #fee;
		color: #c33;
		padding: 12px;
		border-radius: 4px;
		margin-bottom: 20px;
		font-size: 14px;
	}

	.login-btn {
		width: 100%;
		padding: 12px;
		background: #0066cc;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.3s;
	}

	.login-btn:hover:not(:disabled) {
		background: #0052a3;
	}

	.login-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login-footer {
		text-align: center;
		margin-top: 20px;
		color: #999;
		font-size: 12px;
	}
</style>
