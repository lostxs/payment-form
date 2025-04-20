import express from 'express'

import { validateBody } from '../../../common/middlewares/zod.middleware.js'
import {
	CARD_TYPES,
	CARD_TYPES_ICONS
} from '../../../constants/cards.constants.js'
import { HttpStatus } from '../../../constants/http.constants.js'
import {
	CalculateCommissionRequestSchema,
	CreateOrderRequestSchema,
	ProcessOrderRequestSchema
} from '../../../schemas/order/request.schema.js'
import {
	CalculateCommissionResponseSchema,
	CreateOrderResponseSchema,
	GetAvailableCardsResponseSchema,
	ProcessOrderResponseSchema
} from '../../../schemas/order/response.schema.js'

import { OrderService } from './order.service.js'

/**
 * @swagger
 * tags:
 *   name: Order
 */
export class OrderController {
	path = '/api/order'
	router = express.Router()

	constructor() {
		this._initializeRoutes()
	}

	_initializeRoutes() {
		this.router.post(
			this.path,
			validateBody(CreateOrderRequestSchema),
			this.createOrder
		)

		this.router.post(
			this.path + '/proceed',
			validateBody(ProcessOrderRequestSchema),
			this.proceedOrder
		)

		this.router.post(
			this.path + '/calculate-commission',
			validateBody(CalculateCommissionRequestSchema),
			this.calculateCommission
		)

		this.router.get(this.path + '/available-cards', this.availableCards)
	}

	/**
	 * @swagger
	 * /api/order:
	 *   post:
	 *     summary: Create a new order
	 *     tags: [Order]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: '#/components/schemas/CreateOrderRequest'
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/CreateOrderResponse'
	 *       400:
	 *         description: Bad Request
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *             example:
	 *               success: false
	 *               message: "Invalid partner ID"
	 *               errors: []
	 *       500:
	 *         description: Internal Server Error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *             example:
	 *               success: false
	 *               message: "Something went wrong"
	 *               errors:
	 *                 - code: "server_error"
	 *                   message: "An unexpected error occurred"
	 */
	async createOrder(req, res, next) {
		try {
			const { partnerId, amount, currency, description, needCommission } =
				req.validatedBody

			const newOrder = await OrderService.create({
				partnerId,
				amount,
				currency,
				description,
				needCommission
			})

			return res.status(HttpStatus.CREATED).json(
				CreateOrderResponseSchema.parse({
					success: true,
					data: newOrder,
					message: 'Order created successfully'
				})
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * @swagger
	 * /api/order/proceed:
	 *   post:
	 *     summary: Process an order
	 *     tags: [Order]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: '#/components/schemas/ProcessOrderRequest'
	 *     responses:
	 *       200:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ProcessOrderResponse'
	 *       400:
	 *         description: Bad Request
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *             example:
	 *               success: false
	 *               message: "Invalid card number"
	 *               errors:
	 *                 - code: "custom"
	 *                   message: "Invalid card number"
	 *                   path: "cardNumber"
	 *       500:
	 *         description: Internal Server Error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *             example:
	 *               success: false
	 *               message: "Something went wrong"
	 *               errors:
	 *                 - code: "server_error"
	 *                   message: "An unexpected error occurred"
	 */
	async proceedOrder(req, res, next) {
		try {
			const { orderId, cardType, cardNumber, cardExpiryDate, cardCvv } =
				req.validatedBody

			const data = await OrderService.proceed({
				orderId,
				cardType,
				cardNumber
			})

			const redirectUrl = `/success?orderId=${data.order.id}`

			return res.status(HttpStatus.OK).json(
				ProcessOrderResponseSchema.parse({
					success: true,
					data: {
						redirectUrl
					},
					message: 'Order processed successfully'
				})
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * @swagger
	 * /api/order/calculate-commission:
	 *   post:
	 *     summary: Calculate commission
	 *     tags: [Order]
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: '#/components/schemas/CalculateCommissionRequest'
	 *     responses:
	 *       200:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/CalculateCommissionResponse'
	 *       400:
	 *         description: Bad Request
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *             example:
	 *               success: false
	 *               message: "Validation failed"
	 *               errors:
	 *                 - code: "too_small"
	 *                   message: "Number must be greater than 0"
	 *                   path: "amount"
	 *       500:
	 *         description: Internal Server Error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *             example:
	 *               success: false
	 *               message: "Something went wrong"
	 *               errors:
	 *                 - code: "server_error"
	 *                   message: "An unexpected error occurred"
	 */
	async calculateCommission(req, res, next) {
		try {
			const { cardType, amount } = req.validatedBody

			const commission = OrderService.calculateCommission(
				cardType,
				amount
			)

			return res.status(HttpStatus.OK).json(
				CalculateCommissionResponseSchema.parse({
					success: true,
					data: commission,
					message: 'Commission calculated successfully'
				})
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * @swagger
	 * /api/order/available-cards:
	 *   get:
	 *     summary: Get available cards
	 *     tags: [Order]
	 *     responses:
	 *       200:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/GetAvailableCardsResponse'
	 *       500:
	 *         description: Internal Server Error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/components/schemas/ErrorResponse'
	 *             example:
	 *               success: false
	 *               message: "Something went wrong"
	 *               errors:
	 *                 - code: "server_error"
	 *                   message: "An unexpected error occurred"
	 */
	async availableCards(req, res, next) {
		try {
			const cardsWithIcons = Object.values(CARD_TYPES).map(card => ({
				type: card.type,
				lengths: card.lengths,
				patterns: card.patterns,
				icons: CARD_TYPES_ICONS[card.type]
			}))

			return res.status(HttpStatus.OK).json(
				GetAvailableCardsResponseSchema.parse({
					success: true,
					data: cardsWithIcons,
					message: 'Available cards fetched successfully'
				})
			)
		} catch (error) {
			next(error)
		}
	}
}
