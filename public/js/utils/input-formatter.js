export class InputFormatter {
	constructor(pattern, maxLength) {
		this.pattern = pattern
		this.maxLength = maxLength
	}

	format(input) {
		const cursorPosition = input.selectionStart
		const originalValue = input.value
		let value = originalValue
			.replace(/\D/g, '')
			.substring(0, this.maxLength)

		let formattedValue = ''
		let valueIndex = 0
		for (
			let i = 0;
			i < this.pattern.length && valueIndex < value.length;
			i++
		) {
			if (this.pattern[i] === '#') {
				formattedValue += value[valueIndex++]
			} else {
				formattedValue += this.pattern[i]
			}
		}

		let cursorOffset = 0
		if (cursorPosition > 0) {
			const beforeCursor = originalValue.substring(0, cursorPosition)
			const numCountBefore = beforeCursor.replace(/\D/g, '').length
			let newCursorPos = 0
			let numsPassed = 0

			for (
				let i = 0;
				i < this.pattern.length && numsPassed < numCountBefore;
				i++
			) {
				if (this.pattern[i] === '#') numsPassed++
				newCursorPos++
			}
			cursorOffset = newCursorPos - cursorPosition
		}

		input.value = formattedValue
		input.setSelectionRange(
			Math.max(0, cursorPosition + cursorOffset),
			Math.max(0, cursorPosition + cursorOffset)
		)

		return value
	}
}
