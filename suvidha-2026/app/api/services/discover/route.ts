import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Service type for utility connections
 */
interface DiscoveredService {
  type: 'ELECTRICITY' | 'GAS' | 'WATER' | 'PROPERTY_TAX'
  provider: string
  consumerNo: string
  outstanding: number
  lastBill?: number
  dueDate?: string
  status: 'ACTIVE' | 'OVERDUE' | 'PENDING'
}

/**
 * POST /api/services/discover
 * 
 * Discovers utility services linked to an address.
 * Simulates Google Maps + India Post PIN validation.
 * 
 * Request body:
 * { address: string, userId?: string }
 * 
 * Response:
 * { success: boolean, services: DiscoveredService[], totalOutstanding: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, userId } = body

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      )
    }

    // Normalize the address (clean whitespace, capitalize properly)
    const normalizedAddress = normalizeAddress(address)

    // Simulate API delay (800ms for realistic loading animation)
    await delay(800)

    // Simulate Google Maps + India Post PIN validation
    // In production, you'd call actual APIs here
    const isValidAddress = await validateAddress(normalizedAddress)

    if (!isValidAddress) {
      return NextResponse.json(
        { success: false, error: 'Could not validate address. Please check and try again.' },
        { status: 400 }
      )
    }

    // Get mock services for this address
    // In production, this would query actual utility databases
    const services = getMockServicesForAddress(normalizedAddress)

    // Calculate total outstanding
    const totalOutstanding = services.reduce((sum, s) => sum + s.outstanding, 0)

    // If userId provided, save connections to database
    if (userId) {
      await saveConnectionsToDatabase(userId, services, normalizedAddress)
    }

    return NextResponse.json({
      success: true,
      address: normalizedAddress,
      services,
      totalOutstanding,
      servicesFound: services.length,
    })

  } catch (error) {
    console.error('Service discovery error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to discover services. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * Normalize address string
 */
function normalizeAddress(address: string): string {
  return address
    .trim()
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Simulate address validation
 * In production: Call Google Maps Geocoding API + India Post PIN API
 */
async function validateAddress(address: string): Promise<boolean> {
  // Simulate validation delay
  await delay(200)
  
  // For demo, accept any address with at least 10 characters
  // In production, verify against actual APIs
  return address.length >= 10
}

/**
 * Get mock services for a given address
 * Returns realistic data for demonstration
 */
function getMockServicesForAddress(address: string): DiscoveredService[] {
  // Use address hash to generate consistent mock data
  const hash = simpleHash(address)
  
  // Generate due dates
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15)

  const services: DiscoveredService[] = [
    {
      type: 'ELECTRICITY',
      provider: 'MSEDCL',
      consumerNo: `MH${(hash % 9000000000) + 1000000000}`,
      outstanding: Math.floor((hash % 5000) + 500),
      lastBill: Math.floor((hash % 3000) + 400),
      dueDate: nextMonth.toISOString().split('T')[0],
      status: hash % 3 === 0 ? 'OVERDUE' : 'ACTIVE',
    },
    {
      type: 'GAS',
      provider: 'Mahanagar Gas',
      consumerNo: `MGL${(hash % 900000) + 100000}`,
      outstanding: Math.floor((hash % 2000) + 200),
      lastBill: Math.floor((hash % 1500) + 150),
      dueDate: nextMonth.toISOString().split('T')[0],
      status: 'ACTIVE',
    },
    {
      type: 'WATER',
      provider: 'NMC Water Supply',
      consumerNo: `NMC${(hash % 90000) + 10000}`,
      outstanding: Math.floor((hash % 1500) + 100),
      lastBill: Math.floor((hash % 1000) + 80),
      dueDate: lastMonth.toISOString().split('T')[0],
      status: hash % 4 === 0 ? 'OVERDUE' : 'ACTIVE',
    },
    {
      type: 'PROPERTY_TAX',
      provider: 'Nagpur Municipal Corporation',
      consumerNo: `NMC-PT-${(hash % 900000) + 100000}`,
      outstanding: Math.floor((hash % 15000) + 2000),
      dueDate: nextMonth.toISOString().split('T')[0],
      status: 'PENDING',
    },
  ]

  return services
}

/**
 * Save discovered connections to database
 */
async function saveConnectionsToDatabase(
  userId: string,
  services: DiscoveredService[],
  address: string
) {
  try {
    // Create connections for each service
    const connectionPromises = services.map(service => 
      prisma.connection.upsert({
        where: {
          // Create a unique constraint on userId + type + consumerNumber
          id: `${userId}-${service.type}-${service.consumerNo}`,
        },
        update: {
          outstandingAmt: service.outstanding,
          lastBillAmt: service.lastBill || 0,
        },
        create: {
          id: `${userId}-${service.type}-${service.consumerNo}`,
          userId,
          type: service.type,
          provider: service.provider,
          consumerNumber: service.consumerNo,
          address,
          outstandingAmt: service.outstanding,
          lastBillAmt: service.lastBill || 0,
        },
      })
    )

    await Promise.all(connectionPromises)
  } catch (error) {
    console.error('Error saving connections:', error)
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Simple string hash function
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Utility delay function
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
