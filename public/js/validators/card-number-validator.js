export class CardNumberValidator {
	constructor() {
		this.errorMessages = {
			EMPTY: 'Введите номер карты',
			INVALID: 'Неверный номер карты',
			UNSUPPORTED: 'Этот тип карты не поддерживается',
			LUHN_FAILED: 'Номер карты недействителен',
			LENGTH_FAILED: 'Некорректная длина номера карты'
		}
	}

	validate(cardNumber, availableCards) {
		const cleanNumber = cardNumber.replace(/\D/g, '')

		if (!cleanNumber)
			return this._verification(false, this.errorMessages.EMPTY, null)

		if (!/^\d+$/.test(cleanNumber))
			return this._verification(false, this.errorMessages.INVALID, null)

		const matchedCard = availableCards.find(card =>
			card.patterns.some(pattern => this._checkBin(cleanNumber, pattern))
		)

		if (!matchedCard) {
			return this._verification(
				false,
				`${this.errorMessages.UNSUPPORTED}. Доступные: ${availableCards
					.map(c => c.type)
					.join(', ')}`,
				null
			)
		}

		if (!matchedCard.lengths.includes(cleanNumber.length)) {
			return this._verification(
				false,
				this.errorMessages.LENGTH_FAILED,
				matchedCard.type
			)
		}

		if (!this._checkLuhn(cleanNumber)) {
			return this._verification(
				false,
				this.errorMessages.LUHN_FAILED,
				matchedCard.type
			)
		}

		return this._verification(true, null, matchedCard.type)
	}

	_verification(isValid, error, detectedCardType) {
		return {
			isValid,
			error: error || null,
			detectedCardType: detectedCardType || null
		}
	}

	_checkBin(cardNumber, pattern) {
		if (Array.isArray(pattern)) {
			const [min, max] = pattern
			const prefix = parseInt(
				cardNumber.slice(0, min.toString().length),
				10
			)
			return prefix >= min && prefix <= max
		}
		return cardNumber.startsWith(pattern.toString())
	}

	_checkLuhn(identifier) {
		var sum = 0
		var alt = false
		var i = identifier.length - 1
		var num

		while (i >= 0) {
			num = parseInt(identifier.charAt(i), 10)
			if (alt) {
				num *= 2
				if (num > 9) {
					num = (num % 10) + 1
				}
			}
			alt = !alt
			sum += num
			i--
		}
		return sum % 10 === 0
	}
}
