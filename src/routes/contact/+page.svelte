<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

	let form = {
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: ''
	};

	// Honeypot field — must stay empty. Bots fill it, humans don't see it.
	let company = '';

	let status: SubmitStatus = 'idle';
	let errorMessage = '';
	let fieldErrors: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	function validate(): boolean {
		fieldErrors = {};
		if (!form.name.trim()) fieldErrors.name = 'Please enter your name.';
		if (!form.email.trim()) {
			fieldErrors.email = 'Please enter your email.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			fieldErrors.email = 'Please enter a valid email address.';
		}
		if (!form.phone.trim()) {
			fieldErrors.phone = 'Please enter your phone number.';
		}
		if (!form.subject.trim()) fieldErrors.subject = 'Please enter a subject.';
		if (!form.message.trim()) {
			fieldErrors.message = 'Please enter a message.';
		} else if (form.message.trim().length < 10) {
			fieldErrors.message = 'Message must be at least 10 characters.';
		}
		return Object.keys(fieldErrors).length === 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';

		// Honeypot: if filled, silently "succeed" without saving (bot trap).
		if (company) {
			status = 'success';
			form = { name: '', email: '', phone: '', subject: '', message: '' };
			return;
		}

		if (!validate()) {
			status = 'error';
			return;
		}

		status = 'submitting';
		dispatch('submitting');

		try {
			const { supabase } = await import('$lib/supabase');
			if (!supabase) {
				throw new Error('Our contact form is temporarily unavailable. Please call +254 727 523 752.');
			}

			const { error: err } = await supabase.from('contacts').insert([
				{
					name: form.name.trim(),
					email: form.email.trim(),
					phone: form.phone.trim(),
					subject: form.subject.trim(),
					message: form.message.trim(),
					interested_in: form.subject.trim(),
					status: 'new'
				}
			]);

			if (err) throw err;

			status = 'success';
			form = { name: '', email: '', phone: '', subject: '', message: '' };
			dispatch('success');
		} catch (err: any) {
			console.error('Contact form submission failed:', err);
			errorMessage = err?.message || 'Failed to submit your inquiry. Please try again or call us.';
			status = 'error';
			dispatch('error', errorMessage);
		}
	}

	function resetForm() {
		status = 'idle';
		errorMessage = '';
		fieldErrors = {};
	}
</script>

<svelte:head>
	<title>Contact Delima Realtors | Nairobi Real Estate Inquiries</title>
	<meta
		name="description"
		content="Contact Delima Realtors for property sales, management, valuations and consultations in Nairobi. Argwings Kodhek Road, Kilimani. +254 727 523 752."
	/>
</svelte:head>

<!-- Page Contact Start -->
<div class="page-contact-us">
	<div class="container">
		<div class="row" style="margin-bottom: 30px;">
			<div class="col-lg-12">
				<div class="section-title" style="text-align: center;">
					<h3 class="wow fadeInUp">get in touch</h3>
					<h2 class="text-anime-style-2" data-cursor="-opaque">Contact Delima Realtors <span>Today</span></h2>
					<p style="color: #666; margin-top: 15px; font-size: 1.05rem;">Reach out to our expert team for all your real estate needs. We're here to help you find the perfect property or investment opportunity.</p>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-4 col-md-6">
				<div class="contact-info-item wow fadeInUp">
					<div class="icon-box">
						<img src="/lib/assets/icon-location.svg" alt="Location icon" />
					</div>
					<div class="contact-info-content">
						<h3>nairobi headquarters</h3>
						<p>Argwings Kodhek Road, Kilimani</p>
						<p>Nairobi, Kenya</p>
					</div>
				</div>
			</div>

			<div class="col-lg-4 col-md-6">
				<div class="contact-info-item wow fadeInUp" data-wow-delay="0.25s">
					<div class="icon-box">
						<img src="/lib/assets/icon-phone.svg" alt="Phone icon" />
					</div>
					<div class="contact-info-content">
						<h3>call us 24/7</h3>
						<p><a href="tel:+254727523752" style="color: inherit; text-decoration: none;">+254 727 523 752</a></p>
						<p>Property Inquiries &amp; Support</p>
					</div>
				</div>
			</div>

			<div class="col-lg-4 col-md-6">
				<div class="contact-info-item wow fadeInUp" data-wow-delay="0.5s">
					<div class="icon-box">
						<img src="/lib/assets/icon-email-accent.svg" alt="Email icon" />
					</div>
					<div class="contact-info-content">
						<h3>e-mail us</h3>
						<p><a href="mailto:info@delimarealtors.com" style="color: inherit; text-decoration: none;">info@delimarealtors.com</a></p>
						<p>Residential &amp; Commercial Inquiries</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- Page Contact End -->

