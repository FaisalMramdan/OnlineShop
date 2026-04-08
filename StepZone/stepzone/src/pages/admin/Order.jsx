import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("");

  // ================= FETCH =================
  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/admin/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error("ERROR FETCH:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= OPEN DETAIL =================
  const handleDetail = (order) => {
    console.log("CLICK DETAIL:", order);
    setSelectedOrder(order);
    setStatus(order.status);
    setShowModal(true);
  };

  // ================= UPDATE STATUS =================
  const handleUpdateStatus = async () => {
    try {
      console.log("UPDATE:", selectedOrder.id, status);

      await axiosInstance.put(`/admin/orders/${selectedOrder.id}`, {
        status: status
      });

      alert("Status berhasil diupdate!");
      setShowModal(false);
      fetchOrders();

    } catch (err) {
      console.error("ERROR UPDATE:", err.response?.data || err);
      alert("Gagal update status");
    }
  };

  // ================= BADGE =================
  const getBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'paid': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Daftar Pesanan</h1>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Detail</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">

                <td className="p-4 text-blue-600 font-bold">
                  #{order.id}
                </td>

                <td className="p-4">
                  {order.name}
                </td>

                <td className="p-4">
                  {new Date(order.created_at).toLocaleDateString('id-ID')}
                </td>

                <td className="p-4 font-bold">
                  Rp {order.total?.toLocaleString('id-ID')}
                </td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDetail(order)}
                    className="p-2 border rounded-lg hover:bg-gray-100"
                  >
                    <Eye size={18} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <div className="bg-white p-6 rounded-xl w-96 space-y-4">

            <h2 className="font-bold text-lg">Detail Pesanan</h2>

            <p><b>ID:</b> #{selectedOrder.id}</p>
            <p><b>Nama:</b> {selectedOrder.name}</p>
            <p><b>Total:</b> Rp {selectedOrder.total}</p>

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Batal
              </button>

              <button
                onClick={handleUpdateStatus}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                Update
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}