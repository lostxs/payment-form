import express from 'express'
import { z } from 'zod'

import { validateQuery } from '../../../common/middlewares/zod.middleware.js'
import { formatCurrency, formatDate } from '../../../common/utils/formatters.js'
import { SUPPORTED_CURRENCIES } from '../../../constants/currency.constants.js'
import { HttpStatus } from '../../../constants/http.constants.js'
import { Pages } from '../../../constants/views.constants.js'

import { PagesService } from './pages.service.js'

const SuccessPageResponseSchema = z.object({
	order: z.object({
		indexNumber: z.coerce.number(),
		description: z.string(),
		needCommission: z.boolean()
	}),
	transaction: z.object({
		amount: z.coerce.number(),
		currency: z.enum(Object.values(SUPPORTED_CURRENCIES)),
		commission: z.coerce.number(),
		cardType: z.string(),
		cardNumberLastDigits: z.string(),
		commission: z.coerce.number(),
		totalAmount: z.coerce.number(),
		processedAt: z.date()
	}),
	partner: z.object({
		colorScheme: z.enum(['light', 'dark']),
		defaultSuccessPage: z.boolean(),
		successPageLayout: z.any(),
		successPageRedirectUri: z.string().url()
	})
})

export class SuccessController {
	path = '/success'
	router = express.Router()

	constructor() {
		this._initializeRoutes()
	}

	_initializeRoutes() {
		this.router.get(
			this.path,
			validateQuery(z.object({ orderId: z.string().uuid() })),
			this.getSuccessPage
		)
	}

	async getSuccessPage(req, res, next) {
		try {
			const { orderId } = req.validatedQuery
			const successData = await PagesService.getSuccessPageData(orderId)

			if (
				!successData ||
				!successData.order ||
				!successData.transaction ||
				!successData.partner
			) {
				return res.status(HttpStatus.NOT_FOUND).render(Pages.notFound)
			}

			const { order, transaction, partner } = successData

			const validatedData = SuccessPageResponseSchema.parse({
				order,
				transaction,
				partner
			})

			const renderData = {
				order: {
					...validatedData.order
				},
				transaction: {
					...validatedData.transaction,
					formattedProcessedAt: formatDate(
						validatedData.transaction.processedAt
					),
					formattedAmount: formatCurrency(
						validatedData.transaction.amount,
						validatedData.transaction.currency
					),
					formattedCommission: formatCurrency(
						validatedData.transaction.commission,
						validatedData.transaction.currency
					),
					formattedTotalAmount: formatCurrency(
						validatedData.transaction.totalAmount,
						validatedData.transaction.currency
					)
				},
				partner: {
					...validatedData.partner
				}
			}

			return validatedData.partner.defaultSuccessPage
				? res.render(Pages.defaultSuccessPage, renderData)
				: res.render(Pages.customSuccessPage, renderData)
		} catch (error) {
			next(error)
		}
	}
}
