import { loadPlugins } from './partner-loader.js'
import { PaymentForm } from './payment-form.js'

document.addEventListener('DOMContentLoaded', async () => {
	const paymentForm = new PaymentForm()
	await loadPlugins(paymentForm)

	paymentForm.init()
})
