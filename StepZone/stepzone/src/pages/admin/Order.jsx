import React, { useState, useEffect } from 'react';
import { Eye, X, Search } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, diproses: 0, dikirim: 0, selesai: 0 });

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/admin/orders');
      const data = res.data || [];
      setOrders(data);
      setFilteredOrders(data);

      // Hitung stats
      setStats({
        total: data.length,
        pending:  data.filter(o => o.status?.toLowerCase() === 'pending').length,
        diproses: data.filter(o => o.status?.toLowerCase() === 'processing' || o.status?.toLowerCase() === 'diproses').length,
        dikirim:  data.filter(o => o.status?.toLowerCase() === 'shipped'  || o.status?.toLowerCase() === 'dikirim').length,
        selesai:  data.filter(o => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'paid' || o.status?.toLowerCase() === 'selesai').length,
      });
    } catch (err) {
      console.error("ERROR FETCH:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredOrders(
      orders.filter(o =>
        String(o.id).includes(term) ||
        o.name?.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, orders]);

  // ================= OPEN DETAIL =================
  const handleDetail = async (order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setShowModal(true);
    setOrderDetail(null);

    try {
      const res = await axiosInstance.get(`/admin/orders/${order.id}`);
      setOrderDetail(res.data);
    } catch (err) {
      console.error("Gagal ambil detail:", err);
      // Fallback: gunakan data order yang sudah ada
      setOrderDetail({ ...order, items: [] });
    }
  };

  // ================= UPDATE STATUS =================
  const handleUpdateStatus = async () => {
    try {
      await axiosInstance.put(`/admin/orders/${selectedOrder.id}`, { status });
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      console.error("ERROR UPDATE:", err.response?.data || err);
      alert("Gagal update status");
    }
  };

  // ================= BADGE =================
  const getBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':    return { cls: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
      case 'paid':       return { cls: 'bg-green-100 text-green-700',   label: 'Paid' };
      case 'processing':
      case 'diproses':   return { cls: 'bg-blue-100 text-blue-700',     label: 'Diproses' };
      case 'shipped':
      case 'dikirim':    return { cls: 'bg-purple-100 text-purple-700', label: 'Dikirim' };
      case 'delivered':
      case 'selesai':    return { cls: 'bg-emerald-100 text-emerald-700', label: 'Selesai' };
      case 'cancelled':
      case 'dibatalkan': return { cls: 'bg-red-100 text-red-700',       label: 'Dibatalkan' };
      default:           return { cls: 'bg-gray-100 text-gray-600',     label: status };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'numeric', year: 'numeric'
      });
    } catch { return dateStr; }
  };

  const formatOrdId = (id) => `ORD-${String(id).padStart(3, '0')}`;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola dan lacak semua pesanan pelanggan</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Pesanan" value={stats.total} color="text-gray-800" />
        <StatCard label="Pending"       value={stats.pending}  color="text-yellow-600" />
        <StatCard label="Diproses"      value={stats.diproses} color="text-blue-600" />
        <StatCard label="Dikirim"       value={stats.dikirim}  color="text-purple-600" />
        <StatCard label="Selesai"       value={stats.selesai}  color="text-green-600" />
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari pesanan atau nama pelanggan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        />
      </div>

      {/* TABLE */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Daftar Pesanan</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">ID Pesanan</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Pelanggan</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Tanggal</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Total</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {orders.length === 0 ? 'Belum ada pesanan' : 'Pesanan tidak ditemukan'}
                  </td>
                </tr>
              ) : filteredOrders.map((order) => {
                const badge = getBadge(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600">{formatOrdId(order.id)}</td>
                    <td className="px-6 py-4 text-gray-700">{order.name}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      Rp {order.total?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDetail(order)}
                        className="flex items-center gap-1.5 ml-auto text-blue-500 hover:text-blue-700 font-medium text-sm cursor-pointer"
                      >
                        <Eye size={16} /> Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Detail Pesanan</h2>
                <p className="text-xs text-blue-500 mt-0.5">Informasi lengkap pesanan</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">ID Pesanan</p>
                  <p className="font-bold text-gray-800">{formatOrdId(selectedOrder.id)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Tanggal Pesanan</p>
                  <p className="font-semibold text-gray-700">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Nama Pelanggan</p>
                  <p className="font-semibold text-gray-700">{selectedOrder.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status Pesanan</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getBadge(status).cls}`}>
                    {getBadge(status).label}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Produk yang Dipesan</p>
                <div className="space-y-2">
                  {!orderDetail ? (
                    <p className="text-gray-400 text-sm text-center py-4">Memuat...</p>
                  ) : orderDetail.items && orderDetail.items.length > 0 ? (
                    orderDetail.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity} x Rp {item.price?.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="font-bold text-blue-600 text-sm">
                          Rp {(item.quantity * item.price)?.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-2">Tidak ada item</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  Rp {selectedOrder.total?.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Update Status */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Ubah Status Pesanan</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="delivered">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 text-sm cursor-pointer"
                >
                  Update Status
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}