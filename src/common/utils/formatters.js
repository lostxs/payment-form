export const formatCurrency = (value, currency) => {
	return new Intl.NumberFormat(currency === 'RUB' ? 'ru-RU' : 'en-US', {
		style: 'currency',
		currency: currency
	}).format(value)
}

export const formatDate = date => {
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date)
}
