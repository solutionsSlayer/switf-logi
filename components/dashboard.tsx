'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Package,
  Clock,
  ThumbsUp,
  TrendingUp,
  MapPin,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { fetchDashboardStats, fetchDeliveries, fetchDeliveryTrends, fetchRegionalData } from '@/lib/data';
import type { DashboardStats, Delivery, DeliveryTrend, RegionalData } from '@/lib/data';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [trends, setTrends] = useState<DeliveryTrend[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, deliveriesData, trendsData, regionalStats] = await Promise.all([
          fetchDashboardStats(),
          fetchDeliveries(),
          fetchDeliveryTrends(),
          fetchRegionalData(),
        ]);
        setStats(statsData);
        setDeliveries(deliveriesData);
        setTrends(trendsData);
        setRegionalData(regionalStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            SwiftLogistics Dashboard
          </h1>
          <p className="text-purple-200">
            Surveillance en temps réel des livraisons
          </p>
        </header>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Livraisons Totales"
              value={stats.totalDeliveries}
              icon={<Package className="h-6 w-6" />}
            />
            <StatCard
              title="Livraisons à l'heure"
              value={`${((stats.onTimeDeliveries / stats.totalDeliveries) * 100).toFixed(1)}%`}
              icon={<Clock className="h-6 w-6" />}
            />
            <StatCard
              title="Satisfaction Client"
              value={`${stats.customerSatisfaction}%`}
              icon={<ThumbsUp className="h-6 w-6" />}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="glass-card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendance des Livraisons
              </h2>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deliveries"
                      stroke="#c4b5fd"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="onTime"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className="glass-card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Performance par Région
              </h2>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="region" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Bar dataKey="performance" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        <Card className="glass-card mt-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dernières Livraisons
            </h2>
            <div className="overflow-x-auto mt-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-purple-300/20">
                    <th className="pb-3 text-purple-200">Numéro</th>
                    <th className="pb-3 text-purple-200">Client</th>
                    <th className="pb-3 text-purple-200">Destination</th>
                    <th className="pb-3 text-purple-200">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-purple-300/10">
                      <td className="py-4 text-white">
                        {delivery.trackingNumber}
                      </td>
                      <td className="py-4 text-white">
                        {delivery.customerName}
                      </td>
                      <td className="py-4 text-white">
                        {delivery.destination}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={delivery.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="glass-card">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-200">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="text-purple-200">{icon}</div>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: Delivery['status'] }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'in_transit':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'delayed':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'in_transit':
        return 'En transit';
      case 'delayed':
        return 'Retardé';
      default:
        return 'En attente';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
}