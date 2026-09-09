<script lang="ts">
	const agents = [
		{
			name: 'Roy Wanyoike',
			role: 'Founder & Lead Realtor',
			image: '/lib/assets/team-1.jpg',
			phone: '+254 727 523 752',
			email: 'roy@delimarealtors.com',
			specialties: ['Luxury Villas', 'Karen & Muthaiga', 'Investment Advisory'],
			experience: '12+ years',
			listingsSold: 240,
			rating: 4.9,
			bio: 'Roy founded Delima Realtors in 2014 after a decade in Nairobi’s luxury market. He has closed over 240 transactions across Karen, Muthaiga, and Runda, and is known for his straight-talking, data-driven approach to valuations.'
		},
		{
			name: 'Aisha Mohamed',
			role: 'Senior Property Consultant',
			image: '/lib/assets/team-2.jpg',
			phone: '+254 722 100 200',
			email: 'aisha@delimarealtors.com',
			specialties: ['Westlands Apartments', 'First-time Buyers', 'Mortgage Advisory'],
			experience: '8 years',
			listingsSold: 156,
			rating: 4.8,
			bio: 'Aisha specializes in Westlands and Kilimani apartments and is our go-to for first-time buyers. She walks clients through every step — from financing to handover — and has a 100% client-satisfaction record.'
		},
		{
			name: 'David Kamau',
			role: 'Commercial & Investment Specialist',
			image: '/lib/assets/team-3.jpg',
			phone: '+254 733 400 600',
			email: 'david@delimarealtors.com',
			specialties: ['Commercial Leasing', 'Off-Plan Sales', 'ROI Analysis'],
			experience: '10 years',
			listingsSold: 98,
			rating: 4.9,
			bio: 'David leads our commercial desk, advising investors on office space in Upper Hill and Westlands, and off-plan purchases along Thika Road. He holds an MBA in Real Estate Finance.'
		},
		{
			name: 'Grace Wanjiru',
			role: 'Property Manager',
			image: '/lib/assets/team-4.jpg',
			phone: '+254 720 800 100',
			email: 'grace@delimarealtors.com',
			specialties: ['Property Management', 'Tenant Relations', 'Maintenance'],
			experience: '6 years',
			listingsSold: 0,
			rating: 4.7,
			bio: 'Grace manages our landlord portfolio — overseeing 60+ units across Kilimani and Kileleshwa, from tenant onboarding to rent collection and maintenance coordination.'
		}
	];

	function formatPhone(tel: string) {
		return tel;
	}
</script>

<svelte:head>
	<title>Meet Our Agents | Delima Realtors</title>
	<meta
		name="description"
		content="Meet the Delima Realtors team — experienced Nairobi real estate agents specializing in luxury, commercial, and first-time buyer services."
	/>
</svelte:head>

