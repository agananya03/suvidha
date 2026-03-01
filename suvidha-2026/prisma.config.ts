import path from 'path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Load environment variables
config({ path: path.resolve(__dirname, '.env') })

export default defineConfig({
    earlyAccess: true,
    schema: path.resolve(__dirname, 'prisma/schema.prisma'),
    migrations: {
        seed: 'tsx ./prisma/seed.ts',
    },
    datasource: {
        url: process.env.DATABASE_URL!,
    }
})
