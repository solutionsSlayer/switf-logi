// Types for the logistics dashboard
export interface Delivery {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'processing' | 'out_for_delivery' | 'failed' | 'returned';
  customerName: string;
  destination: string;
  expectedDelivery: string;
  actualDelivery?: string;
  delay?: number;
  priority: 'economy' | 'standard' | 'express' | 'priority';
  weight: number;
  dimensions?: string;
  signature: boolean;
}

export interface DashboardStats {
  totalDeliveries: number;
  onTimeDeliveries: number;
  delayedDeliveries: number;
  customerSatisfaction: number;
  averageDeliveryTime: number;
  inTransit: number;
  totalClaims: number;
  insuredDeliveries: number;
  insuranceClaims: number;
  recentClaims: ClaimData[];
  deliveryPerformance: DeliveryPerformance[];
}

export interface DeliveryTrend {
  date: string;
  deliveries: number;
  onTime: number;
  delayed: number;
}

export interface RegionalData {
  region: string;
  deliveries: number;
  performance: number;
}

export interface ClaimData {
  id: string;
  type: 'damage' | 'loss' | 'delay' | 'other';
  amount: number;
  status: 'pending' | 'investigating' | 'approved' | 'rejected' | 'refunded';
  description: string;
  resolution?: string;
}

export interface DeliveryPerformance {
  priority: 'economy' | 'standard' | 'express' | 'priority';
  avgDeliveryTime: number;
  successRate: number;
}

interface FilterParams {
  dateRange?: { from: Date | undefined; to: Date | undefined };
  status?: string[];
  priority?: string[];
  region?: string[];
}

export async function fetchDeliveryTrends(params?: FilterParams): Promise<DeliveryTrend[]> {
  const searchParams = new URLSearchParams();
  if (params?.dateRange?.from) searchParams.set('dateFrom', params.dateRange.from.toISOString());
  if (params?.dateRange?.to) searchParams.set('dateTo', params.dateRange.to.toISOString());
  
  const response = await fetch(`/api/trends?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch delivery trends');
  return response.json();
}

export async function fetchRegionalData(params?: FilterParams): Promise<RegionalData[]> {
  const searchParams = new URLSearchParams();
  if (params?.dateRange?.from) searchParams.set('dateFrom', params.dateRange.from.toISOString());
  if (params?.dateRange?.to) searchParams.set('dateTo', params.dateRange.to.toISOString());
  params?.region?.forEach(r => searchParams.append('region', r));
  
  const response = await fetch(`/api/regions?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch regional data');
  return response.json();
}

export async function fetchDeliveries(params?: FilterParams): Promise<Delivery[]> {
  const searchParams = new URLSearchParams();
  if (params?.dateRange?.from) searchParams.set('dateFrom', params.dateRange.from.toISOString());
  if (params?.dateRange?.to) searchParams.set('dateTo', params.dateRange.to.toISOString());
  params?.status?.forEach(s => searchParams.append('status', s));
  params?.priority?.forEach(p => searchParams.append('priority', p));
  params?.region?.forEach(r => searchParams.append('region', r));
  
  const response = await fetch(`/api/deliveries?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch deliveries');
  return response.json();
}

export async function fetchDashboardStats(params?: FilterParams): Promise<DashboardStats> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.dateRange?.from) searchParams.set('dateFrom', params.dateRange.from.toISOString());
    if (params?.dateRange?.to) searchParams.set('dateTo', params.dateRange.to.toISOString());
    params?.status?.forEach(s => searchParams.append('status', s));
    params?.priority?.forEach(p => searchParams.append('priority', p));
    params?.region?.forEach(r => searchParams.append('region', r));
    
    const response = await fetch(`/api/stats?${searchParams}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch dashboard stats');
    }
    
    const data = await response.json();
    
    // Ensure all required fields are present with default values
    return {
      totalDeliveries: data.totalDeliveries || 0,
      onTimeDeliveries: data.onTimeDeliveries || 0,
      delayedDeliveries: data.delayedDeliveries || 0,
      customerSatisfaction: data.customerSatisfaction || 0,
      averageDeliveryTime: data.averageDeliveryTime || 0,
      inTransit: data.inTransit || 0,
      totalClaims: data.totalClaims || 0,
      insuredDeliveries: data.insuredDeliveries || 0,
      insuranceClaims: data.insuranceClaims || 0,
      recentClaims: data.recentClaims || [],
      deliveryPerformance: data.deliveryPerformance || []
    };
  } catch (error) {
    console.error('Error in fetchDashboardStats:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}