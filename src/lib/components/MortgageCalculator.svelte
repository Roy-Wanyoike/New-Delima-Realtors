<script lang="ts">
	import { onMount } from 'svelte';

	export let price: number; // KES

	let downPaymentPct = 20;
	let interestRate = 13.5; // Kenyan average mortgage rate ~13-14%
	let termYears = 20;

	let downPayment: number;
	let loanAmount: number;
	let monthlyPayment: number;
	let totalInterest: number;
	let totalPayable: number;

	function calculate() {
		downPayment = (price * downPaymentPct) / 100;
		loanAmount = price - downPayment;
		const monthlyRate = interestRate / 100 / 12;
		const numPayments = termYears * 12;

		if (monthlyRate === 0) {
			monthlyPayment = loanAmount / numPayments;
		} else {
			monthlyPayment =
				(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
				(Math.pow(1 + monthlyRate, numPayments) - 1);
		}

		totalPayable = monthlyPayment * numPayments;
		totalInterest = totalPayable - loanAmount;
	}

	$: price, downPaymentPct, interestRate, termYears, calculate();

	function formatKES(n: number): string {
		return Math.round(n).toLocaleString('en-KE');
	}
</script>

<div class="mortgage-calc">
	<div class="calc-header">
		<h3>💰 Mortgage Calculator</h3>
		<p>Estimate your monthly payments</p>
	</div>

	<div class="calc-body">
		<div class="calc-inputs">
			<div class="input-group">
				<label for="downpayment">Down Payment: <strong>{downPaymentPct}%</strong></label>
				<input id="downpayment" type="range" min="5" max="50" step="5" bind:value={downPaymentPct} />
				<span class="hint">KES {formatKES(downPayment)}</span>
			</div>

			<div class="input-group">
				<label for="rate">Interest Rate: <strong>{interestRate}%</strong></label>
				<input id="rate" type="range" min="5" max="25" step="0.5" bind:value={interestRate} />
				<span class="hint">Annual rate</span>
			</div>

			<div class="input-group">
				<label for="term">Loan Term: <strong>{termYears} years</strong></label>
				<input id="term" type="range" min="5" max="30" step="5" bind:value={termYears} />
				<span class="hint">{termYears * 12} monthly payments</span>
			</div>
		</div>

		<div class="calc-results">
			<div class="result-card primary">
				<span class="result-label">Monthly Payment</span>
				<span class="result-value">KES {formatKES(monthlyPayment)}</span>
			</div>
			<div class="result-row">
				<div class="result-card">
					<span class="result-label">Loan Amount</span>
					<span class="result-value small">KES {formatKES(loanAmount)}</span>
				</div>
				<div class="result-card">
					<span class="result-label">Down Payment</span>
					<span class="result-value small">KES {formatKES(downPayment)}</span>
				</div>
			</div>
			<div class="result-row">
				<div class="result-card">
					<span class="result-label">Total Interest</span>
					<span class="result-value small accent">KES {formatKES(totalInterest)}</span>
				</div>
				<div class="result-card">
					<span class="result-label">Total Payable</span>
					<span class="result-value small accent">KES {formatKES(totalPayable)}</span>
				</div>
			</div>
		</div>
	</div>

	<p class="disclaimer">
		ℹ️ Estimates only. Actual rates and terms depend on your bank, credit profile, and prevailing CBK rates.
	</p>
</div>

<style>
	.mortgage-calc {
		background: linear-gradient(135deg, #1f1810 0%, #2d2418 100%);
		border-radius: 14px;
		padding: 30px;
		color: #fff;
		box-shadow: 0 8px 28px rgba(31, 24, 16, 0.2);
	}

	.calc-header {
		margin-bottom: 24px;
	}

	.calc-header h3 {
		margin: 0 0 4px;
		font-size: 1.3rem;
	}

	.calc-header p {
		margin: 0;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.9rem;
	}

	.calc-body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30px;
	}

	.calc-inputs {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.input-group label {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.85);
	}

	.input-group label strong {
		color: #d4af37;
	}

	.input-group input[type='range'] {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.15);
		appearance: none;
		-webkit-appearance: none;
		outline: none;
		cursor: pointer;
	}

	.input-group input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #d4af37;
		cursor: pointer;
		border: 3px solid #1f1810;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	.input-group input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #d4af37;
		cursor: pointer;
		border: 3px solid #1f1810;
	}

	.hint {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.calc-results {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.result-card {
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.result-card.primary {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
		border-color: rgba(212, 175, 55, 0.4);
	}

	.result-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.result-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.result-value {
		font-size: 1.6rem;
		font-weight: 700;
		color: #d4af37;
	}

	.result-value.small {
		font-size: 1rem;
		color: #fff;
	}

	.result-value.small.accent {
		color: #d4af37;
	}

	.disclaimer {
		margin: 20px 0 0;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.45);
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.calc-body {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.mortgage-calc {
			padding: 20px;
		}

		.result-value {
			font-size: 1.3rem;
		}
	}
</style>
