<script>
	import { goto } from '$app/navigation';
	import { adminAuth, checkAdminAuth, logoutAdmin } from '$lib/stores/adminAuth';
	import { onMount } from 'svelte';

	let isLoggedIn = false;

	onMount(() => {
		checkAdminAuth();
		adminAuth.subscribe((auth) => {
			isLoggedIn = auth.isLoggedIn;
			if (!isLoggedIn) {
				goto('/admin/login');
			}
		});
	});

	function handleLogout() {
		logoutAdmin();
		goto('/admin/login');
	}
</script>

{#if isLoggedIn}
	<div class="admin-home">
		<header class="admin-header">
			<div class="header-content">
				<h1>Admin Panel</h1>
				<button on:click={handleLogout} class="logout-btn">Logout</button>
			</div>
		</header>

		<main class="admin-main">
			<div class="container">
				<div class="welcome-section">
					<h2>Welcome to Delima Realtors Admin</h2>
					<p>Manage your real estate projects and properties from here.</p>
				</div>

			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">➕</div>
					<h3>Add New Properties</h3>
					<p>Create new property listings with detailed information including photos, descriptions, pricing, and more. Forms are intuitive and easy to use.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">👁️</div>
					<h3>View All Projects</h3>
					<p>See all your properties in a beautifully organized grid. View images, prices, locations, and details at a glance.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">🗑️</div>
					<h3>Delete Projects</h3>
					<p>Remove properties from your listing with one click. The system will ask for confirmation to prevent accidental deletion.</p>
				</div>

				<div class="feature-card">
					<div class="feature-icon">⚡</div>
					<h3>Real-Time Sync</h3>
					<p>All changes are instantly synced with your database. Your website updates automatically when you add or remove properties.</p>
				</div>
			</div>

			<div class="menu-grid">
				<a href="/admin/dashboard" class="menu-card">
					<div class="card-icon">📋</div>
					<h3>Project Management</h3>
					<p>Add, view, and delete property listings</p>
				</a>

				<a href="/admin/contacts" class="menu-card">
					<div class="card-icon">📧</div>
					<h3>Inquiries Management</h3>
					<p>View and manage customer contact inquiries</p>
				</a>

				<div class="menu-card disabled">
					<div class="card-icon">👥</div>
					<h3>User Management</h3>
					<p>Coming soon</p>
				</div>

				<div class="menu-card disabled">
					<div class="card-icon">📊</div>
					<h3>Analytics</h3>
					<p>Coming soon</p>
				</div>
			</div>

				<div class="info-section">
					<h3>Quick Help</h3>
					<div class="help-items">
						<div class="help-item">
							<strong>Add Projects:</strong> Go to Project Management → Add New Project
						</div>
						<div class="help-item">
							<strong>Edit Images:</strong> Use image URLs (e.g., from Drive, Dropbox, or image hosting)
						</div>
						<div class="help-item">
							<strong>View Website:</strong> <a href="/" target="_blank">Visit your live website</a>
						</div>
						<div class="help-item">
							<strong>Documentation:</strong> <a href="/ADMIN_DASHBOARD.md" target="_blank">Read full guide</a>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}

<style>
	.admin-home {
		background: #f5f5f5;
		min-height: 100vh;
	}

	.admin-header {
		background: #1f1810;
		color: white;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		max-width: 1300px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-content h1 {
		margin: 0;
		font-size: 24px;
	}

	.logout-btn {
		background: #d4af37;
		color: #1f1810;
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: background 0.3s;
	}

	.logout-btn:hover {
		background: #efbe5c;
	}

	.admin-main {
		padding: 40px 20px;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.welcome-section {
		text-align: center;
		margin-bottom: 50px;
	}

	.welcome-section h2 {
		color: #1f1810;
		font-size: 28px;
		margin: 0 0 10px 0;
	}

	.welcome-section p {
		color: #666;
		font-size: 16px;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 20px;
		margin-bottom: 50px;
	}

	.feature-card {
		background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
		padding: 25px 20px;
		border-radius: 8px;
		border-left: 4px solid #d4af37;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		text-align: center;
		transition: all 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
		border-left-color: #0066cc;
	}

	.feature-icon {
		font-size: 40px;
		margin-bottom: 12px;
		display: block;
	}

	.feature-card h3 {
		color: #1f1810;
		margin: 0 0 10px 0;
		font-size: 18px;
	}

	.feature-card p {
		color: #666;
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
	}

	.menu-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
		margin-bottom: 50px;
	}

	.menu-card {
		background: white;
		padding: 30px;
		border-radius: 8px;
		text-align: center;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.3s;
		cursor: pointer;
	}

	.menu-card:hover:not(.disabled) {
		transform: translateY(-5px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
	}

	.menu-card.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.card-icon {
		font-size: 40px;
		margin-bottom: 15px;
	}

	.menu-card h3 {
		color: #1f1810;
		margin: 0 0 10px 0;
		font-size: 18px;
	}

	.menu-card p {
		color: #999;
		margin: 0;
		font-size: 14px;
	}

	.info-section {
		background: white;
		padding: 30px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.info-section h3 {
		color: #1f1810;
		margin-top: 0;
	}

	.help-items {
		display: grid;
		gap: 15px;
	}

	.help-item {
		padding: 15px;
		background: #f9f9f9;
		border-left: 4px solid #d4af37;
		border-radius: 4px;
		color: #666;
		font-size: 14px;
	}

	.help-item strong {
		color: #1f1810;
	}

	.help-item a {
		color: #0066cc;
		text-decoration: none;
	}

	.help-item a:hover {
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		.menu-grid {
			grid-template-columns: 1fr;
		}

		.header-content {
			flex-direction: column;
			gap: 15px;
			align-items: flex-start;
		}
	}
</style>

