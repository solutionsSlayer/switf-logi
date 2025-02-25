import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const status = searchParams.getAll('status');
  const priority = searchParams.getAll('priority');
  const region = searchParams.getAll('region');

  try {
    const where: any = {};

    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    if (status.length > 0) {
      where.status = { in: status.map(s => s.toUpperCase()) };
    }

    if (priority.length > 0) {
      where.priority = { in: priority.map(p => p.toUpperCase()) };
    }

    if (region.length > 0) {
      where.regionId = { in: region };
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const formattedDeliveries = deliveries.map((delivery: any) => ({
      id: delivery.id,
      trackingNumber: delivery.trackingNumber,
      status: delivery.status.toLowerCase(),
      customerName: delivery.customer.name,
      destination: delivery.destination,
      expectedDelivery: delivery.expectedDelivery.toISOString(),
      actualDelivery: delivery.actualDelivery?.toISOString(),
      priority: delivery.priority.toLowerCase(),
      delay: delivery.delay,
      weight: delivery.weight,
      dimensions: delivery.dimensions
    }));

    return NextResponse.json(formattedDeliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}