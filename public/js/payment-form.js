import { CardService } from './api-service.js'
import { OrderService } from './api-service.js'
import { ERROR_HANDLER_CONFIG, INPUT_FORMATS, LOADING_ICON } from './config.js'
import { CardLogosUI } from './ui/card-logos.js'
import { ErrorHandler } from './ui/error.js'
import { formatCurrency } from './utils/currency-formatter.js'
import { EventBus } from './utils/event-bus.js'
import { InputFormatter } from './utils/input-formatter.js'
import { CardNumberValidator } from './validators/card-number-validator.js'
import { CvvValidator } from './validators/cvv-validator.js'
import { ExpirationDateValidator } from './validators/expiry-date-validator.js'

export class PaymentForm {
	constructor() {
		this.cardService = new CardService()
		this.orderService = new OrderService()
		this.eventBus = new EventBus()

		this.validators = {
			cardNumber: new CardNumberValidator(),
			expiryDate: new ExpirationDateValidator(),
			cvv: new CvvValidator()
		}

		this.plugins = []
		this.customValidators = {}

		// Form elements (will be initialized in initElements)
		this.paymentForm = null
		this.cardnumInput = null
		this.expiredInput = null
		this.cvvInput = null
		this.submitButton = null
		this.summary = null

		this.initElements()
		this.initServices()
	}

	/*
	 * *****************************************************
	 * ==================== Plugin System ====================
	 * *****************************************************
	 */
	registerPlugin(plugin) {
		if (!plugin) return

		this.plugins.push(plugin)

		// Register custom validators if provided
		if (plugin.customValidators) {
			Object.assign(this.customValidators, plugin.customValidators)
		}

		// Initialize plugin if it has init method
		if (typeof plugin.init === 'function') {
			try {
				plugin.init(this)
			} catch (error) {
				console.error('Plugin initialization failed:', error)
			}
		}
	}

	/*
	 * *****************************************************
	 * ==================== Initialization Methods ====================
	 * *****************************************************
	 */
	initElements() {
		this.summary = document.getElementById('order-summary')
		this.cardnumInput = document.getElementById('cardnum')
		this.expiredInput = document.getElementById('expired')
		this.cvvInput = document.getElementById('cvv2')
		this.paymentForm = document.getElementById('paymentform')
		this.submitButton = this.paymentForm?.querySelector(
			'button[type="submit"]'
		)

		// Summary elements
		if (this.summary) {
			this.amountElement = this.summary.querySelector('#amount')
			this.commissionElement = this.summary.querySelector('#commission')
			this.totalAmountElement = this.summary.querySelector('#total')
			this.needCommission = this.summary.dataset.needCommission === 'true'
		}
	}

	initServices() {
		this.cardLogos = new CardLogosUI('paysys-logos')
		this.errorHandler = new ErrorHandler(ERROR_HANDLER_CONFIG)

		if (this.submitButton) {
			this.submitButton.dataset.originalText = this.submitButton.innerHTML
		}
	}

	async init() {
		try {
			await this.loadAvailableCards()
			this.initFormatters()
			this.initValidation()
			this.initSubmitHandler()
			this.initEventListeners()
		} catch (error) {
			console.error('Payment form initialization failed:', error)
			this.errorHandler.showGeneralError(
				'Ошибка инициализации платежной формы',
				{
					isPersistent: true
				}
			)
		}
	}

	/*
	 * *****************************************************
	 * ==================== Core Functionality ====================
	 * *****************************************************
	 */
	async loadAvailableCards() {
		try {
			this.availableCards = await this.cardService.fetchAvailableCards()
			this.cardLogos.preloadImages(this.availableCards)
			this.cardLogos.render(this.availableCards)
		} catch (error) {
			console.error('Failed to load available cards:', error)
			this.errorHandler.showGeneralError(
				'Не удалось загрузить информацию о картах. Пожалуйста, обновите страницу.',
				{
					isPersistent: true
				}
			)
			this.availableCards = []
		}
	}

	initFormatters() {
		this.cardnumFormatter = new InputFormatter(
			INPUT_FORMATS.CARD_NUMBER.pattern,
			INPUT_FORMATS.CARD_NUMBER.maxLength
		)

		this.expiredFormatter = new InputFormatter(
			INPUT_FORMATS.EXPIRY_DATE.pattern,
			INPUT_FORMATS.EXPIRY_DATE.maxLength
		)

		this.cvvFormatter = new InputFormatter(
			INPUT_FORMATS.CVV.pattern,
			INPUT_FORMATS.CVV.maxLength
		)
	}

	/*
	 * *****************************************************
	 * ==================== Validation System ====================
	 * *****************************************************
	 */
	initValidation() {
		this.initCardNumberValidation()
		this.initExpiryDateValidation()
		this.initCvvValidation()
	}

	initCardNumberValidation() {
		if (!this.cardnumInput) return

		const debouncedUpdateCommission = this.debounce(
			this.updateCommission.bind(this),
			100
		)

		this.cardnumInput.addEventListener('input', () => {
			const digitsOnly = this.cardnumFormatter.format(this.cardnumInput)
			const result = this.validators.cardNumber.validate(
				digitsOnly,
				this.availableCards
			)

			if (result.detectedCardType) {
				this.cardLogos.highlightCard(result.detectedCardType)
				debouncedUpdateCommission(
					result.detectedCardType,
					this.getAmount()
				)
			} else {
				this.eventBus.emit('commission-updated', {
					commission: 0,
					totalAmount: this.getAmount()
				})
				this.cardLogos.highlightCard('')
			}

			this.eventBus.emit('card-type-detected', {
				cardType: result.detectedCardType,
				cardNumber: digitsOnly
			})

			this.errorHandler.toggleError(
				'cardnum',
				result.isValid,
				result.error
			)
		})
	}