<!-- Contact Form Section Start -->
<div class="contact-form-section">
	<div class="container">
		<div class="row">
			<div class="col-lg-6">
				<div class="contact-form-content">
					<div class="section-title">
						<h3 class="wow fadeInUp">inquire now</h3>
						<h2 class="text-anime-style-2" data-cursor="-opaque">Find Your Perfect Property in <span>Nairobi's Best Neighborhoods</span></h2>
						<p class="wow fadeInUp" data-wow-delay="0.25s">Whether you're buying your first home in Karen or Westlands, investing in growth corridors like Thika Road, or seeking commercial space in Nairobi's CBD, our expert team is ready to connect you with the perfect property solution tailored to your needs.</p>
					</div>
				</div>
			</div>
			<div class="col-lg-6">
				<div class="contact-form">
					{#if status === 'success'}
						<div class="form-success" role="status" aria-live="polite">
							<div class="success-icon" aria-hidden="true">✓</div>
							<h3>Thank you for your inquiry!</h3>
							<p>Our team will get back to you within 24 hours. For urgent matters, call <a href="tel:+254727523752">+254 727 523 752</a>.</p>
							<button type="button" class="btn-default" on:click={resetForm}>Send another message</button>
						</div>
					{:else}
						<form
							id="contactForm"
							method="POST"
							class="wow fadeInUp"
							data-wow-delay="0.25s"
							novalidate
							on:submit={handleSubmit}
						>
							<div class="row">
								<div class="form-group col-md-6 mb-4">
									<label for="name" class="sr-only">Name</label>
									<input
										type="text"
										name="name"
										id="name"
										class="form-control"
										placeholder="Name *"
										bind:value={form.name}
										aria-invalid={fieldErrors.name ? 'true' : undefined}
										aria-describedby={fieldErrors.name ? 'name-error' : undefined}
										required
									/>
									{#if fieldErrors.name}
										<div id="name-error" class="help-block form-error">{fieldErrors.name}</div>
									{/if}
								</div>

								<div class="form-group col-md-6 mb-4">
									<label for="email" class="sr-only">Email</label>
									<input
										type="email"
										name="email"
										id="email"
										class="form-control"
										placeholder="Email *"
										bind:value={form.email}
										aria-invalid={fieldErrors.email ? 'true' : undefined}
										aria-describedby={fieldErrors.email ? 'email-error' : undefined}
										required
									/>
									{#if fieldErrors.email}
										<div id="email-error" class="help-block form-error">{fieldErrors.email}</div>
									{/if}
								</div>

								<div class="form-group col-md-6 mb-4">
									<label for="phone" class="sr-only">Phone</label>
									<input
										type="tel"
										name="phone"
										id="phone"
										class="form-control"
										placeholder="Phone *"
										bind:value={form.phone}
										aria-invalid={fieldErrors.phone ? 'true' : undefined}
										aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
										required
									/>
									{#if fieldErrors.phone}
										<div id="phone-error" class="help-block form-error">{fieldErrors.phone}</div>
									{/if}
								</div>

								<div class="form-group col-md-6 mb-4">
									<label for="subject" class="sr-only">Subject</label>
									<input
										type="text"
										name="subject"
										id="subject"
										class="form-control"
										placeholder="Subject *"
										bind:value={form.subject}
										aria-invalid={fieldErrors.subject ? 'true' : undefined}
										aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
										required
									/>
									{#if fieldErrors.subject}
										<div id="subject-error" class="help-block form-error">{fieldErrors.subject}</div>
									{/if}
								</div>

								<div class="form-group col-md-12 mb-5">
									<label for="message" class="sr-only">Message</label>
									<textarea
										name="message"
										id="message"
										rows="4"
										class="form-control"
										placeholder="Message * (minimum 10 characters)"
										bind:value={form.message}
										aria-invalid={fieldErrors.message ? 'true' : undefined}
										aria-describedby={fieldErrors.message ? 'message-error' : undefined}
										required
									></textarea>
									{#if fieldErrors.message}
										<div id="message-error" class="help-block form-error">{fieldErrors.message}</div>
									{/if}
								</div>

								<!-- Honeypot anti-spam field — visually hidden, must remain empty -->
								<div class="hp-field" aria-hidden="true">
									<label for="company">Company (leave blank)</label>
									<input
										type="text"
										name="company"
										id="company"
										tabindex="-1"
										autocomplete="off"
										bind:value={company}
									/>
								</div>

								{#if status === 'error' && errorMessage}
									<div class="col-md-12 mb-3">
										<div class="alert alert-error" role="alert">{errorMessage}</div>
									</div>
								{/if}

								<div class="col-md-12">
									<button type="submit" class="btn-default" disabled={status === 'submitting'}>
										{#if status === 'submitting'}
											<span class="spinner" aria-hidden="true"></span> Sending...
										{:else}
											submit now
										{/if}
									</button>
								</div>
							</div>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
<!-- Contact Form Section End -->

<!-- Google Map Start -->
<div class="google-map">
	<div class="container-fluid">
		<div class="row">
			<div class="col-lg-12">
				<div class="google-map-iframe">
					<iframe
						title="Delima Realtors Location Map"
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.2!2d36.76!3d-1.29!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d18a5%3A0xf7cf0257b8c0b94d!2sArgwings%20Kodhek%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1703158537552!5m2!1sen!2ske"
						allowfullscreen
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- Google Map End -->

<style>
	.form-error {
		color: #dc3545;
		font-size: 0.85rem;
		margin-top: 5px;
	}

	.form-control[aria-invalid='true'] {
		border-color: #dc3545;
	}

	.alert-error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
		padding: 12px 16px;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.form-success {
		text-align: center;
		padding: 40px 20px;
		background: #f0faf0;
		border: 1px solid #c3e6cb;
		border-radius: 10px;
	}

	.success-icon {
		width: 60px;
		height: 60px;
		margin: 0 auto 20px;
		background: #28a745;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30px;
		font-weight: bold;
	}

	.form-success h3 {
		color: #155724;
		margin: 0 0 10px;
		font-size: 1.4rem;
	}

	.form-success p {
		color: #155724;
		margin: 0 0 20px;
		line-height: 1.6;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Honeypot — visually hidden but present for screen readers/bots */
	.hp-field {
		position: absolute;
		left: -9999px;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		vertical-align: middle;
		margin-right: 6px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	button[type='submit']:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
