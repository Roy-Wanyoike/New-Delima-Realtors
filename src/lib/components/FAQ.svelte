<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Faq {
		q: string;
		a: string;
	}

	const faqs: Faq[] = [
		{
			q: 'What deposit do I need to buy a house in Nairobi?',
			a: 'Most Kenyan banks require a 10–20% deposit. For example, on a KES 10M property, expect to put down KES 1–2M in cash, with the bank financing the rest. We can connect you with mortgage advisors who’ll pre-approve you before you start viewing.'
		},
		{
			q: 'How long does the buying process take?',
			a: 'Typically 6–10 weeks from offer to handover. The longest steps are usually due diligence (title search, 2–3 weeks) and mortgage processing (3–6 weeks). Cash purchases can close in as little as 3 weeks.'
		},
		{
			q: 'Do I need a lawyer to buy property in Kenya?',
			a: 'Yes — a conveyancing advocate is essential to conduct the Lands Registry search, review the sale agreement, and register the transfer. We work with several trusted firms and can recommend one suited to your transaction.'
		},
		{
			q: 'What is a DSQ and do I need one?',
			a: 'A Domestic Servant Quarter is a small self-contained unit attached to an apartment. It’s useful for live-in help, a home office, or rental income (KES 15–25k/month). It typically adds 8–12% to resale value. Not essential, but worth considering if you have a family or plan to rent out.'
		},
		{
			q: 'Are off-plan purchases safe?',
			a: 'Off-plan (pre-construction) buys can offer 15–20% returns on completion, but carry risks: delays, developer insolvency, or quality shortfalls. We only recommend vetted developers with a track record, and we insist on escrow accounts and stage-linked payments. Always have your lawyer review the contract.'
		},
		{
			q: 'What are the ongoing costs of owning a property?',
			a: 'Beyond the mortgage, budget for: service charges (KES 5–25k/month for apartments), land rates (annual, ~0.3% of value), property insurance, and maintenance (1–2% of value/year). We provide a full cost breakdown for every listing on request.'
		}
	];

	let openIndex = $state<number | null>(0);

	function toggle(i: number) {
		openIndex = openIndex === i ? null : i;
	}
</script>

<section class="faq-section" aria-label="Frequently asked questions">
	<div class="container">
		<div class="section-header">
			<h2>Frequently Asked Questions</h2>
			<p>Answers to the questions Nairobi buyers and sellers ask us most</p>
		</div>

		<div class="faq-list">
			{#each faqs as faq, i (i)}
				<div class="faq-item" class:open={openIndex === i}>
					<button
						type="button"
						class="faq-question"
						onclick={() => toggle(i)}
						aria-expanded={openIndex === i}
					>
						<span class="q-text">{faq.q}</span>
						<span class="q-icon" aria-hidden="true">{openIndex === i ? '−' : '+'}</span>
					</button>
					<div class="faq-answer-wrapper">
						{#if openIndex === i}
							<div class="faq-answer">
								{faq.a}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="faq-cta">
			<p>Still have questions?</p>
			<a href="/contact" class="btn-contact">Ask our team →</a>
		</div>
	</div>
</section>

<style>
	.faq-section {
		padding: 70px 0;
		background: #fff;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.section-header {
		text-align: center;
		margin-bottom: 40px;
	}

	.section-header h2 {
		font-size: 2rem;
		margin: 0 0 8px;
		color: #1f1810;
	}

	.section-header p {
		color: #666;
		margin: 0;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.faq-item {
		border: 1px solid #eee;
		border-radius: 10px;
		overflow: hidden;
		transition: border-color 0.2s, box-shadow 0.2s;
		background: #fff;
	}

	.faq-item.open {
		border-color: #d4af37;
		box-shadow: 0 4px 16px rgba(212, 175, 55, 0.12);
	}

	.faq-question {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		padding: 18px 22px;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 600;
		color: #1f1810;
		transition: background 0.2s;
	}

	.faq-question:hover {
		background: #faf8f4;
	}

	.q-text {
		flex: 1;
		line-height: 1.4;
	}

	.q-icon {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: rgba(212, 175, 55, 0.15);
		color: #d4af37;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.3rem;
		font-weight: 700;
		flex-shrink: 0;
		transition: transform 0.25s, background 0.2s;
	}

	.faq-item.open .q-icon {
		background: #d4af37;
		color: #1f1810;
		transform: rotate(180deg);
	}

	.faq-answer-wrapper {
		overflow: hidden;
	}

	.faq-answer {
		padding: 0 22px 20px;
		color: #555;
		line-height: 1.7;
		font-size: 0.92rem;
		animation: fade-in 0.3s ease;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(-6px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.faq-cta {
		text-align: center;
		margin-top: 36px;
		padding: 24px;
		background: #f8f5f0;
		border-radius: 12px;
	}

	.faq-cta p {
		margin: 0 0 14px;
		color: #1f1810;
		font-weight: 600;
	}

	.btn-contact {
		display: inline-block;
		background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
		color: #1f1810;
		padding: 12px 28px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 700;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-contact:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
	}

	@media (max-width: 600px) {
		.section-header h2 {
			font-size: 1.5rem;
		}
		.faq-question {
			padding: 16px 18px;
			font-size: 0.92rem;
		}
	}
</style>
