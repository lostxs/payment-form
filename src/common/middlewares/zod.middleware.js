import {
	HttpErrorMessages,
	HttpStatus
} from '../../constants/http.constants.js'
import { HttpException } from '../exceptions/http-exception.js'

export const validateBody = schema => {
	return (req, res, next) => {
		const result = schema.safeParse(req.body)

		if (!result.success) {
			const errors = result.error.errors.map(e => ({
				code: e.code || 'validation_error',
				path: e.path.join('.'),
				message: e.message
			}))

			throw new HttpException(
				HttpErrorMessages.VALIDATION_ERROR,
				HttpStatus.BAD_REQUEST,
				errors
			)
		}

		req.validatedBody = result.data
		next()
	}
}

export const validateParams = schema => {
	return (req, res, next) => {
		const result = schema.safeParse(req.params)

		if (!result.success) {
			const errors = result.error.errors.map(e => ({
				code: e.code || 'validation_error',
				path: e.path.join('.'),
				message: e.message
			}))

			throw new HttpException(
				HttpErrorMessages.VALIDATION_ERROR,
				HttpStatus.BAD_REQUEST,
				errors
			)
		}

		req.validatedParams = result.data
		next()
	}
}

export const validateQuery = schema => {
	return (req, res, next) => {
		const result = schema.safeParse(req.query)

		if (!result.success) {
			const errors = result.error.errors.map(e => ({
				code: e.code || 'validation_error',
				path: e.path.join('.'),
				message: e.message
			}))

			throw new HttpException(
				HttpErrorMessages.VALIDATION_ERROR,
				HttpStatus.BAD_REQUEST,
				errors
			)
		}

		req.validatedQuery = result.data
		next()
	}
}
