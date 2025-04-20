export const getSwaggerConfig = () => {
	return {
		definition: {
			openapi: '3.0.0',
			info: {
				title: 'Payment form API',
				version: '1.0.0',
				description: 'API for payment form'
			}
		},
		apis: [
			'./src/modules/**/*.controller.js',
			'./src/schemas/**/*.schema.js'
		]
	}
}
