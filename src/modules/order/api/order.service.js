import { and, eq } from 'drizzle-orm'

import { HttpException } from '../../../common/exceptions/http-exception.js'
import {
	CARD_TYPES_COMMISSION,
	COMMISSION_TYPES
} from '../../../constants/cards.constants.js'
import { HttpStatus } from '../../../constants/http.constants.js'
import db from '../../../db/instance.js'
import {
	ordersTable,
	partnersTable,
	transactionsTable
} from '../../../db/schema.js'

export class OrderService {
	static async create(data) {
		try {
			const { partnerId, amount, currency, description, needCommission } =
				data

			const [partner] = await db
				.select()
				.from(partnersTable)
				.where(eq(partnersTable.id, partnerId))
				.limit(1)

			if (!partner) {
				throw new HttpException(
					'Invalid partner ID',
					HttpStatus.BAD_REQUEST
				)
			}

			const [newOrder] = await db
				.insert(ordersTable)
				.values({
					partnerId,
					amount,
					currency,
					description,
					needCommission,
					status: 'CREATED',
					createdAt: new Date()
				})
				.returning()

			return newOrder
		} catch (error) {
			throw error
		}
	}

	static async proceed(data) {
		try {
			const { orderId, cardType, cardNumber } = data

			const [existingOrder] = await db
				.select({
					order: ordersTable,
					partner: partnersTable
				})
				.from(ordersTable)
				.where(
					and(
						eq(ordersTable.id, orderId),
						eq(ordersTable.status, 'CREATED')
					)
				)
				.innerJoin(
					partnersTable,
					eq(partnersTable.id, ordersTable.partnerId)
				)
				.limit(1)

			if (!existingOrder) {
				throw new HttpException(
					'Order not found',
					HttpStatus.BAD_REQUEST
				)
			}

			let commission = 0
			let totalAmount = existingOrder.order.amount

			if (existingOrder.order.needCommission) {
				const commissionData = this.calculateCommission(
					cardType,
					existingOrder.order.amount
				)
				commission = commissionData.commission
				totalAmount = commissionData.totalAmount
			}

			const result = await db.transaction(async tx => {
				const [updatedOrder] = await tx
					.update(ordersTable)
					.set({
						status: 'PAID'
					})
					.where(eq(ordersTable.id, orderId))
					.returning()

				const [transaction] = await tx
					.insert(transactionsTable)
					.values({
						amount: existingOrder.order.amount,
						cardNumberLastDigits: cardNumber.slice(-4),
						cardType,
						commission,
						currency: existingOrder.order.currency,
						orderId,
						processedAt: new Date(),
						status: 'SUCCEED',
						totalAmount
					})
					.returning()

				return {
					order: updatedOrder,
					transaction,
					commission,
					totalAmount
				}
			})

			return result
		} catch (error) {
			throw error
		}
	}

	static calculateCommission(cardType, amount) {
		try {
			const numericAmount =
				typeof amount === 'string' ? parseFloat(amount) : amount

			const comissionData = CARD_TYPES_COMMISSION[cardType]
			let commission = 0
			let commissionType = undefined
			let totalAmount = numericAmount

			switch (comissionData.type) {
				case COMMISSION_TYPES.FIXED:
					commission = comissionData.value
					commissionType = COMMISSION_TYPES.FIXED
					totalAmount = numericAmount + commission
					break
				case COMMISSION_TYPES.PERCENT:
					commission = numericAmount * comissionData.value
					commissionType = COMMISSION_TYPES.PERCENT
					totalAmount = numericAmount + commission
					break
				case COMMISSION_TYPES.MIXED:
					commission =
						numericAmount * comissionData.percentValue +
						comissionData.fixedValue
					commissionType = COMMISSION_TYPES.MIXED
					totalAmount = numericAmount + commission
					break
				default:
					throw new HttpException(
						'Invalid commission type',
						HttpStatus.BAD_REQUEST
					)
			}

			return {
				commission,
				commissionType,
				totalAmount
			}
		} catch (error) {
			throw error
		}
	}
}
