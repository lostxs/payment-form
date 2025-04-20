import { CARD_TYPES } from '../../constants/cards.constants.js'

/**
 * Checks if card number matches a numeric range
 * @param {string} cardNumber - Card number
 * @param {number} min - Range start
 * @param {number} max - Range end
 * @returns {boolean} True if matches
 */
function matchesRange(cardNumber, min, max) {
	const prefix = cardNumber.slice(0, String(min).length)
	const num = parseInt(prefix, 10)
	return num >= min && num <= max
}

/**
 * Checks if card number matches a specific pattern
 * @param {string} cardNumber - Card number
 * @param {number} pattern - Pattern to match
 * @returns {boolean} True if matches
 */
function matchesPattern(cardNumber, pattern) {
	return cardNumber.startsWith(String(pattern))
}

/**
 * Determines if card number matches given pattern(s)
 * @param {string} cardNumber - Card number
 * @param {Array|number} pattern - Pattern(s) to check
 * @returns {boolean} True if matches
 */
function matches(cardNumber, pattern) {
	if (Array.isArray(pattern)) {
		return matchesRange(cardNumber, pattern[0], pattern[1])
	}
	return matchesPattern(cardNumber, pattern)
}

export class CardTypeChecker {
	constructor() {
		this._validateCardTypes(CARD_TYPES)
		this.cardTypes = Object.freeze({ ...CARD_TYPES })
		this.testOrder = Object.keys(CARD_TYPES).map(
			key => CARD_TYPES[key].type
		)
		this.cardNames = Object.freeze(
			Object.keys(CARD_TYPES).reduce((acc, key) => {
				acc[key] = CARD_TYPES[key].type
				return acc
			}, {})
		)
	}

	/**
	 * Validates card types configuration structure
	 * @private
	 * @param {Object} cardTypes - Card types configuration
	 * @throws {Error} If configuration is invalid
	 */
	_validateCardTypes(cardTypes) {
		if (!cardTypes || typeof cardTypes !== 'object') {
			throw new Error('Invalid card types configuration')
		}

		Object.values(cardTypes).forEach(config => {
			if (!config.type || !config.patterns || !config.lengths) {
				throw new Error(
					`Invalid card type configuration: ${JSON.stringify(config)}`
				)
			}
			if (
				!Array.isArray(config.patterns) ||
				!Array.isArray(config.lengths)
			) {
				throw new Error(
					`Patterns and lengths must be arrays in: ${config.type}`
				)
			}
		})
	}

	/**
	 * Checks if the input is a non-empty string
	 * @private
	 * @param {string} cardNumber - The card number to check
	 * @returns {boolean} True if valid input
	 */
	_isValidInputType(cardNumber) {
		return typeof cardNumber === 'string' && cardNumber.trim().length > 0
	}

	/**
	 * Deep clones an object
	 * @private
	 * @param {Object} obj - The object to clone
	 * @returns {Object} Cloned object
	 * @throws {Error} If input is not an object
	 * @example
	 * const checker = new CardTypeChecker()
	 * const result = checker.clone({ type: 'VISA', patterns: [4], lengths: [16] })
	 * console.log(result) // { type: 'VISA', patterns: [4], lengths: [16] }
	 */
	clone(obj) {
		if (obj == null || typeof obj !== 'object') {
			throw new Error('Invalid input: expected an object')
		}
		return JSON.parse(JSON.stringify(obj))
	}

	/**
	 * Finds card type configuration
	 * @param {string} cardType - Card type name
	 * @returns {Object} Card configuration
	 * @throws {Error} If card type doesn't exist
	 */
	findType(cardType) {
		const foundType = Object.values(this.cardTypes).find(
			t => t.type === cardType
		)
		if (!foundType) {
			throw new Error(`Unknown card type: ${cardType}`)
		}
		return this.clone(foundType)
	}

	/**
	 * Gets all card types in current test order
	 * @returns {Array<Object>} Array of card configurations
	 */
	getAllCardTypes() {
		return this.testOrder.map(cardType => this.findType(cardType))
	}

	/**
	 * Determines possible card types by number
	 * @param {string} cardNumber - Card number to check
	 * @returns {Array<Object>} Matching card configurations
	 * @example
	 * const checker = new CardTypeChecker()
	 * const result = checker.determine('4111111111111111')
	 * console.log(result) // [{ type: 'VISA', patterns: [4], lengths: [16] }]
	 */
	determine(cardNumber) {
		if (!this._isValidInputType(cardNumber)) {
			return []
		}

		const results = []
		const normalizedNumber = cardNumber.replace(/\D/g, '')

		for (const cardType of this.testOrder) {
			const config = this.findType(cardType)
			const match = this._findBestPatternMatch(normalizedNumber, config)
			if (match) {
				results.push(match)
			}
		}

		return this._getBestMatches(results)
	}

	/**
	 * Finds the best pattern match for card number
	 * @private
	 * @param {string} cardNumber - Card number
	 * @param {Object} config - Card configuration
	 * @returns {Object|null} Best match or null
	 */
	_findBestPatternMatch(cardNumber, config) {
		let bestMatch = null
		let maxStrength = 0

		for (const pattern of config.patterns) {
			if (matches(cardNumber, pattern)) {
				const strength = this._calculatePatternStrength(pattern)
				if (strength > maxStrength) {
					maxStrength = strength
					bestMatch = this.clone(config)
					bestMatch.matchStrength = strength
				}
			}
		}

		return bestMatch
	}

	/**
	 * Calculates pattern matching strength
	 * @private
	 * @param {Array|number} pattern - Pattern to evaluate
	 * @returns {number} Pattern strength
	 */
	_calculatePatternStrength(pattern) {
		if (Array.isArray(pattern)) {
			return String(pattern[0]).length
		}
		return String(pattern).length
	}

	/**
	 * Filters and returns best matches
	 * @private
	 * @param {Array} results - All matches
	 * @returns {Array} Best matches
	 */
	_getBestMatches(results) {
		if (results.length === 0) return []

		const maxStrength = Math.max(...results.map(r => r.matchStrength))
		return results.filter(r => r.matchStrength === maxStrength)
	}

	/**
	 * Gets card type names
	 * @returns {Object} Card type names mapping
	 */
	getCardTypeNames() {
		return this.cardNames
	}

	/**
	 * Sets new test order
	 * @param {Array<string>} newOrder - Array of card type names
	 * @returns {CardTypeChecker} Returns this
	 * @throws {Error} If invalid order provided
	 */
	setTestOrder(newOrder) {
		if (!Array.isArray(newOrder)) {
			throw new Error('Expected an array of card types')
		}

		const validTypes = Object.values(this.cardNames)
		const invalidTypes = newOrder.filter(type => !validTypes.includes(type))

		if (invalidTypes.length > 0) {
			throw new Error(`Invalid card types: ${invalidTypes.join(', ')}`)
		}

		this.testOrder = [...newOrder]
		return this
	}

	/**
	 * Resets test order to default
	 * @returns {CardTypeChecker} Returns this
	 */
	resetTestOrder() {
		this.testOrder = Object.keys(CARD_TYPES).map(
			key => CARD_TYPES[key].type
		)
		return this
	}

	/**
	 * Async version of getAllCardTypes
	 * @async
	 * @returns {Promise<Array<Object>>} Card configurations
	 */
	async getAll() {
		return this.getAllCardTypes()
	}
}

export const cardTypeChecker = new CardTypeChecker()
