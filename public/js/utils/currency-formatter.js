export const formatCurrency = (value, currency) => {
	return new Intl.NumberFormat(currency === 'RUB' ? 'ru-RU' : 'en-US', {
		style: 'currency',
		currency: currency
	}).format(value)
}
