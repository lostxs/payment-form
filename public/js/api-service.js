export class CardService {
	async fetchAvailableCards() {
		const response = await fetch(`/api/order/available-cards`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		if (!response.ok) throw new Error('Failed to fetch available cards')
		return (await response.json()).data
	}
}

export class OrderService {
	async fetchCommission(cardType, amount) {
		const response = await fetch(`/api/order/calculate-commission`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ cardType, amount })
		})
		if (!response.ok) throw new Error('Failed to fetch commission')
		return (await response.json()).data
	}

	async proceed(orderId, cardType, cardNumber, cardExpiryDate, cardCvv) {
		const response = await fetch(`/api/order/proceed`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				orderId,
				cardType,
				cardNumber,
				cardExpiryDate,
				cardCvv
			})
		})
		if (!response.ok) throw new Error('Failed to proceed order')
		return (await response.json()).data
	}
}
