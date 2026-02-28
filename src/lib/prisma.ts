import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const getPrisma = () => {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }
    return new PrismaClient({ log: ["query"] });
};

export const prisma = getPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
