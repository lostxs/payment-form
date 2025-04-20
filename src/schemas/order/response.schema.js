import { z } from 'zod'

import { CARD_TYPES } from '../../constants/cards.constants.js'
import { COMMISSION_TYPES } from '../../constants/cards.constants.js'
import { BaseResponseSchema } from '../../schemas/core/response.schema.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrderResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             status:
 *               type: string
 *               enum: [CREATED]
 *             createdAt:
 *               type: string
 *               format: date
 */
export const CreateOrderResponseSchema = BaseResponseSchema.extend({
	data: z.object({
		id: z.string().uuid(),
		status: z.literal('CREATED'),
		createdAt: z.date()
	})
})

/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessOrderResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             redirectUrl:
 *               type: string
 */
export const ProcessOrderResponseSchema = BaseResponseSchema.extend({
	data: z.object({
		redirectUrl: z.string()
	})
})

/**
 * @swagger
 * components:
 *   schemas:
 *     CalculateCommissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             commission:
 *               type: number
 *             commissionType:
 *               type: string
 *               enum: [fixed, percent, mixed]
 *             totalAmount:
 *               type: number
 */
export const CalculateCommissionResponseSchema = BaseResponseSchema.extend({
	data: z.object({
		commission: z.coerce
			.number()
			.positive()
			.transform(val => +val.toFixed(2)),
		commissionType: z.enum(Object.values(COMMISSION_TYPES)),
		totalAmount: z.coerce
			.number()
			.positive()
			.transform(val => +val.toFixed(2))
	})
})

/**
 * @swagger
 * components:
 *   schemas:
 *     GetAvailableCardsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [VISA, MASTERCARD, MIR]
 *               lengths:
 *                 type: array
 *                 items:
 *                   type: number
 *               patterns:
 *                 type: array
 *                 items:
 *                   type: number
 *               icons:
 *                 type: object
 *                 properties:
 *                   light:
 *                     type: string
 *                     nullable: true
 *                   dark:
 *                     type: string
 *                     nullable: true
 */
export const GetAvailableCardsResponseSchema = BaseResponseSchema.extend({
	data: z.array(
		z.object({
			type: z.enum(Object.values(CARD_TYPES).map(card => card.type)),
			lengths: z.array(z.coerce.number()),
			patterns: z
				.array(z.coerce.number())
				.or(
					z.array(
						z.union([z.coerce.number(), z.array(z.coerce.number())])
					)
				)
				.or(z.array(z.array(z.coerce.number()))),
			icons: z.object({
				light: z.string().nullable(),
				dark: z.string().nullable()
			})
		})
	)
})
