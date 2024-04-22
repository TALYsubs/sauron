import { DB } from './types' // this is the Database interface we defined earlier
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

const dialect = new PostgresDialect({
    pool: new Pool({
        database: process.env.DATABASE_NAME as string,
        host: process.env.DATABASE_HOST as string,
        user: process.env.DATABASE_USER as string,
        password: process.env.DATABASE_PASSWORD as string,
        port: 5434,
        max: 10,
    })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const prisma = new Kysely<DB>({
    dialect,
})