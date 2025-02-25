import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [totalDeliveries, onTimeDeliveries, delayedDeliveries] = await Promise.all([
      prisma.delivery.count(),
      prisma.delivery.count({
        where: {
          status: 'DELIVERED',
          actualDelivery: {
            not: null,
          },
          expectedDelivery: {
            gte: prisma.delivery.fields.actualDelivery
          }
        },
      }),
      prisma.delivery.count({
        where: {
          status: 'DELAYED',
        },
      }),
    ]);

    // Avoid division by zero
    const customerSatisfaction = totalDeliveries > 0 
      ? ((onTimeDeliveries / totalDeliveries) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      totalDeliveries,
      onTimeDeliveries,
      delayedDeliveries,
      customerSatisfaction: parseFloat(customerSatisfaction),
      averageDeliveryTime: 22.3, // This could be calculated from actual data
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}