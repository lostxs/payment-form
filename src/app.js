import bodyParser from 'body-parser'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import errorMiddleware from './common/middlewares/error.middleware.js'
import loggerMiddleware from './common/middlewares/logger.middleware.js'
import ssrErrorMiddleware from './common/middlewares/ssr-error.middleware.js'
import { getSwaggerConfig } from './config/swagger.config.js'

export class App {
	constructor(controllers, port) {
		this.app = express()
		this.port = port
		this.initializeLogging()

		this.initializeMiddlewares()
		this.initializeControllers(controllers)
		this.initializeErrorHandling()
		this.initializeEjs()
		this.initializeSwagger()
	}

	initializeControllers(controllers) {
		for (const controller of controllers) {
			this.app.use('/', controller.router)
		}
	}

	initializeErrorHandling() {
		this.app.use('/api', errorMiddleware)
		this.app.use(ssrErrorMiddleware)
	}

	initializeEjs() {
		const __filename = fileURLToPath(import.meta.url)
		const __dirname = path.dirname(__filename)

		this.app.set('views', path.join(__dirname, 'views'))
		this.app.set('view engine', 'ejs')
		this.app.use(express.static('public'))
	}

	initializeSwagger() {
		this.app.use(
			'/api-docs',
			swaggerUi.serve,
			swaggerUi.setup(swaggerJsdoc(getSwaggerConfig()))
		)
	}

	initializeMiddlewares() {
		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: true }))
	}

	initializeLogging() {
		this.app.use('/api', loggerMiddleware)
	}

	listen(callback) {
		return this.app.listen(this.port, () => callback())
	}
}
