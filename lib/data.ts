// Types for the logistics dashboard
export interface Delivery {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed';
  customerName: string;
  destination: string;
  expectedDelivery: string;
  actualDelivery?: string;
  delay?: number;
}

export interface DashboardStats {
  totalDeliveries: number;
  onTimeDeliveries: number;
  delayedDeliveries: number;
  customerSatisfaction: number;
  averageDeliveryTime: number;
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

export async function fetchDeliveryTrends(): Promise<DeliveryTrend[]> {
  const response = await fetch('/api/trends');
  if (!response.ok) {
    throw new Error('Failed to fetch delivery trends');
  }
  return response.json();
}

export async function fetchRegionalData(): Promise<RegionalData[]> {
  const response = await fetch('/api/regions');
  if (!response.ok) {
    throw new Error('Failed to fetch regional data');
  }
  return response.json();
}

export async function fetchDeliveries(): Promise<Delivery[]> {
  const response = await fetch('/api/deliveries');
  if (!response.ok) {
    throw new Error('Failed to fetch deliveries');
  }
  return response.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}