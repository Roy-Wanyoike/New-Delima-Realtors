<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let project: any = null;
	let loading = true;
	let error = '';

	// Contact form
	let contactForm = {
		name: '',
		email: '',
		phone: '',
		message: ''
	};
	let submitting = false;
	let submitted = false;

	onMount(async () => {
		const projectId = $page.params.id;
		if (!projectId) {
			error = 'Project not found';
			loading = false;
			return;
		}

		try {
			const { data, error: err } = await supabase
				.from('projects')
				.select('*')
				.eq('id', projectId)
				.single();

			if (err) throw err;
			if (!data || data.status !== 'published') {
				error = 'Project not found or not published';
			} else {
				project = data;
			}
		} catch (err) {
			console.error('Error loading project:', err);
			error = 'Failed to load project details';
		} finally {
			loading = false;
		}
	});

	async function submitContactForm() {
		if (!contactForm.name || !contactForm.email || !contactForm.message) {
			alert('Please fill in all required fields');
			return;
		}

		submitting = true;
		try {
			const { error: err } = await supabase.from('contacts').insert([
				{
					name: contactForm.name,
					email: contactForm.email,
					phone: contactForm.phone,
					property_id: project.id,
					message: contactForm.message,
					interested_in: project.title,
					status: 'new'
				}
			]);

			if (err) throw err;

			submitted = true;
			contactForm = { name: '', email: '', phone: '', message: '' };
			setTimeout(() => (submitted = false), 5000);
		} catch (err) {
			console.error('Error submitting form:', err);
			alert('Failed to submit inquiry. Please try again.');
		} finally {
			submitting = false;
		}
	}

	function formatPrice(price: string) {
		return parseInt(price).toLocaleString();
	}
</script>

