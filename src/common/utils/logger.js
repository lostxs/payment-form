import winston from 'winston'
import { format } from 'winston'

const { printf, timestamp, colorize } = format

export class WinstonLogger {
	logger

	constructor() {
		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.combine(
				colorize({ all: true }),
				timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
				this._format
			),
			transports: [new winston.transports.Console()]
		})
	}

	_format = printf(
		({ level, message, timestamp, context, stack, ...meta }) => {
			const processedMessage =
				typeof message === 'object'
					? message.message || JSON.stringify(message)
					: message

			let logMessage = `[${timestamp}] ${level} [${context || 'Application'}] ${processedMessage}`

			if (stack) {
				logMessage += `\n${stack}`
			}

			if (Object.keys(meta).length > 0) {
				logMessage += `\n${JSON.stringify(meta, null, 2)}`
			}

			return logMessage
		}
	)

	log(message, context) {
		this._log('info', message, null, context)
	}

	error(message, trace = '', context) {
		this._log('error', message, trace, context)
	}

	warn(message, context) {
		this._log('warn', message, null, context)
	}

	debug(message, context) {
		this._log('debug', message, null, context)
	}

	verbose(message, context) {
		this._log('verbose', message, null, context)
	}

	_log(level, message, trace, context) {
		if (message instanceof Error) {
			this.logger[level]({
				message: message.message,
				stack: message.stack,
				context,
				...(trace && { trace })
			})
		} else {
			this.logger[level](message, {
				stack: trace,
				context
			})
		}
	}
}

export const logger = new WinstonLogger()
