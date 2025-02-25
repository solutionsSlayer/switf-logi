import { NextResponse } from 'next/server';
import { PrismaClient, DeliveryStatus, ClaimStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.getAll('status');
    const priority = searchParams.getAll('priority');
    const region = searchParams.getAll('region');

    // Build base where clause
    const baseWhere: any = {};
    
    if (dateFrom && dateTo) {
      baseWhere.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    if (status.length > 0) {
      baseWhere.status = { in: status.map(s => s.toUpperCase()) };
    }

    if (priority.length > 0) {
      baseWhere.priority = { in: priority.map(p => p.toUpperCase()) };
    }

    if (region.length > 0) {
      baseWhere.regionId = { in: region };
    }

    // Fetch basic delivery stats
    const deliveryStats = await prisma.delivery.aggregate({
      where: baseWhere,
      _count: {
        _all: true,
      },
      _avg: {
        delay: true,
      },
    });

    // Count on-time and delayed deliveries
    const deliveryStatusCounts = await prisma.delivery.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: true,
    });

    // Get recent claims
    const recentClaims = await prisma.claim.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
      },
    });

    // Get insurance count
    const insuranceCount = await prisma.insurance.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get delivery performance by priority
    const performanceByPriority = await prisma.delivery.groupBy({
      by: ['priority'],
      where: baseWhere,
      _count: true,
      _avg: {
        delay: true,
      },
    });

    // Calculate derived statistics
    const totalDeliveries = deliveryStats._count._all;
    const onTimeDeliveries = deliveryStatusCounts.find(
      s => s.status === 'DELIVERED' && !baseWhere.delay
    )?._count ?? 0;
    const delayedDeliveries = deliveryStatusCounts.find(
      s => s.status === 'DELAYED'
    )?._count ?? 0;
    const inTransitCount = deliveryStatusCounts.find(
      s => s.status === 'IN_TRANSIT'
    )?._count ?? 0;

    const stats = {
      totalDeliveries,
      onTimeDeliveries,
      delayedDeliveries,
      customerSatisfaction: totalDeliveries > 0
        ? Math.round((onTimeDeliveries / totalDeliveries) * 100)
        : 100,
      averageDeliveryTime: Math.round(deliveryStats._avg.delay ?? 0),
      inTransit: inTransitCount,
      totalClaims: recentClaims.length,
      insuredDeliveries: insuranceCount,
      insuranceClaims: recentClaims.filter(
        claim => ['APPROVED', 'REFUNDED'].includes(claim.status)
      ).length,
      recentClaims: recentClaims.map(claim => ({
        id: claim.id,
        type: claim.type.toLowerCase(),
        amount: claim.amount,
        status: claim.status.toLowerCase(),
        description: claim.description,
      })),
      deliveryPerformance: performanceByPriority.map(perf => ({
        priority: perf.priority.toLowerCase(),
        avgDeliveryTime: Math.round(perf._avg.delay ?? 0),
        successRate: totalDeliveries > 0
          ? Math.round((perf._count / totalDeliveries) * 100)
          : 100,
      })),
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error in stats route:', error);
    
    // Return a consistent error response
    const defaultStats = {
      totalDeliveries: 0,
      onTimeDeliveries: 0,
      delayedDeliveries: 0,
      customerSatisfaction: 0,
      averageDeliveryTime: 0,
      inTransit: 0,
      totalClaims: 0,
      insuredDeliveries: 0,
      insuranceClaims: 0,
      recentClaims: [],
      deliveryPerformance: [],
    };

    return NextResponse.json(
      { error: 'Internal server error', ...defaultStats },
      { status: 500 }
    );
  }
}