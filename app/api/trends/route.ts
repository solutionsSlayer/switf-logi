import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const trends = await prisma.deliveryTrend.findMany({
      orderBy: {
        date: 'asc',
      },
      take: 7,
    });

    const formattedTrends = trends.map(trend => ({
      date: format(trend.date, 'EEE'),
      deliveries: trend.deliveries,
      onTime: trend.onTime,
      delayed: trend.delayed,
    }));

    return NextResponse.json(formattedTrends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}