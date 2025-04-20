import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'

import { env } from '../config/env.config.js'

import * as schema from './schema.js'

const { Pool } = pg
const pool = new Pool({
	user: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	host: env.POSTGRES_HOST,
	port: env.POSTGRES_PORT,
	database: env.POSTGRES_DB,
	ssl: false
})

const db = drizzle({ client: pool, schema })

export default db
