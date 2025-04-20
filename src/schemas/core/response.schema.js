import { z } from 'zod'

/**
 * @swagger
 * components:
 *   schemas:
 *     BaseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           oneOf:
 *             - type: object
 *             - type: array
 *             - type: string
 *             - type: number
 *             - type: boolean
 *         meta:
 *           type: object
 *           nullable: true
 */
export const BaseResponseSchema = z.object({
	success: z.boolean(),
	message: z.string().optional(),
	data: z.any().optional(),
	meta: z.record(z.any()).optional()
})

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Something went wrong"
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ErrorItem'
 *
 *     ErrorItem:
 *       type: object
 *       required:
 *         - code
 *         - message
 *       properties:
 *         code:
 *           type: string
 *           example: "server_error"
 *         message:
 *           type: string
 *           example: "An unexpected error occurred"
 *         path:
 *           type: string
 *           description: Optional path where error occurred
 *           nullable: true
 */
export const ErrorResponseSchema = BaseResponseSchema.extend({
	success: z.literal(false),
	errors: z
		.array(
			z.object({
				code: z.string(),
				message: z.string(),
				path: z.string().optional()
			})
		)
		.optional()
})
