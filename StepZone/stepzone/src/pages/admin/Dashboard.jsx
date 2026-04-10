import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Package, Clock, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import axiosInstance from '../../Utils/axiosinstance';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0
  });
  const [chartData, setChartData] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get('/admin/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChart = async () => {
    try {
      const res = await axiosInstance.get('/admin/order-stats');
      setChartData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/admin/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchChart();
    fetchOrders();
  }, []);

  const formattedChart = chartData.map(item => ({
    name: item.status,
    value: item.total
  }));

  // Dummy monthly revenue data (pakai data dari summary jika ada)
  const monthlyData = [
    { month: 'Jan', revenue: 1500000 },
    { month: 'Feb', revenue: 3200000 },
    { month: 'Mar', revenue: 4100000 },
    { month: 'Apr', revenue: summary.total_revenue * 0.7 || 3600000 },
  ];

  const getBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':   return 'bg-yellow-100 text-yellow-700';
      case 'paid':      return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped':   return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      default:          return 'bg-gray-100 text-gray-600';
    }
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan statistik toko sepatu Anda</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={`Rp ${summary.total_revenue.toLocaleString('id-ID')}`}
          Icon={TrendingUp}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Total Orders"
          value={summary.total_orders}
          Icon={ShoppingCart}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Products"
          value={summary.total_products}
          Icon={Package}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Pending Orders"
          value={formattedChart.find(d => d.name === 'pending')?.value || 0}
          Icon={Clock}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
        />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LINE CHART - Revenue Bulanan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">Revenue Bulanan</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => [`Rp ${v.toLocaleString('id-ID')}`, 'Revenue']} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART - Pesanan per Status */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">Pesanan per Status</h2>
          {formattedChart.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada data pesanan</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={formattedChart} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Pesanan Terbaru</h2>
          <Link to="/admin/pesanan" className="text-blue-500 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada pesanan</td>
                </tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-blue-600">CRD-{String(order.id).padStart(3, '0')}</td>
                  <td className="px-6 py-4 text-gray-700">{order.name}</td>
                  <td className="px-6 py-4 font-semibold text-blue-600">Rp {order.total?.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
    </div>
  );
}