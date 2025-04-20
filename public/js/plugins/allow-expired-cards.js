export default {
	customValidators: {
		expiry: {
			validate: (date, cardNumber) => {
				if (cardNumber?.startsWith('4111')) {
					return { isValid: true, isTestCard: true }
				}
				return undefined
			}
		}
	},

	init(paymentForm) {
		console.log('AllowExpiredCards plugin initialized')

		paymentForm.eventBus.on('card-type-detected', data => {
			const isTestCard = data.cardNumber
				?.replace(/\s/g, '')
				.startsWith('4111')
			paymentForm.showTestCardIndicator(isTestCard)
		})
	}
}
