export default {
	init(paymentForm) {
		const originalSubmit = paymentForm.handleFormSubmit.bind(paymentForm)

		paymentForm.handleFormSubmit = async function (e) {
			e.preventDefault()

			if (!paymentForm.isFormValid()) return

			const otp = prompt('Введите OTP код (используйте 1234):')
			if (otp !== '1234') {
				paymentForm.errorHandler.showGeneralError(
					'Некорректный OTP код',
					{
						isPersistent: true,
						type: 'danger'
					}
				)
				return
			}

			await originalSubmit(e)
		}

		console.log('OTP Verification plugin initialized')
	}
}
