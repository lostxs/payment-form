import { expirationMonth } from './date/expiration-month.js'
import { expirationYear } from './date/expiration-year.js'
import { parseDate } from './date/parse-date.js'

/**
 * Creates a verification result object
 * @param {boolean} isValid - Is the date valid
 * @param {string|null} [month] - Month value
 * @param {string|null} [year] - Year value
 * @returns {Object} Verification result
 */
function createVerificationResult(isValid, month = null, year = null) {
	return { isValid, month, year }
}

/**
 * Validates card expiration date
 * @param {string|Object} value - Date value (string or {month, year} object)
 * @param {number} [maxFutureYears] - Maximum allowed future years
 * @returns {Object} Verification result
 */
export function validateCardExpiry(value, maxFutureYears) {
	let parsedDate

	// Parse input
	if (typeof value === 'string') {
		parsedDate = parseDate(value)
	} else if (value && typeof value === 'object') {
		parsedDate = {
			month: String(value.month || ''),
			year: String(value.year || '')
		}
	} else {
		return createVerificationResult(false)
	}

	// Validate components
	const monthResult = expirationMonth(parsedDate.month)
	const yearResult = expirationYear(parsedDate.year, maxFutureYears)

	// Combined validation
	if (!monthResult.isValid || !yearResult.isValid) {
		return createVerificationResult(false)
	}

	// Special case for current year
	if (yearResult.isCurrentYear && !monthResult.isValidForCurrentYear) {
		return createVerificationResult(false)
	}

	return createVerificationResult(
		true,
		parsedDate.month.padStart(2, '0'),
		parsedDate.year.length === 2
			? parsedDate.year
			: parsedDate.year.slice(-2)
	)
}