	initExpiryDateValidation() {
		if (!this.expiredInput) return

		this.expiredInput.addEventListener('input', () => {
			const digitsOnly = this.expiredFormatter.format(this.expiredInput)
			const result = this.validateExpiry(
				digitsOnly,
				this.cardnumInput?.value
			)
			this.errorHandler.toggleError(
				'expired',
				result.isValid,
				result.error
			)
		})
	}

	validateExpiry(date, cardNumber = '') {
		for (const validator of Object.values(this.customValidators)) {
			if (typeof validator.validate === 'function') {
				const customResult = validator.validate(date, cardNumber)
				if (customResult !== undefined) return customResult
			}
		}
		return this.validators.expiryDate.validate(date)
	}

	initCvvValidation() {
		if (!this.cvvInput) return

		this.cvvInput.addEventListener('input', () => {
			const digitsOnly = this.cvvFormatter.format(this.cvvInput)
			const result = this.validators.cvv.validate(digitsOnly)
			this.errorHandler.toggleError('cvv2', result.isValid, result.error)
		})
	}

	isFormValid() {
		const cardnumResult = this.validators.cardNumber.validate(
			this.cardnumInput?.value,
			this.availableCards
		)

		const expiredResult = this.validateExpiry(
			this.expiredInput?.value,
			this.cardnumInput?.value
		)

		const cvvResult = this.validators.cvv.validate(this.cvvInput?.value)

		this.errorHandler.toggleError(
			'cardnum',
			cardnumResult.isValid,
			cardnumResult.error
		)
		this.errorHandler.toggleError(
			'expired',
			expiredResult.isValid,
			expiredResult.error
		)
		this.errorHandler.toggleError(
			'cvv2',
			cvvResult.isValid,
			cvvResult.error
		)

		return (
			cardnumResult.isValid && expiredResult.isValid && cvvResult.isValid
		)
	}

	/*
	 * *****************************************************
	 * ==================== Form Submission ====================
	 * *****************************************************
	 */
	initSubmitHandler() {
		if (!this.paymentForm) return

		this.paymentForm.addEventListener('submit', async e => {
			e.preventDefault()
			await this.handleFormSubmit(e)
		})
	}

	async handleFormSubmit(e) {
		if (!this.isFormValid()) return

		this.showLoading(true)
		this.errorHandler.clearGeneralError()

		try {
			const response = await this.orderService.proceed(
				e.target.uid.value,
				this.cardLogos.getHighlightedCardType(),
				this.cardnumInput.value,
				this.expiredInput.value,
				this.cvvInput.value
			)

			if (response.redirectUrl) {
				window.location.href = response.redirectUrl
			}
		} catch (error) {
			console.error('Payment failed:', error)

			const errorMessage =
				error.response?.status === 400
					? 'Некорректные данные карты'
					: 'Ошибка обработки платежа. попробуйте позже'

			this.errorHandler.showGeneralError(errorMessage, {
				isPersistent: true,
				type: 'danger'
			})
		} finally {
			this.showLoading(false)
		}
	}

	/*
	 * *****************************************************
	 * ==================== UI Methods ====================
	 * *****************************************************
	 */
	showLoading(show) {
		if (!this.submitButton) return

		if (show) {
			this.submitButton.disabled = true
			this.submitButton.innerHTML = LOADING_ICON
		} else {
			this.submitButton.disabled = false
			this.submitButton.innerHTML = this.submitButton.dataset.originalText
		}
	}

	showTestCardIndicator(isTestCard) {
		if (!this.paymentForm) return

		const existingIndicator = this.paymentForm.querySelector(
			'[data-slot="test-card-indicator"]'
		)
		if (existingIndicator) {
			existingIndicator.remove()
		}

		if (isTestCard) {
			const indicator = document.createElement('div')
			indicator.dataset.slot = 'test-card-indicator'
			indicator.className =
				'absolute top-0 right-0 bg-(--primary) text-(--primary-foreground) p-2 rounded-md animate-pulse z-10 font-semibold text-sm'
			indicator.textContent = 'тестовая карта'

			this.paymentForm.appendChild(indicator)
		}
	}

	/*
	 * *****************************************************
	 * ==================== Event Handlers ====================
	 * *****************************************************
	 */
	initEventListeners() {
		this.eventBus.on('commission-updated', data => {
			this.updateSummary(data)
		})
	}

	/*
	 * *****************************************************
	 * ==================== Helpers ====================
	 * *****************************************************
	 */
	async updateCommission(cardType, amount) {
		if (!this.needCommission) return

		try {
			const data = await this.orderService.fetchCommission(
				cardType,
				amount
			)
			this.eventBus.emit('commission-updated', data)
		} catch (error) {
			console.error('Failed to update commission:', error)
			this.errorHandler.showGeneralError(
				'Не удалось рассчитать комиссию',
				{
					timeout: 3000
				}
			)
		}
	}

	updateSummary(data) {
		if (!this.summary) return

		const currency = this.summary.dataset.currency

		if (this.commissionElement) {
			this.commissionElement.textContent = formatCurrency(
				data.commission,
				currency
			)
			this.summary.dataset.commission = data.commission
		}

		if (this.totalAmountElement) {
			this.totalAmountElement.textContent = formatCurrency(
				data.totalAmount,
				currency
			)
			this.summary.dataset.totalAmount = data.totalAmount
		}
	}

	getAmount() {
		return parseFloat(this.summary?.dataset.amount || '0')
	}

	debounce(func, wait) {
		let timeout
		return function (...args) {
			const context = this
			clearTimeout(timeout)
			timeout = setTimeout(() => func.apply(context, args), wait)
		}
	}
}
