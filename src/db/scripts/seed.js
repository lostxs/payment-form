import db from '../instance.js'
import { ordersTable, partnersTable } from '../schema.js'

const partnersData = [
	{
		name: 'Partner 1',
		successPageRedirectUri: 'https://example.com'
	},
	{
		name: 'Partner 2',
		colorScheme: 'dark',
		defaultPaymentPage: false,
		paymentPageLayout: {
			splitView: false,
			errorContainerPosition: 'bottom'
		},
		paymentPageScripts: [
			'/js/plugins/otp-verification.js',
			'/js/plugins/allow-expired-cards.js'
		],

		defaultSuccessPage: false,
		successPageLayout: {
			showOrderDetails: false,
			showPaymentDetails: false
		},
		successPageRedirectUri: 'https://example.com'
	}
]

const ordersData = [
	{
		amount: 1337,
		currency: 'RUB',
		description: 'Selling a game for 1337 rubles',
		needCommission: true
	},
	{
		amount: 3221,
		currency: 'USD',
		description: 'Buying a game for 3221 USD',
		needCommission: false
	},
	{
		amount: 10000,
		currency: 'USD',
		description: 'Buying a popcat for 10000 USD',
		needCommission: true
	},
	{
		amount: 10000,
		currency: 'USD',
		description: 'Buying a new mojang account for 10000 USD',
		needCommission: false
	}
]

async function seed() {
	try {
		await db.transaction(async tx => {
			const partnersValues = partnersData.map(partner => ({
				...partner
			}))

			const partners = await tx
				.insert(partnersTable)
				.values(partnersValues)
				.returning()

			console.log(`Partners seeded successfully: ${partners.length}`)

			const ordersValues = ordersData.map((order, index) => ({
				...order,
				partnerId: partners[index % partners.length].id,
				status: 'CREATED',
				createdAt: new Date()
			}))

			const orders = await tx
				.insert(ordersTable)
				.values(ordersValues)
				.returning()

			console.log(`Orders seeded successfully: ${orders.length}`)
		})
	} catch (error) {
		console.error('Error seeding data:', error)
		process.exit(1)
	}
}

void seed()
