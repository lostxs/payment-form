import { and, eq } from 'drizzle-orm'

import db from '../../../db/instance.js'
import {
	ordersTable,
	partnersTable,
	transactionsTable
} from '../../../db/schema.js'

export class PagesService {
	static async getOrderPageData(id) {
		try {
			const [data] = await db
				.select({
					order: ordersTable,
					partner: partnersTable
				})
				.from(ordersTable)
				.innerJoin(
					partnersTable,
					eq(ordersTable.partnerId, partnersTable.id)
				)
				.where(eq(ordersTable.id, id))
				.limit(1)

			return data ? data : null
		} catch (error) {
			throw error
		}
	}

	static async getSuccessPageData(id) {
		try {
			const [data] = await db
				.select({
					order: ordersTable,
					transaction: transactionsTable,
					partner: partnersTable
				})
				.from(ordersTable)
				.innerJoin(
					transactionsTable,
					eq(ordersTable.id, transactionsTable.orderId)
				)
				.innerJoin(
					partnersTable,
					eq(ordersTable.partnerId, partnersTable.id)
				)
				.where(
					and(eq(ordersTable.id, id), eq(ordersTable.status, 'PAID'))
				)
				.limit(1)

			return data ? data : null
		} catch (error) {
			throw error
		}
	}
}
