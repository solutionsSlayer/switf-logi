import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const formattedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      trackingNumber: delivery.trackingNumber,
      status: delivery.status.toLowerCase(),
      customerName: delivery.customer.name,
      destination: delivery.destination,
      expectedDelivery: delivery.expectedDelivery.toISOString(),
      actualDelivery: delivery.actualDelivery?.toISOString(),
      delay: delivery.delay,
    }));

    return NextResponse.json(formattedDeliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}