import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingBag, ChevronDown, ChevronUp,
  Clock, CheckCircle, Truck, Star, AlertCircle, ArrowRight
} from 'lucide-react';
import Navbar from './Navbar';
import axiosInstance from '../../Utils/axiosinstance';
import { Link, useNavigate } from 'react-router-dom';

// ── Status badge helper ──────────────────────────────────────
const statusConfig = {
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <Clock size={13} />,
  },
  paid: {
    label: 'Sudah Dibayar',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <CheckCircle size={13} />,
  },
  process: {
    label: 'Diproses',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <Package size={13} />,
  },
  shipped: {
    label: 'Dikirim',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: <Truck size={13} />,
  },
  done: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: <Star size={13} />,
  },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: <AlertCircle size={13} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── Format tanggal ──────────────────────────────────────────
function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Order Card ──────────────────────────────────────────────
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Order icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Package size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
            <p className="font-bold text-gray-800 text-base">#{order.id}</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          <StatusBadge status={order.status} />
          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-50 mx-6" />

      {/* Preview thumbnail row */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {(order.items || []).slice(0, 4).map((item, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0"
            >
              {item.image ? (
                <img
                  src={`http://localhost:8080/uploads/${item.image}`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ShoppingBag size={14} />
                </div>
              )}
            </div>
          ))}
          {(order.items || []).length > 4 && (
            <span className="text-xs text-gray-400 font-medium">
              +{order.items.length - 4} lainnya
            </span>
          )}
          {(order.items || []).length === 0 && (
            <span className="text-xs text-gray-400">Tidak ada item</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Total</p>
            <p className="font-bold text-blue-600 text-base">
              Rp {order.total?.toLocaleString('id-ID')}
            </p>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-lg"
          >
            {open ? 'Tutup' : 'Detail'}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expandable detail */}
      {open && (
        <div className="border-t border-gray-50 bg-gray-50/50 px-6 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Rincian Produk
          </p>
          {(order.items || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Tidak ada detail item</p>
          ) : (
            order.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white rounded-xl p-3 border border-gray-100"
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={`http://localhost:8080/uploads/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {item.quantity} pcs × Rp {item.price?.toLocaleString('id-ID')}
                  </p>
                </div>
                {/* Subtotal */}
                <p className="font-bold text-gray-700 text-sm flex-shrink-0">
                  Rp {item.subtotal?.toLocaleString('id-ID')}
                </p>
              </div>
            ))
          )}

          {/* Total row */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
            <span className="font-semibold text-gray-700 text-sm">Total Pembayaran</span>
            <span className="font-bold text-blue-600 text-base">
              Rp {order.total?.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/user/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Gagal load orders', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10 w-full flex-1">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Pesanan Saya</h1>
            <p className="text-gray-400 text-sm">Riwayat semua pesanan kamu</p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Memuat pesanan...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-gray-200 mb-6">
              <ShoppingBag size={80} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Belum Ada Pesanan</h3>
            <p className="text-gray-400 text-sm mb-6">Yuk mulai belanja produk favoritmu!</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 no-underline"
            >
              Mulai Belanja <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Order list */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-gray-100 py-8 mt-auto text-center text-gray-400 text-sm">
        <p>&copy; 2025 StepZone. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
