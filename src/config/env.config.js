import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production']).default('development'),
	APPLICATION_PORT: z.coerce.number().default(4200),

	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_HOST: z.string(),
	POSTGRES_PORT: z.coerce.number(),
	POSTGRES_DB: z.string()
})

export const env = envSchema.parse(process.env)
