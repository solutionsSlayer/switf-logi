import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      select: {
        name: true,
        performance: true,
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    });

    const formattedRegions = regions.map(region => ({
      region: region.name,
      deliveries: region._count.deliveries,
      performance: region.performance,
    }));

    return NextResponse.json(formattedRegions);
  } catch (error) {
    console.error('Error fetching regional data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}