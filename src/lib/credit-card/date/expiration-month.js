/**
 * Creates a verification result object
 * @param {boolean} isValid - Is the month valid
 * @param {boolean} [isValidForCurrentYear] - Is valid for current year
 * @returns {Object} Verification result
 */
function createVerificationResult(isValid, isValidForCurrentYear = false) {
	return { isValid, isValidForCurrentYear }
}

/**
 * Validates card expiration month
 * @param {string|number} value - Month value to validate (1-12)
 * @returns {Object} Verification result
 */
export function expirationMonth(value) {
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

	const month = parseInt(strValue, 10)

	// Basic month validation
	if (month < 1 || month > 12) {
		return createVerificationResult(false)
	}

	// Check if month is valid for current year
	const currentMonth = new Date().getMonth() + 1
	const isValidForCurrentYear = month >= currentMonth

	return createVerificationResult(true, isValidForCurrentYear)
}
