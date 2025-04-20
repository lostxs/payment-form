import {
	HttpErrorMessages,
	HttpStatus
} from '../../constants/http.constants.js'
import { Pages } from '../../constants/views.constants.js'
import { HttpException } from '../exceptions/http-exception.js'
import { logger } from '../utils/logger.js'

const ssrErrorMiddleware = (err, req, res, next) => {
	if (res.headersSent) return next(err)

	if (err instanceof HttpException) {
		return res.status(err.status).render(Pages.error, {
			errors: err.errors,
			error: err.message,
			status: err.status
		})
	}

	logger.error(err)

	return res.status(HttpStatus.INTERNAL_SERVER_ERROR).render(Pages.error, {
		error: HttpErrorMessages.INTERNAL_SERVER_ERROR,
		status: HttpStatus.INTERNAL_SERVER_ERROR
	})
}

export default ssrErrorMiddleware
