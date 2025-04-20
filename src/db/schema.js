import * as t from 'drizzle-orm/pg-core'
import { index, pgEnum, pgTable as table } from 'drizzle-orm/pg-core'

export const currencyEnum = pgEnum('currency', ['USD', 'RUB'])
export const cardTypesEnum = pgEnum('card_types', ['VISA', 'MASTERCARD', 'MIR'])

export const partnersTable = table('partners', {
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.text().notNull(),
	colorScheme: t.text('color_scheme').notNull().default('light'),

	defaultPaymentPage: t
		.boolean('default_payment_page')
		.notNull()
		.default(true),
	paymentPageLayout: t.jsonb('payment_page_layout').notNull().default({
		splitView: true,
		errorContainerPosition: 'top'
	}),
	paymentPageScripts: t.jsonb('payment_page_scripts').notNull().default([]),

	defaultSuccessPage: t
		.boolean('default_success_page')
		.notNull()
		.default(true),
	successPageLayout: t.jsonb('success_page_layout').notNull().default({
		showOrderDetails: true,
		showPaymentDetails: true
	}),
	successPageRedirectUri: t.text('success_redirect_uri').notNull()
})

export const orderStatusesEnum = pgEnum('order_statuses', ['CREATED', 'PAID'])

export const ordersTable = table(
	'orders',
	{
		id: t.uuid().primaryKey().defaultRandom(),
		partnerId: t
			.uuid('partner_id')
			.references(() => partnersTable.id)
			.notNull(),
		indexNumber: t.serial('index_number').notNull(),
		amount: t.numeric({ precision: 12, scale: 2 }).notNull(),
		currency: currencyEnum().notNull(),
		description: t.text().notNull(),
		needCommission: t.boolean('need_commission').notNull(),
		status: orderStatusesEnum().notNull(),
		createdAt: t.timestamp('created_at').notNull()
	},
	t => [index('partner_id_index').on(t.partnerId)]
)

export const transactionsStatusesEnum = pgEnum('transaction_statuses', [
	'PENDING',
	'SUCCEED',
	'FAILED'
])

export const transactionsTable = table(
	'transactions',
	{
		id: t.uuid().primaryKey().defaultRandom(),
		orderId: t
			.uuid('order_id')
			.references(() => ordersTable.id)
			.notNull(),
		cardNumberLastDigits: t
			.varchar('card_number_last_digits', { length: 4 })
			.notNull(),
		cardType: cardTypesEnum('card_type').notNull(),
		status: transactionsStatusesEnum().notNull(),
		amount: t.numeric({ precision: 12, scale: 2 }).notNull(),
		commission: t.numeric({ precision: 12, scale: 2 }).notNull(),
		totalAmount: t
			.numeric('total_amount', { precision: 12, scale: 2 })
			.notNull(),
		currency: currencyEnum().notNull(),
		processedAt: t.timestamp('processed_at').notNull()
	},
	t => [index('order_id_index').on(t.orderId)]
)
