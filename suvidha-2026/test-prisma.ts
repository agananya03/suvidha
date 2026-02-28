import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

try {
    console.log("INITIALIZING PRISMA")
    const prisma = new PrismaClient()
    console.log("SUCCESS")
} catch (e) {
    console.error("ERROR:", e)
}
