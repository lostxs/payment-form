import { logger } from '../utils/logger.js'

const loggerMiddleware = (req, res, next) => {
	const startTime = Date.now()

	res.on('finish', () => {
		const responseTime = Date.now() - startTime
		const { statusCode, statusMessage } = res

		logger.log(
			`[${req.method}] ${req.path} | ${statusCode} ${statusMessage} (${responseTime}ms)`,
			'LoggerMiddleware'
		)
	})

	next()
}

export default loggerMiddleware
