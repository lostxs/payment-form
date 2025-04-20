export class ErrorHandler {
	constructor(options = {}) {
		const {
			containerId = 'payment-errors',
			errorClass = 'error-message',
			errorItemClass = 'error-item',
			errorIconClass = 'error-icon',
			hiddenClass = 'hidden',
			autoManageContainer = true,
			errorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${errorIconClass}"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9v4" /><path d="M12 16v.01" /></svg>`
		} = options

		this.container = document.getElementById(containerId)
		this.errorClass = errorClass
		this.errorItemClass = errorItemClass
		this.errorIconClass = errorIconClass
		this.hiddenClass = hiddenClass
		this.autoManageContainer = autoManageContainer
		this.errorIcon = errorIcon
		this.errors = new Map()

		if (!this.container) {
			console.warn(`Error container #${containerId} not found`)
		}
	}

	setError(fieldId, message, customIcon = null) {
		if (!message) {
			this.clearError(fieldId)
			return
		}

		let errorItem = this.errors.get(fieldId)?.element

		if (!errorItem) {
			errorItem = document.createElement('div')
			errorItem.className = this.errorItemClass
			errorItem.id = `${fieldId}-error`

			const iconContainer = document.createElement('span')
			iconContainer.className = `${this.errorIconClass}-container`
			iconContainer.innerHTML = customIcon || this.errorIcon

			const textElement = document.createElement('span')
			textElement.className = `${this.errorClass}-text`

			errorItem.appendChild(iconContainer)
			errorItem.appendChild(textElement)
			this.container.appendChild(errorItem)

			this.errors.set(fieldId, {
				element: errorItem,
				textElement: textElement,
				message: null
			})
		}

		const errorData = this.errors.get(fieldId)
		if (errorData.message !== message) {
			errorData.textElement.textContent = message
			errorItem.classList.remove(this.hiddenClass)
			errorData.message = message

			if (customIcon) {
				const iconContainer = errorItem.querySelector(
					`.${this.errorIconClass}-container`
				)
				if (iconContainer) {
					iconContainer.innerHTML = customIcon
				}
			}
		}

		if (this.autoManageContainer) {
			this._updateContainerVisibility()
		}
	}

	clearError(fieldId) {
		const error = this.errors.get(fieldId)
		if (!error) return

		error.element.classList.add(this.hiddenClass)
		error.message = null

		if (this.autoManageContainer) {
			this._updateContainerVisibility()
		}
	}

	_updateContainerVisibility() {
		if (!this.container) return

		const hasErrors = [...this.errors.values()].some(
			error => error.message && !error.isPersistent
		)

		if (
			hasErrors ||
			[...this.errors.values()].some(e => e.isPersistent && e.message)
		) {
			this.container.classList.remove(this.hiddenClass)
		} else {
			this.container.classList.add(this.hiddenClass)
		}
	}

	toggleError(field, isValid, error) {
		if (isValid) {
			this.clearError(field)
		} else {
			this.setError(field, error)
		}
	}

	showGeneralError(message, options = {}) {
		if (!this.container) return

		const {
			isPersistent = false,
			customIcon = null,
			errorId = 'general-error',
			type = 'error',
			timeout = type === 'error' ? 5000 : 3000
		} = options

		let generalError = this.errors.get(errorId)?.element

		if (!generalError) {
			generalError = document.createElement('div')
			generalError.className = `${this.errorItemClass} general-error error-type-${type}`
			generalError.id = errorId

			let icon = customIcon
			if (!icon) {
				switch (type) {
					case 'warning':
						icon = `⚠️`
						break
					case 'info':
						icon = `ℹ️`
						break
					case 'success':
						icon = `✓`
						break
					default:
						icon = this.errorIcon
				}
			}

			const iconContainer = document.createElement('span')
			iconContainer.className = `${this.errorIconClass}-container`
			iconContainer.innerHTML = icon

			const textElement = document.createElement('span')
			textElement.className = `${this.errorClass}-text`

			generalError.appendChild(iconContainer)
			generalError.appendChild(textElement)
			this.container.appendChild(generalError)

			this.errors.set(errorId, {
				element: generalError,
				textElement: textElement,
				message: null,
				isPersistent: false,
				timeoutId: null
			})
		}

		const errorData = this.errors.get(errorId)
		errorData.textElement.textContent = message
		errorData.message = message
		errorData.isPersistent = isPersistent

		if (errorData.timeoutId) {
			clearTimeout(errorData.timeoutId)
			errorData.timeoutId = null
		}

		generalError.className = `${this.errorItemClass} general-error error-type-${type}`
		generalError.classList.remove(this.hiddenClass)

		if (this.autoManageContainer) {
			this._updateContainerVisibility()
		}

		if (!isPersistent && timeout) {
			errorData.timeoutId = setTimeout(() => {
				this.clearGeneralError(errorId)
			}, timeout)
		}
	}

	clearGeneralError(errorId = 'general-error') {
		const errorData = this.errors.get(errorId)
		if (!errorData) return

		if (errorData.timeoutId) {
			clearTimeout(errorData.timeoutId)
			errorData.timeoutId = null
		}

		errorData.element.classList.add(this.hiddenClass)
		errorData.message = null

		if (this.autoManageContainer) {
			this._updateContainerVisibility()
		}
	}

	destroy() {
		this.errors.forEach(error => {
			error.element.remove()
		})
		this.errors.clear()
	}
}
