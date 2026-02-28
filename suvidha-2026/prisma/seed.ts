import { config } from 'dotenv'
config({ path: '.env.local' })
console.log("DB URL from ENV:", process.env.DATABASE_URL ? "Exists" : "MISSING");

import { PrismaClient, ConnectionType, ComplaintStatus } from '@prisma/client'

const prisma = new PrismaClient({
    log: ['warn', 'error']
})

async function main() {
    console.log('Seeding SUVIDHA 2026 database...')

    // Clean existing data for idempotency
    await prisma.queueEntry.deleteMany()
    await prisma.paymentRecord.deleteMany()
    await prisma.complaint.deleteMany()
    await prisma.connection.deleteMany()
    await prisma.documentToken.deleteMany()
    await prisma.oTPSession.deleteMany()
    await prisma.user.deleteMany()

    // 1. Create exact demo User
    const user = await prisma.user.create({
        data: {
            mobile: '9876543210',
            name: 'Ramesh Kumar',
            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
            preferredLanguage: 'en',
        },
    })

    // 2. Create 4 Connections for the user
    const connElectricity = await prisma.connection.create({
        data: {
            userId: user.id,
            type: ConnectionType.ELECTRICITY,
            provider: 'MSEDCL',
            consumerNumber: 'MH-NP-2024-001247',
            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
            outstandingAmt: 1247.50, // triggers anomaly detection as it's > 2x lastBillAmt
            lastBillAmt: 540.00,
        },
    })

    const connGas = await prisma.connection.create({
        data: {
            userId: user.id,
            type: ConnectionType.GAS,
            provider: 'Mahanagar Gas',
            consumerNumber: 'MGL-NGP-88431',
            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
            outstandingAmt: 340.00,
            lastBillAmt: 315.00,
        },
    })

    const connWater = await prisma.connection.create({
        data: {
            userId: user.id,
            type: ConnectionType.WATER,
            provider: 'NMC Water Supply',
            consumerNumber: 'NMC-W-2024-5521',
            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
            outstandingAmt: 89.00,
            lastBillAmt: 89.00,
        },
    })

    const connTax = await prisma.connection.create({
        data: {
            userId: user.id,
            type: ConnectionType.PROPERTY_TAX,
            provider: 'Nagpur Municipal Corporation',
            consumerNumber: 'NMC-PT-2024-007',
            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
            outstandingAmt: 4200.00,
            lastBillAmt: 4200.00,
        },
    })

    // 3. Create 5 Complaints
    const c1 = await prisma.complaint.create({
        data: {
            ticketId: 'SUVDH-2026-00047',
            userId: user.id,
            type: 'STREET_LIGHT',
            description: 'Street light not working near house for 3 days',
            department: 'MULTI',
            secondaryDepartment: 'ELECTRICITY',
            status: ComplaintStatus.PENDING,
            priority: 7,
            queuePosition: 47,
            queueEntry: {
                create: {
                    departmentQueue: 'MULTI',
                    position: 47,
                    estimatedResolutionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
                },
            },
        },
    })

    const c2 = await prisma.complaint.create({
        data: {
            ticketId: 'SUVDH-2026-00048',
            userId: user.id,
            type: 'WATER_LEAK',
            description: 'Water pipe leak',
            department: 'MUNICIPAL',
            status: ComplaintStatus.IN_PROGRESS,
            priority: 8,
            queuePosition: 12,
            queueEntry: {
                create: {
                    departmentQueue: 'MUNICIPAL',
                    position: 12,
                    estimatedResolutionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
                },
            },
        },
    })

    const c3 = await prisma.complaint.create({
        data: {
            ticketId: 'SUVDH-2026-00049',
            userId: user.id,
            type: 'METER_ISSUE',
            description: 'Electricity meter issue',
            department: 'ELECTRICITY',
            status: ComplaintStatus.RESOLVED,
            priority: 5,
            resolvedAt: new Date(),
        },
    })

    const c4 = await prisma.complaint.create({
        data: {
            ticketId: 'SUVDH-2026-00050',
            userId: user.id,
            type: 'GAS_DELAY',
            description: 'Gas connection delay',
            department: 'GAS',
            status: ComplaintStatus.ESCALATED,
            priority: 9,
            queueEntry: {
                create: {
                    departmentQueue: 'GAS',
                    position: 1,
                    estimatedResolutionDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
                    isEscalated: true,
                    escalatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // escalated 1 day ago
                },
            },
        },
    })

    const c5 = await prisma.complaint.create({
        data: {
            ticketId: 'SUVDH-2026-00051',
            userId: user.id,
            type: 'GENERAL',
            description: 'General inquiry request',
            department: 'ELECTRICITY',
            status: ComplaintStatus.PENDING,
            priority: 5,
            queuePosition: 89,
            queueEntry: {
                create: {
                    departmentQueue: 'ELECTRICITY',
                    position: 89,
                    estimatedResolutionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
                },
            },
        },
    })

    // 4. Create 3 DocumentTokens
    await prisma.documentToken.create({
        data: {
            token: 'A7X3K9',
            mobile: '9876543210',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // valid +48h
            autoDeleteAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            used: false,
        },
    })

    await prisma.documentToken.create({
        data: {
            token: 'EXPD01',
            mobile: '9876543210',
            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // expired 24h ago
            autoDeleteAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            used: false,
        },
    })

    await prisma.documentToken.create({
        data: {
            token: 'USED02',
            mobile: '9876543210',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            autoDeleteAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            used: true,
            usedAt: new Date(),
        },
    })

    console.log('Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
