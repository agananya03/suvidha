import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const getPrisma = () => {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }
    const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/db";
    const pool = new Pool({ connectionString });
    // @ts-ignore
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter, log: ["query"] });
};

export const prisma = getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
