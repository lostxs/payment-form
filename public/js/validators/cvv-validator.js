export class CvvValidator {
	constructor() {
		this.maxLength = 3
		this.errorMessages = {
			EMPTY: 'Введите CVV',
			INVALID: 'Неверный CVV'
		}
	}

	validate(value) {
		this.maxLength =
			this.maxLength instanceof Array ? this.maxLength : [this.maxLength]

		if (!value) {
			return this._verification(false, this.errorMessages.EMPTY)
		}

		if (typeof value !== 'string') {
			return this._verification(false, this.errorMessages.INVALID)
		}
		if (!/^\d*$/.test(value)) {
			return this._verification(false, this.errorMessages.INVALID)
		}
		if (this._includes(this.maxLength, value.length)) {
			return this._verification(true, null)
		}
		if (value.length < Math.min.apply(null, this.maxLength)) {
			return this._verification(false, this.errorMessages.INVALID)
		}
		if (value.length > this._max(this.maxLength)) {
			return this._verification(false, this.errorMessages.INVALID)
		}
		return this._verification(true, null)
	}

	_verification(isValid, error) {
		return {
			isValid,
			error: error || null
		}
	}

	_includes(array, thing) {
		for (let i = 0; i < array.length; i++) {
			if (thing === array[i]) {
				return true
			}
		}
		return false
	}

	_max(array) {
		let maximum = this.maxLength
		let i = 0
		for (; i < array.length; i++) {
			maximum = array[i] > maximum ? array[i] : maximum
		}
		return maximum
	}
}
