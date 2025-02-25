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
  AlertTriangle,
  DollarSign,
  Shield,
  Timer,
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
import type { DashboardStats, Delivery, DeliveryTrend, RegionalData, ClaimData, DeliveryPerformance } from '@/lib/data';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [trends, setTrends] = useState<DeliveryTrend[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, deliveriesData, trendsData, regionalStats] = await Promise.all([
          fetchDashboardStats({
            dateRange,
            status: statusFilter,
            priority: priorityFilter,
            region: regionFilter
          }),
          fetchDeliveries({
            dateRange,
            status: statusFilter,
            priority: priorityFilter,
            region: regionFilter
          }),
          fetchDeliveryTrends({ dateRange }),
          fetchRegionalData({ dateRange, region: regionFilter })
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
  }, [dateRange, statusFilter, priorityFilter, regionFilter]);

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

        <GlobalFilters 
          dateRange={dateRange} 
          setDateRange={setDateRange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
        />

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Livraisons Totales"
              value={stats.totalDeliveries}
              icon={<Package className="h-6 w-6" />}
              subtitle={`${stats.inTransit} en cours`}
            />
            <StatCard
              title="Performance"
              value={`${((stats.onTimeDeliveries / stats.totalDeliveries) * 100).toFixed(1)}%`}
              icon={<Clock className="h-6 w-6" />}
              subtitle={`${stats.delayedDeliveries} retards`}
            />
            <StatCard
              title="Satisfaction Client"
              value={`${stats.customerSatisfaction}%`}
              icon={<ThumbsUp className="h-6 w-6" />}
              subtitle={`${stats.totalClaims} réclamations`}
            />
            <StatCard
              title="Assurance Active"
              value={`${stats.insuredDeliveries}`}
              icon={<Shield className="h-6 w-6" />}
              subtitle={`${stats.insuranceClaims} demandes`}
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
                    <XAxis 
                      dataKey="region" 
                      stroke="rgba(255,255,255,0.7)"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '14px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    />
                    <Bar dataKey="performance" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Réclamations Récentes
              </h2>
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-purple-300/20">
                      <th className="pb-3 text-purple-200">Type</th>
                      <th className="pb-3 text-purple-200">Montant</th>
                      <th className="pb-3 text-purple-200">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentClaims?.map((claim) => (
                      <tr key={claim.id} className="border-b border-purple-300/10">
                        <td className="py-4 text-white">{claim.type}</td>
                        <td className="py-4 text-white">{claim.amount}€</td>
                        <td className="py-4">
                          <ClaimStatusBadge status={claim.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="glass-card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Performance de Livraison
              </h2>
              <div className="space-y-4 mt-4">
                {stats?.deliveryPerformance?.map((perf) => (
                  <div key={perf.priority} className="relative">
                    <div className="flex justify-between text-sm text-purple-200 mb-1">
                      <span>{perf.priority}</span>
                      <span>{perf.avgDeliveryTime}h</span>
                    </div>
                    <div className="h-2 bg-purple-900/20 rounded-full">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${perf.successRate}%` }}
                      />
                    </div>
                  </div>
                ))}
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
                    <th className="pb-3 text-purple-200">Priorité</th>
                    <th className="pb-3 text-purple-200">Statut</th>
                    <th className="pb-3 text-purple-200">Délai</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-purple-300/10">
                      <td className="py-4 text-white">{delivery.trackingNumber}</td>
                      <td className="py-4 text-white">{delivery.customerName}</td>
                      <td className="py-4 text-white">{delivery.destination}</td>
                      <td className="py-4">
                        <PriorityBadge priority={delivery.priority} />
                      </td>
                      <td className="py-4">
                        <StatusBadge status={delivery.status} />
                      </td>
                      <td className="py-4 text-white">
                        {delivery.delay ? `+${delivery.delay}h` : 'À l\'heure'}
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

function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card className="glass-card">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-200">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-purple-300 mt-1">{subtitle}</p>
            )}
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

function PriorityBadge({ priority }: { priority: Delivery['priority'] }) {
  if (!priority) return null;

  const getStyles = () => {
    switch (priority.toLowerCase()) {
      case 'express':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'priority':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      case 'standard':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'economy':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      {priority}
    </span>
  );
}

function ClaimStatusBadge({ status }: { status: ClaimData['status'] }) {
  if (!status) return null;

  const getStyles = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'investigating':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      {status}
    </span>
  );
}

function DeliveryPerformanceCard({ performance }: { performance: DeliveryPerformance[] }) {
  return (
    <Card className="glass-card">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Performance de Livraison
        </h2>
        <div className="space-y-4 mt-4">
          {performance.map((perf) => (
            <div key={perf.priority} className="relative">
              <div className="flex justify-between text-sm text-purple-200 mb-1">
                <span className="capitalize">{perf.priority}</span>
                <span>{perf.avgDeliveryTime}h</span>
              </div>
              <div className="h-2 bg-purple-900/20 rounded-full">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${perf.successRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function RecentClaimsCard({ claims }: { claims: ClaimData[] }) {
  return (
    <Card className="glass-card">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Réclamations Récentes
        </h2>
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-purple-300/20">
                <th className="pb-3 text-purple-200">Type</th>
                <th className="pb-3 text-purple-200">Montant</th>
                <th className="pb-3 text-purple-200">Statut</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b border-purple-300/10">
                  <td className="py-4 text-white capitalize">{claim.type}</td>
                  <td className="py-4 text-white">{claim.amount}€</td>
                  <td className="py-4">
                    <ClaimStatusBadge status={claim.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

const GlobalFilters = ({ 
  dateRange, 
  setDateRange,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  regionFilter,
  setRegionFilter
}: {
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date | undefined; to: Date | undefined }>>;
  statusFilter: string[];
  setStatusFilter: React.Dispatch<React.SetStateAction<string[]>>;
  priorityFilter: string[];
  setPriorityFilter: React.Dispatch<React.SetStateAction<string[]>>;
  regionFilter: string[];
  setRegionFilter: React.Dispatch<React.SetStateAction<string[]>>;
}) => (
  <Card className="glass-card p-4">
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="text-sm text-purple-200 block mb-2">Période</label>
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onSelect={setDateRange}
        />
      </div>
      <div>
        <label className="text-sm text-purple-200 block mb-2">Statut</label>
        <MultiSelect
          options={['delivered', 'in_transit', 'delayed']}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>
      <div>
        <label className="text-sm text-purple-200 block mb-2">Priorité</label>
        <MultiSelect
          options={['express', 'priority', 'standard', 'economy']}
          value={priorityFilter}
          onChange={setPriorityFilter}
        />
      </div>
      <div>
        <label className="text-sm text-purple-200 block mb-2">Région</label>
        <MultiSelect
          options={regionFilter}
          value={regionFilter}
          onChange={setRegionFilter}
        />
      </div>
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => {
          setDateRange({ from: undefined, to: undefined });
          setStatusFilter([]);
          setPriorityFilter([]);
          setRegionFilter([]);
        }}
      >
        Réinitialiser
      </Button>
    </div>
  </Card>
);