{#if loading}
	<main class="loading-container">
		<div class="loading">Loading property details...</div>
	</main>
{:else if error}
	<main class="error-container">
		<div class="error-message">
			<h2>⚠️ {error}</h2>
			<p><a href="/projects">← Back to All Properties</a></p>
		</div>
	</main>
{:else if project}
	<main class="project-detail">
		<!-- Hero Section -->
		<div class="hero-section">
			<img src={project.imageUrl} alt={project.title} class="hero-image" />
			{#if project.featured}
				<div class="featured-badge">⭐ Featured Property</div>
			{/if}
		</div>

		<div class="container">
			<div class="detail-grid">
				<!-- Left Column -->
				<article class="detail-content">
					<div class="breadcrumb">
						<a href="/">Home</a> / <a href="/projects">Properties</a> / <span>{project.title}</span>
					</div>

					<h1>{project.title}</h1>
					<div class="meta-info">
						<span class="category-badge">{project.category}</span>
						<p class="location">📍 {project.location}</p>
					</div>

					<div class="price-section">
						<h2 class="price">KES {formatPrice(project.price)}</h2>
						{#if project.bedrooms || project.bathrooms}
							<p class="specs">
								🛏️ {project.bedrooms || 'N/A'} Bedrooms | 🚿 {project.bathrooms || 'N/A'} Bathrooms
							</p>
						{/if}
					</div>

					<!-- Description -->
					<section class="section">
						<h3>About This Property</h3>
						<p>{project.description}</p>
					</section>

					<!-- Amenities -->
					{#if project.amenities}
						<section class="section">
							<h3>Amenities & Features</h3>
							<ul class="amenities-list">
								{#each project.amenities.split(',') as amenity}
									<li>✓ {amenity.trim()}</li>
								{/each}
							</ul>
						</section>
					{/if}

					<!-- Quick Facts -->
					<section class="section">
						<h3>Property Information</h3>
						<div class="facts-grid">
							<div class="fact">
								<span class="label">Category</span>
								<span class="value">{project.category}</span>
							</div>
							<div class="fact">
								<span class="label">Location</span>
								<span class="value">{project.location}</span>
							</div>
							{#if project.bedrooms}
								<div class="fact">
									<span class="label">Bedrooms</span>
									<span class="value">{project.bedrooms}</span>
								</div>
							{/if}
							{#if project.bathrooms}
								<div class="fact">
									<span class="label">Bathrooms</span>
									<span class="value">{project.bathrooms}</span>
								</div>
							{/if}
							<div class="fact">
								<span class="label">Price</span>
								<span class="value">KES {formatPrice(project.price)}</span>
							</div>
							<div class="fact">
								<span class="label">Listed</span>
								<span class="value">{new Date(project.created_at).toLocaleDateString()}</span>
							</div>
						</div>
					</section>
				</article>

				<!-- Right Column - Sidebar -->
				<aside class="detail-sidebar">
					<div class="contact-card">
						<h3>Interested in this property?</h3>
						<p>Fill out the form below and our team will contact you within 24 hours.</p>

						{#if submitted}
							<div class="success-message">✓ Your inquiry has been submitted! We'll contact you soon.</div>
						{:else}
							<form on:submit|preventDefault={submitContactForm}>
								<div class="form-group">
									<label for="name">Full Name *</label>
									<input
										id="name"
										type="text"
										bind:value={contactForm.name}
										placeholder="Your full name"
										required
									/>
								</div>

								<div class="form-group">
									<label for="email">Email *</label>
									<input
										id="email"
										type="email"
										bind:value={contactForm.email}
										placeholder="your@email.com"
										required
									/>
								</div>

								<div class="form-group">
									<label for="phone">Phone Number</label>
									<input
										id="phone"
										type="tel"
										bind:value={contactForm.phone}
										placeholder="+254 700 000 000"
									/>
								</div>

								<div class="form-group">
									<label for="message">Message *</label>
									<textarea
										id="message"
										bind:value={contactForm.message}
										placeholder="Tell us more about your interest..."
										rows="5"
										required
									></textarea>
								</div>

								<button type="submit" class="btn-submit" disabled={submitting}>
									{submitting ? 'Sending...' : 'Send Inquiry'}
								</button>
							</form>
						{/if}
					</div>

					<!-- Info Card -->
					<div class="info-card">
						<h4>💡 Delima Realtors</h4>
						<p>Visit our website for more properties and professional real estate services.</p>
						<div class="contact-info">
							<p>📞 <a href="tel:+254700000000">+254 700 000 000</a></p>
							<p>📧 <a href="mailto:info@delimarealtors.com">info@delimarealtors.com</a></p>
						</div>
					</div>
				</aside>
			</div>

			<!-- Related Properties -->
			<section class="related-section">
				<h3>Similar Properties</h3>
				<p class="coming-soon">More properties coming soon...</p>
			</section>
		</div>
	</main>
{/if}

<style>
	.loading-container,
	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		background: #f9f9f9;
	}

	.loading,
	.error-message {
		text-align: center;
		color: #666;
	}

	.error-message h2 {
		color: #d32f2f;
		margin-bottom: 20px;
	}

	.error-message a {
		color: #0066cc;
		text-decoration: none;
		font-weight: 600;
	}

	.project-detail {
		background: #f9f9f9;
		padding-top: 0;
	}

	.hero-section {
		position: relative;
		height: 500px;
		overflow: hidden;
		background: #333;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.featured-badge {
		position: absolute;
		top: 20px;
		left: 20px;
		background: rgba(212, 175, 55, 0.95);
		color: white;
		padding: 10px 20px;
		border-radius: 20px;
		font-weight: 600;
		z-index: 10;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 20px;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 40px;
		margin-bottom: 60px;
	}

	.breadcrumb {
		font-size: 14px;
		color: #666;
		margin-bottom: 20px;
	}

	.breadcrumb a {
		color: #0066cc;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.detail-content h1 {
		font-size: 42px;
		color: #1f1810;
		margin-bottom: 15px;
	}

	.meta-info {
		margin-bottom: 30px;
	}

	.category-badge {
		display: inline-block;
		background: #d4af37;
		color: #1f1810;
		padding: 6px 14px;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 600;
		margin-right: 15px;
	}

	.location {
		color: #666;
		margin: 10px 0 0 0;
	}

	.price-section {
		background: white;
		padding: 25px;
		border-radius: 8px;
		margin-bottom: 30px;
		border-left: 4px solid #0066cc;
	}

	.price {
		font-size: 36px;
		color: #0066cc;
		margin: 0;
		font-weight: 700;
	}

	.specs {
		color: #666;
		margin: 10px 0 0 0;
		font-size: 14px;
	}

	.section {
		background: white;
		padding: 30px;
		margin-bottom: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.section h3 {
		color: #1f1810;
		margin-top: 0;
		margin-bottom: 15px;
		font-size: 22px;
	}

	.section p {
		color: #666;
		line-height: 1.6;
		margin: 0;
	}

	.amenities-list {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.amenities-list li {
		color: #666;
		padding: 10px;
		background: #f5f5f5;
		border-radius: 4px;
	}

	.facts-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
	}

	.fact {
		padding: 15px;
		background: #f9f9f9;
		border-radius: 4px;
		border-left: 3px solid #d4af37;
	}

	.fact .label {
		display: block;
		color: #999;
		font-size: 12px;
		text-transform: uppercase;
		font-weight: 600;
		margin-bottom: 5px;
	}

	.fact .value {
		display: block;
		color: #1f1810;
		font-size: 16px;
		font-weight: 600;
	}

	/* Sidebar */
	.detail-sidebar {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.contact-card,
	.info-card {
		background: white;
		padding: 30px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.contact-card h3 {
		color: #1f1810;
		margin-top: 0;
		margin-bottom: 10px;
	}

	.contact-card > p {
		color: #666;
		font-size: 14px;
		margin-bottom: 20px;
	}

	.success-message {
		background: #d4edda;
		color: #155724;
		padding: 15px;
		border-radius: 4px;
		margin-bottom: 20px;
		border: 1px solid #c3e6cb;
	}

	.form-group {
		margin-bottom: 15px;
	}

	.form-group label {
		display: block;
		color: #1f1810;
		font-weight: 600;
		margin-bottom: 6px;
		font-size: 14px;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
	}

	.btn-submit {
		width: 100%;
		background: linear-gradient(135deg, #0066cc, #0052a3);
		color: white;
		padding: 12px;
		border: none;
		border-radius: 4px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
	}

	.btn-submit:hover:not(:disabled) {
		background: linear-gradient(135deg, #0052a3, #003d7a);
		transform: translateY(-2px);
	}

	.btn-submit:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.info-card h4 {
		color: #1f1810;
		margin-top: 0;
		margin-bottom: 10px;
	}

	.info-card p {
		color: #666;
		font-size: 14px;
		margin: 10px 0;
	}

	.contact-info {
		margin-top: 15px;
		padding-top: 15px;
		border-top: 1px solid #eee;
	}

	.contact-info a {
		color: #0066cc;
		text-decoration: none;
		font-weight: 600;
	}

	.contact-info a:hover {
		text-decoration: underline;
	}

	/* Related Section */
	.related-section {
		margin-top: 60px;
	}

	.related-section h3 {
		color: #1f1810;
		margin-bottom: 20px;
		font-size: 24px;
	}

	.coming-soon {
		color: #999;
		font-style: italic;
		padding: 40px;
		text-align: center;
		background: white;
		border-radius: 8px;
	}

	@media (max-width: 768px) {
		.detail-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.hero-section {
			height: 300px;
		}

		.detail-content h1 {
			font-size: 28px;
		}

		.price {
			font-size: 28px;
		}

		.amenities-list {
			grid-template-columns: 1fr;
		}

		.facts-grid {
			grid-template-columns: 1fr;
		}

		.detail-sidebar {
			order: -1;
		}
	}
</style>
