// Standard limit for future years
const DEFAULT_MAX_FUTURE_YEARS = 30

/**
 * Creates a verification result object
 * @param {boolean} isValid - Is the year valid
 * @param {boolean} [isCurrentYear] - Is current year
 * @returns {Object} Verification result
 */
function createVerificationResult(isValid, isCurrentYear = false) {
	return { isValid, isCurrentYear }
}

/**
 * Normalizes year value to 4 digits
 * @param {string} value - Year value
 * @param {number} currentYear - Current year
 * @returns {number} 4-digit year
 */
function normalizeYear(value, currentYear) {
	if (value.length === 2) {
		const currentCentury = Math.floor(currentYear / 100) * 100
		const twoDigitYear = parseInt(value, 10)
		const currentTwoDigitYear = currentYear % 100

		// Для 2-значных годов используем текущее столетие
		return twoDigitYear >= currentTwoDigitYear
			? currentCentury + twoDigitYear
			: currentCentury + 100 + twoDigitYear
	}
	return parseInt(value, 10)
}

/**
 * Validates card expiration year
 * @param {string|number} value - Year value to validate
 * @param {number} [maxFutureYears] - Maximum allowed future years
 * @returns {Object} Verification result
 */
export function expirationYear(
	value,
	maxFutureYears = DEFAULT_MAX_FUTURE_YEARS
) {
	// Input validation
	if (
		value == null ||
		(typeof value !== 'string' && typeof value !== 'number')
	) {
		return createVerificationResult(false)
	}

	const strValue = String(value).trim()

	// Empty or non-numeric check
	if (strValue === '' || !/^\d+$/.test(strValue)) {
		return createVerificationResult(false)
	}

	// Length validation
	if (strValue.length !== 2 && strValue.length !== 4) {
		return createVerificationResult(false)
	}

	const currentYear = new Date().getFullYear()
	const normalizedYear = normalizeYear(strValue, currentYear)

	// Check if year is current year
	const isCurrentYear = normalizedYear === currentYear

	// Validate year range
	const maxValidYear = currentYear + maxFutureYears
	const isValid =
		normalizedYear >= currentYear && normalizedYear <= maxValidYear

	return createVerificationResult(isValid, isCurrentYear)
}
