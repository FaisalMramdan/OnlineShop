import React, { useState, useEffect } from 'react';
import { Trash2, ArrowRight } from 'lucide-react';
import Navbar from '../../pages/User/Navbar';
import axiosInstance from '../../Utils/axiosinstance';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Silakan login terlebih dahulu");
      navigate("/login");
    } else {
      fetchCart();
    }
  }, []);

  // ================= FETCH CART =================
  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get('/user/cart');

      setCartItems(res.data.item || []);
      setTotalPrice(res.data.total || 0);

    } catch (err) {
      console.error("Gagal load keranjang", err);
    }
  };

  // ================= REMOVE ITEM =================
  const handleRemove = async (productId) => {
    try {
      await axiosInstance.delete(`/user/cart/${productId}`);
      fetchCart();
    } catch (error) {
      console.error("Gagal hapus item", error);
    }
  };

  // ================= CHECKOUT + XENDIT =================
  const handleCheckoutAndPay = async () => {
    setIsLoading(true);
    try {
      const orderRes = await axiosInstance.post('/user/checkout');
      const orderId = orderRes.data.order_id;

      const payRes = await axiosInstance.post(`/user/pay/${orderId}`);

      if (payRes.data.invoice_url) {
        window.location.href = payRes.data.invoice_url;
      } else {
        alert("Gagal mendapatkan link pembayaran");
      }

    } catch (error) {
      console.error(error);
      alert("Checkout gagal, pastikan cart tidak kosong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-10 w-full flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* ================= LIST CART ================= */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Keranjang Belanja
          </h2>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

            {cartItems.length === 0 ? (
              <p className="p-6 text-center text-gray-500">
                Keranjang Kosong
              </p>
            ) : (
              cartItems.map((item) => (
                <div key={item.product_id} className="p-6 border-b flex gap-6 items-center">

                  {/* ❗ IMAGE DIHAPUS (karena backend tidak kirim) */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {item.name}
                    </h3>

                    <p className="text-blue-600 font-bold mt-1">
                      Rp {item.price?.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-4 font-medium">
                      Qty: {item.quantity}
                    </span>

                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        {cartItems.length > 0 && (
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">

              <h3 className="text-lg font-bold mb-6">
                Ringkasan Belanja
              </h3>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold">Total Harga</span>
                <span className="text-xl font-bold text-blue-600">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={handleCheckoutAndPay}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2"
              >
                {isLoading ? 'Memproses...' : 'Lanjut Pembayaran'}
                <ArrowRight size={18} />
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}