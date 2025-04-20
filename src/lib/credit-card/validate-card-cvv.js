import { CARD_TYPES } from '../../constants/cards.constants.js'

/**
 * Checks if a value is included in an array
 * @param {Array} array - Array to check
 * @param {*} value - Value to search for
 * @returns {boolean} True if value is found
 */
function includes(array, value) {
	return array.includes(value)
}

/**
 * Finds the maximum value in an array
 * @param {Array} array - Array of numbers
 * @returns {number} Maximum value
 */
function max(array) {
	return array.length ? Math.max(...array) : 0
}

/**
 * Creates a verification result object
 * @param {boolean} isValid - Validity of CVV
 * @returns {Object} Verification result
 */
function createVerificationResult(isValid) {
	return { isValid }
}

/**
 * Validates CVV/CVC code of a card
 * @param {string} value - CVV code to check
 * @param {string} [cardType] - Card type (from CARD_TYPES)
 * @returns {Object} Verification result { isValid: boolean }
 */
export function validateCardCvv(value, cardType = null) {
	let validLengths = [3]

	if (cardType && CARD_TYPES[cardType] && CARD_TYPES[cardType].cvvLength) {
		validLengths = Array.isArray(CARD_TYPES[cardType].cvvLength)
			? CARD_TYPES[cardType].cvvLength
			: [CARD_TYPES[cardType].cvvLength]
	}

	// Check type of input value
	if (typeof value !== 'string') {
		return createVerificationResult(false)
	}

	// Remove all non-numeric characters
	const cleanValue = value.replace(/\D/g, '')

	// Check for empty string
	if (cleanValue === '') {
		return createVerificationResult(false)
	}

	// Check that the string consists only of numbers
	if (!/^\d+$/.test(cleanValue)) {
		return createVerificationResult(false)
	}

	// Check length of CVV
	const length = cleanValue.length
	const minLength = Math.min(...validLengths)
	const maxLength = max(validLengths)

	if (length < minLength) {
		return createVerificationResult(false)
	}

	if (length > maxLength) {
		return createVerificationResult(false)
	}

	// Check if length corresponds to one of the allowed values
	if (!includes(validLengths, length)) {
		return createVerificationResult(false)
	}

	return createVerificationResult(true)
}
