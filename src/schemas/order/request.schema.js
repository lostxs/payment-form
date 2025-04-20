import { z } from 'zod'

import { CARD_TYPES } from '../../constants/cards.constants.js'
import { SUPPORTED_CURRENCIES } from '../../constants/currency.constants.js'
import { validateCardCvv } from '../../lib/credit-card/validate-card-cvv.js'
import { validateCardExpiry } from '../../lib/credit-card/validate-card-expiry.js'
import { validateCardNumber } from '../../lib/credit-card/validate-card-number.js'

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrderRequest:
 *       type: object
 *       properties:
 *         partnerId:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *           minimum: 1
 *         currency:
 *           type: string
 *           enum: [USD, RUB]
 *         description:
 *           type: string
 *           minLength: 1
 *         needCommission:
 *           type: boolean
 */
export const CreateOrderRequestSchema = z.object({
	partnerId: z.string().uuid(),
	amount: z.coerce.number().positive(),
	currency: z.enum(Object.values(SUPPORTED_CURRENCIES)),
	description: z.string().min(1),
	needCommission: z.coerce.boolean()
})

/**
 * @swagger
 * components:
 *   schemas:
 *     CalculateCommissionRequest:
 *       type: object
 *       properties:
 *         cardType:
 *           type: string
 *           enum: [VISA, MASTERCARD, MIR]
 *         amount:
 *           type: number
 *           minimum: 1
 */
export const CalculateCommissionRequestSchema = z.object({
	cardType: z.enum(Object.values(CARD_TYPES).map(card => card.type)),
	amount: z.coerce.number().positive()
})

const cardNumberSchema = z
	.string()
	.min(1)
	.superRefine((value, ctx) => {
		const result = validateCardNumber(value)

		if (!result.isValid) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_string,
				message: result.card
					? `Card number doesn't match ${result.card.type} requirements`
					: 'Invalid card number'
			})
		}
	})

const cardExpiryDateSchema = z
	.string()
	.min(1)
	.superRefine((value, ctx) => {
		const result = validateCardExpiry(value)

		if (!result.isValid) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_date,
				message: 'Invalid expiry date'
			})
		}
	})

const cardCvvSchema = z
	.string()
	.min(1)
	.superRefine((value, ctx) => {
		const result = validateCardCvv(value)

		if (!result.isValid) {
			ctx.addIssue({
				code: z.ZodIssueCode.too_small,
				message: 'CVV must be at least 3 digits long'
			})
		}
	})

/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessOrderRequest:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *         cardType:
 *           type: string
 *           enum: [VISA, MASTERCARD, MIR]
 *           example: "VISA"
 *         cardNumber:
 *           type: string
 *           minLength: 1
 *           example: "4111111111111111"
 *         cardExpiryDate:
 *           type: string
 *           minLength: 1
 *           example: "01/28"
 *         cardCvv:
 *           type: string
 *           minLength: 1
 *           example: "123"
 */
export const ProcessOrderRequestSchema = z.object({
	orderId: z.string().uuid(),
	cardType: z.enum(Object.values(CARD_TYPES).map(card => card.type)),
	cardNumber: cardNumberSchema,
	cardExpiryDate: cardExpiryDateSchema,
	cardCvv: cardCvvSchema
})
