import { App } from './app.js'
import { logger } from './common/utils/logger.js'
import { env } from './config/env.config.js'
import { OrderController as OrderApiController } from './modules/order/api/order.controller.js'
import { OrderController as OrderPagesController } from './modules/order/pages/order.controller.js'
import { SuccessController as SuccessPagesController } from './modules/order/pages/success.controller.js'

async function bootstrap() {
	const PORT = env.APPLICATION_PORT

	const app = new App(
		[
			new OrderApiController(),
			new OrderPagesController(),
			new SuccessPagesController()
		],
		PORT
	)

	app.listen(() => {
		logger.log(`Server running on http://localhost:${PORT}`)
	})
}

void bootstrap()