<main class="agents-page">
	<!-- Hero -->
	<div class="page-hero">
		<div class="hero-overlay"></div>
		<div class="hero-content">
			<h1>👥 Meet Our Team</h1>
			<p>The professionals behind every successful move</p>
		</div>
	</div>

	<div class="container">
		<!-- Intro -->
		<section class="intro-section">
			<p class="intro-text">
				Our agents aren’t just salespeople — they’re Nairobi neighborhood specialists with deep market knowledge and a genuine commitment to finding you the right property. Get to know them below, then reach out directly.
			</p>
		</section>

		<!-- Agents grid -->
		<div class="agents-grid">
			{#each agents as agent, i (agent.name)}
				<article class="agent-card" style="--card-delay: {i * 80}ms">
					<div class="card-image">
						<img src={agent.image} alt={agent.name} loading="lazy" />
						<div class="card-rating" title="Client rating">
							<span class="stars">★</span>
							<span class="rating-num">{agent.rating}</span>
						</div>
					</div>

					<div class="card-body">
						<h2>{agent.name}</h2>
						<p class="role">{agent.role}</p>

						<p class="bio">{agent.bio}</p>

						<div class="stats-row">
							<div class="stat">
								<span class="stat-num">{agent.experience}</span>
								<span class="stat-label">Experience</span>
							</div>
							{#if agent.listingsSold > 0}
								<div class="stat">
									<span class="stat-num">{agent.listingsSold}+</span>
									<span class="stat-label">Sales</span>
								</div>
							{:else}
								<div class="stat">
									<span class="stat-num">60+</span>
									<span class="stat-label">Units managed</span>
								</div>
							{/if}
						</div>

						<div class="specialties">
							{#each agent.specialties as s}
								<span class="specialty-tag">{s}</span>
							{/each}
						</div>

						<div class="contact-row">
							<a href="tel:{agent.phone}" class="contact-btn phone" aria-label="Call {agent.name}">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
								Call
							</a>
							<a href="mailto:{agent.email}" class="contact-btn email" aria-label="Email {agent.name}">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
								Email
							</a>
						</div>
					</div>
				</article>
			{/each}
		</div>

		<!-- Join the team CTA -->
		<section class="join-cta">
			<div class="join-card">
				<div class="join-text">
					<h3>Want to join our team?</h3>
					<p>We’re always looking for passionate, licensed real estate professionals who put clients first.</p>
				</div>
				<a href="/contact" class="btn-join">Get in Touch</a>
			</div>
		</section>
	</div>
</main>

<style>
	.agents-page {
		background: #f9f9f9;
	}

	.page-hero {
		position: relative;
		min-height: 280px;
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at top, rgba(212, 175, 55, 0.15), transparent 70%);
	}

	.hero-content {
		position: relative;
		text-align: center;
		color: #fff;
		padding: 20px;
		z-index: 1;
	}

	.hero-content h1 {
		font-size: 2.4rem;
		margin: 0 0 10px;
	}

	.hero-content p {
		color: rgba(255, 255, 255, 0.75);
		font-size: 1.05rem;
		margin: 0;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 40px 20px 60px;
	}

	.intro-section {
		text-align: center;
		margin-bottom: 40px;
	}

	.intro-text {
		max-width: 720px;
		margin: 0 auto;
		color: #555;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
	}

	.agent-card {
		background: #fff;
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(31, 24, 16, 0.08);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		animation: card-fade 0.5s ease backwards;
		animation-delay: var(--card-delay);
	}

	@keyframes card-fade {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.agent-card:hover {
		transform: translateY(-6px);
		box-shadow: 0 12px 36px rgba(31, 24, 16, 0.15);
	}

	.card-image {
		position: relative;
		height: 260px;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.agent-card:hover .card-image img {
		transform: scale(1.06);
	}

	.card-rating {
		position: absolute;
		top: 12px;
		right: 12px;
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(31, 24, 16, 0.85);
		color: #fff;
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		backdrop-filter: blur(6px);
	}

	.stars {
		color: #d4af37;
	}

	.card-body {
		padding: 22px;
	}

	.card-body h2 {
		font-size: 1.25rem;
		margin: 0 0 4px;
		color: #1f1810;
	}

	.role {
		color: #d4af37;
		font-size: 0.85rem;
		font-weight: 600;
		margin: 0 0 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.bio {
		color: #666;
		font-size: 0.88rem;
		line-height: 1.6;
		margin: 0 0 16px;
	}

	.stats-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		padding: 14px;
		background: #f8f5f0;
		border-radius: 10px;
		margin-bottom: 16px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-num {
		font-size: 1.15rem;
		font-weight: 700;
		color: #1f1810;
	}

	.stat-label {
		font-size: 0.7rem;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.specialties {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 18px;
	}

	.specialty-tag {
		background: rgba(212, 175, 55, 0.12);
		color: #8a6d10;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 0.72rem;
		font-weight: 500;
		border: 1px solid rgba(212, 175, 55, 0.25);
	}

	.contact-row {
		display: flex;
		gap: 10px;
	}

	.contact-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px;
		border-radius: 8px;
		text-decoration: none;
		font-size: 0.82rem;
		font-weight: 600;
		transition: all 0.2s;
	}

	.contact-btn.phone {
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
	}

	.contact-btn.phone:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
	}

	.contact-btn.email {
		background: #f0f0f0;
		color: #1f1810;
	}

	.contact-btn.email:hover {
		background: #e5e5e5;
	}

	.join-cta {
		margin-top: 50px;
	}

	.join-card {
		background: linear-gradient(135deg, #1f1810 0%, #3d2f25 100%);
		color: #fff;
		border-radius: 16px;
		padding: 36px 40px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		flex-wrap: wrap;
		position: relative;
		overflow: hidden;
	}

	.join-card::before {
		content: '';
		position: absolute;
		top: -40%;
		right: -10%;
		width: 280px;
		height: 280px;
		background: radial-gradient(circle, rgba(212, 175, 55, 0.15), transparent 70%);
		border-radius: 50%;
	}

	.join-text {
		position: relative;
	}

	.join-text h3 {
		margin: 0 0 6px;
		font-size: 1.4rem;
	}

	.join-text p {
		margin: 0;
		color: rgba(255, 255, 255, 0.7);
	}

	.btn-join {
		position: relative;
		display: inline-block;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		padding: 14px 32px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 700;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-join:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
	}

	@media (max-width: 600px) {
		.hero-content h1 { font-size: 1.7rem; }
		.agents-grid { grid-template-columns: 1fr; }
		.join-card { flex-direction: column; text-align: center; }
	}
</style>
