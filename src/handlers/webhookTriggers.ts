import { updateCirculatingSupply } from '../helpers/circulating';
import { filterArbitrageOpportunities } from './arbitrageOpportunities';

export async function webhookTriggers(event: ScheduledEvent) {
	console.log('Triggering webhook...');
	await sendPriceDiscrepancies();

	await updateCirculatingSupply(getHour());
}

export async function sendPriceDiscrepancies() {
	try {
		console.log('Sending price discrepancies...');

		const arbitrageOpportunities = await filterArbitrageOpportunities();
		const hasArbitrageOpportunities = arbitrageOpportunities.length > 0;
		if (hasArbitrageOpportunities) {
			console.log('Arbitrage opportunities...');
			try {
				const init = {
					body: JSON.stringify({
						arbitrage_opportunities: arbitrageOpportunities,
					}),
					method: 'POST',
					headers: {
						'content-type': 'application/json;charset=UTF-8',
					},
				};

				await fetch(WEBHOOK_URL, init);
			} catch (err: any) {
				console.log(err);
			}
		}
	} catch (e) {
		console.log('Error at: ', 'sendPriceDiscrepancies');
	}
}

function getHour(): number {
	// This function only works when CIRCULATING_SUPPLY_GROUPS is set to 24
	let hour = Number(new Date().getHours() + 1); // getHours() returns 0-23
	return hour;
}

function getRandomGroup(group: number): number {
	let min = 1;
	let max = Math.floor(group);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
