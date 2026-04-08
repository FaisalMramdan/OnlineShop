import React, { useState, useEffect } from 'react';
import { Box, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../utils/AxiosInstance';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0
  });

  const [chartData, setChartData] = useState([]);

  const fetchSummary = async () => {
    try {
      const response = await axiosInstance.get('/admin/summary');
      setSummary(response.data);
    } catch (error) {
      console.error("Gagal mengambil ringkasan data:", error);
    }
  };

  const fetchChart = async () => {
    try {
      const res = await axiosInstance.get('/admin/order-stats');
      setChartData(res.data);
    } catch (err) {
      console.error("Gagal ambil chart:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchChart();
  }, []);

  const formattedChart = chartData.map(item => ({
    name: item.status,
    value: item.total
  }));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan performa toko sepatu Anda secara real-time.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Produk" 
          value={summary.total_products} 
          subtext="Jenis sepatu tersedia" 
          Icon={Box} 
        />
        <StatCard 
          title="Total Pesanan" 
          value={summary.total_orders} 
          subtext="Pesanan masuk" 
          Icon={ShoppingCart} 
        />
        <StatCard 
          title="Total Pendapatan" 
          value={`Rp ${summary.total_revenue.toLocaleString('id-ID')}`} 
          subtext="Dari pesanan lunas (Paid)" 
          subtextColor="text-green-600" 
          Icon={DollarSign} 
        />
        <StatCard 
          title="Kategori" 
          value="Aktif" 
          subtext="Terorganisir" 
          Icon={Package} 
        />
      </div>

      {/* 🔥 CHART */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Status Pesanan</h2>

        {formattedChart.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada data pesanan</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtext, subtextColor = "text-gray-400", Icon }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {Icon && <Icon size={20} className="text-gray-400" />}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className={`text-xs font-medium ${subtextColor}`}>{subtext}</p>
      </div>
    </div>
  );
}