import express from 'express'
import { z } from 'zod'

import { validateParams } from '../../../common/middlewares/zod.middleware.js'
import { formatCurrency } from '../../../common/utils/formatters.js'
import { SUPPORTED_CURRENCIES } from '../../../constants/currency.constants.js'
import { HttpStatus } from '../../../constants/http.constants.js'
import { Pages } from '../../../constants/views.constants.js'

import { PagesService } from './pages.service.js'

const OrderPageResponseSchema = z.object({
	order: z.object({
		id: z.string().uuid(),
		amount: z.coerce.number().positive(),
		currency: z.enum(Object.values(SUPPORTED_CURRENCIES)),
		description: z.string(),
		needCommission: z.boolean(),
		indexNumber: z.coerce.number(),
		status: z.enum(['CREATED']),
		commission: z.coerce.number().optional(),
		totalAmount: z.coerce.number().optional()
	}),
	partner: z.object({
		id: z.string().uuid(),
		name: z.string(),
		colorScheme: z.enum(['light', 'dark']),
		defaultPaymentPage: z.boolean(),
		paymentPageLayout: z.any(),
		paymentPageScripts: z.any()
	})
})

export class OrderController {
	path = '/order'
	router = express.Router()

	constructor() {
		this._initializeRoutes()
	}

	_initializeRoutes() {
		this.router.get(
			this.path + '/:id',
			validateParams(z.object({ id: z.string().uuid() })),
			this.getOrderPage
		)
	}

	async getOrderPage(req, res, next) {
		try {
			const { id } = req.validatedParams
			const successData = await PagesService.getOrderPageData(id)

			if (!successData || !successData.order || !successData.partner) {
				return res.status(HttpStatus.NOT_FOUND).render(Pages.notFound)
			}

			if (successData.order.status === 'PAID') {
				return res.redirect(`/success?orderId=${successData.order.id}`)
			}

			const { order, partner } = successData

			const validatedData = OrderPageResponseSchema.parse({
				order,
				partner
			})

			const renderData = {
				order: {
					...validatedData.order,
					formattedAmount: formatCurrency(
						validatedData.order.amount,
						validatedData.order.currency
					),
					formattedCommission: validatedData.order.commission
						? formatCurrency(
								validatedData.order.commission,
								validatedData.order.currency
							)
						: null,
					formattedTotal: validatedData.order.totalAmount
						? formatCurrency(
								validatedData.order.totalAmount,
								validatedData.order.currency
							)
						: null
				},
				partner: {
					...validatedData.partner
				}
			}

			return validatedData.partner.defaultPaymentPage
				? res.render(Pages.defaultPaymentPage, renderData)
				: res.render(Pages.customPaymentPage, renderData)
		} catch (error) {
			next(error)
		}
	}
}
