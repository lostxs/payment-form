import {
	HttpErrorMessages,
	HttpStatus
} from '../../constants/http.constants.js'
import { ErrorResponseSchema } from '../../schemas/core/response.schema.js'
import { HttpException } from '../exceptions/http-exception.js'
import { logger } from '../utils/logger.js'

const errorMiddleware = (err, req, res, next) => {
	if (err instanceof HttpException) {
		return res.status(err.status).json(
			ErrorResponseSchema.parse({
				success: false,
				code: err.status,
				message: err.message,
				errors: err.errors || []
			})
		)
	}

	logger.error(err)

	return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
		ErrorResponseSchema.parse({
			success: false,
			code: HttpStatus.INTERNAL_SERVER_ERROR,
			message: HttpErrorMessages.INTERNAL_SERVER_ERROR,
			errors: [
				{
					code: 'server_error',
					message: 'An unexpected error occurred'
				}
			]
		})
	)
}
export default errorMiddleware
