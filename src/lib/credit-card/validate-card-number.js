import { cardTypeChecker } from './card-type-checker.js'

function luhnCheck(identifier) {
	let sum = 0
	let alternate = false

	for (let i = identifier.length - 1; i >= 0; i--) {
		let digit = parseInt(identifier.charAt(i), 10)

		if (alternate) {
			digit *= 2
			if (digit > 9) digit = (digit % 10) + 1
		}

		sum += digit
		alternate = !alternate
	}

	return sum % 10 === 0
}

/**
 * Creates verification result object
 * @param {Object|null} card - Card type info
 * @param {boolean} isValid - Validation result
 * @returns {Object} Verification result
 */
function createVerificationResult(card, isValid) {
	return { card, isValid }
}

/**
 * Validates card number
 * @param {string|number} value - Card number to validate
 * @returns {Object}
 * @example
 * const result = validateCardNumber('4111111111111111')
 * console.log(result)
 */
export function validateCardNumber(value) {
	// Input validation
	if (
		value == null ||
		(typeof value !== 'string' && typeof value !== 'number')
	) {
		return createVerificationResult(null, false)
	}

	// Normalize and clean input
	const cleanNumber = String(value).replace(/\D/g, '')

	// Basic checks
	if (!/^\d{12,19}$/.test(cleanNumber)) {
		return createVerificationResult(null, false)
	}

	try {
		// Determine card type
		const [cardType] = cardTypeChecker.determine(cleanNumber)

		if (!cardType) {
			return createVerificationResult(null, false)
		}

		// Length validation
		if (!cardType.lengths.includes(cleanNumber.length)) {
			return createVerificationResult(cardType, false)
		}

		// Luhn check
		const isValid = luhnCheck(cleanNumber)
		return createVerificationResult(cardType, isValid)
	} catch (error) {
		return createVerificationResult(null, false)
	}
}
