const DEFAULT_MAX_FUTURE_YEARS = 30

function expirationYearResult(isValid, isCurrentYear = false) {
	return { isValid, isCurrentYear }
}
function normalizeYear(value, currentYear) {
	if (value.length === 2) {
		const currentCentury = Math.floor(currentYear / 100) * 100
		const twoDigitYear = parseInt(value, 10)
		const currentTwoDigitYear = currentYear % 100

		return twoDigitYear >= currentTwoDigitYear
			? currentCentury + twoDigitYear
			: currentCentury + 100 + twoDigitYear
	}
	return parseInt(value, 10)
}
export function expirationYear(
	value,
	maxFutureYears = DEFAULT_MAX_FUTURE_YEARS
) {
	// Input validation
	if (
		value == null ||
		(typeof value !== 'string' && typeof value !== 'number')
	) {
		return expirationYearResult(false)
	}

	const strValue = String(value).trim()

	// Empty or non-numeric check
	if (strValue === '' || !/^\d+$/.test(strValue)) {
		return expirationYearResult(false)
	}

	// Length validation
	if (strValue.length !== 2 && strValue.length !== 4) {
		return expirationYearResult(false)
	}

	const currentYear = new Date().getFullYear()
	const normalizedYear = normalizeYear(strValue, currentYear)

	// Check if year is current year
	const isCurrentYear = normalizedYear === currentYear

	// Validate year range
	const maxValidYear = currentYear + maxFutureYears
	const isValid =
		normalizedYear >= currentYear && normalizedYear <= maxValidYear

	return expirationYearResult(isValid, isCurrentYear)
}

function expirationMonthResult(isValid, isValidForCurrentYear = false) {
	return { isValid, isValidForCurrentYear }
}
export function expirationMonth(value) {
	// Input validation
	if (
		value == null ||
		(typeof value !== 'string' && typeof value !== 'number')
	) {
		return expirationMonthResult(false)
	}

	const strValue = String(value).trim()

	// Empty or non-numeric check
	if (strValue === '' || !/^\d+$/.test(strValue)) {
		return expirationMonthResult(false)
	}

	const month = parseInt(strValue, 10)

	// Basic month validation
	if (month < 1 || month > 12) {
		return expirationMonthResult(false)
	}

	// Check if month is valid for current year
	const currentMonth = new Date().getMonth() + 1
	const isValidForCurrentYear = month >= currentMonth

	return expirationMonthResult(true, isValidForCurrentYear)
}

export function parseDate(dateString) {
	if (typeof dateString !== 'string') {
		return { month: '', year: '' }
	}

	// Handle various formats
	const formats = [
		// MM/YY or MM/YYYY
		/^(?<month>\d{1,2})\s*[/-]\s*(?<year>\d{2,4})$/,
		// MM YY or MM YYYY
		/^(?<month>\d{1,2})\s+(?<year>\d{2,4})$/,
		// MMDD or MMDDYY or MMDDYYYY
		/^(?<month>\d{1,2})(?<year>\d{2,4})$/
	]

	for (const format of formats) {
		const match = dateString.match(format)
		if (match) {
			return {
				month: match.groups.month,
				year: match.groups.year
			}
		}
	}

	// Fallback for ambiguous formats
	return { month: '', year: '' }
}

export class ExpirationDateValidator {
	constructor() {
		this.maxElapsedYear = DEFAULT_MAX_FUTURE_YEARS
		this.errorMessages = {
			EMPTY: 'Введите дату истечения',
			INVALID: 'Неверная дата истечения'
		}
	}

	validate(value) {
		let parsedDate

		if (!value) {
			return this._createVerificationResult(
				false,
				this.errorMessages.EMPTY,
				null,
				null
			)
		}

		if (typeof value === 'string') {
			parsedDate = parseDate(value)
		} else if (value && typeof value === 'object') {
			parsedDate = {
				month: String(value.month || ''),
				year: String(value.year || '')
			}
		} else {
			return this._createVerificationResult(
				false,
				this.errorMessages.INVALID
			)
		}

		const monthResult = expirationMonth(parsedDate.month)
		const yearResult = expirationYear(parsedDate.year, this.maxElapsedYear)

		if (!monthResult.isValid || !yearResult.isValid) {
			return this._createVerificationResult(
				false,
				this.errorMessages.INVALID,
				null,
				null
			)
		}
		if (yearResult.isCurrentYear && !monthResult.isValidForCurrentYear) {
			return this._createVerificationResult(
				false,
				this.errorMessages.INVALID,
				null,
				null
			)
		}

		return this._createVerificationResult(
			true,
			null,
			parsedDate.month.padStart(2, '0'),
			parsedDate.year.length === 2
				? parsedDate.year
				: parsedDate.year.slice(-2)
		)
	}

	_createVerificationResult(
		isValid,
		error = null,
		month = null,
		year = null
	) {
		return {
			isValid,
			error,
			month,
			year
		}
	}
}
