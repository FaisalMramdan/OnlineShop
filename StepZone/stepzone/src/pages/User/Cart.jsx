import React, { useState, useEffect } from 'react';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag, ShoppingCart, Check } from 'lucide-react';
import Navbar from '../../pages/User/Navbar';
import axiosInstance from '../../Utils/axiosinstance';
import { useNavigate, Link } from 'react-router-dom';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

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

  // ================= TOAST =================
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

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

  // ================= UPDATE QUANTITY =================
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axiosInstance.put(`/user/cart/${productId}`, {
        quantity: newQuantity
      });
      fetchCart();
    } catch (error) {
      console.error("Gagal update quantity", error);
    }
  };

  // ================= REMOVE ITEM =================
  const handleRemove = async (productId, productName) => {
    try {
      await axiosInstance.delete(`/user/cart/${productId}`);
      showToast(`${productName} dihapus dari keranjang`);
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

      <div className="max-w-6xl mx-auto px-8 py-10 w-full flex-1">

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Keranjang Belanja
        </h2>

        {cartItems.length === 0 ? (
          /* ================= EMPTY STATE ================= */
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-gray-200 mb-6">
              <ShoppingBag size={80} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Keranjang Kosong</h3>
            <p className="text-blue-400 text-sm mb-6">Belum ada produk yang ditambahkan ke keranjang</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 no-underline"
            >
              Mulai Belanja <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          /* ================= CART WITH ITEMS ================= */
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-5 items-start">

                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.image ? (
                      <img
                        src={`http://localhost:8080/uploads/${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingCart size={28} />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-base text-gray-800">{item.name}</h3>
                        <p className="text-blue-400 text-xs mt-0.5">{item.description || 'Sepatu berkualitas tinggi'}</p>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={() => handleRemove(item.product_id, item.name)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors ml-2 cursor-pointer"
                        title="Hapus item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, (item.quantity || 1) - 1)}
                          disabled={(item.quantity || 1) <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 h-9 flex items-center justify-center text-sm font-medium text-gray-700 border-x border-gray-200 bg-white">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, (item.quantity || 1) + 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-blue-600 text-base">
                          Rp {(item.price * (item.quantity || 1))?.toLocaleString('id-ID')}
                        </p>
                        <p className="text-gray-400 text-[11px]">
                          Rp {item.price?.toLocaleString('id-ID')} / pcs
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* ================= ORDER SUMMARY ================= */}
            <div className="w-full lg:w-80">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">

                <h3 className="text-lg font-bold text-gray-800 mb-5">
                  Ringkasan Pesanan
                </h3>

                {/* Subtotal */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 text-sm">Subtotal</span>
                  <span className="font-medium text-gray-700 text-sm">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100 pb-4">
                  <span className="text-gray-500 text-sm">Ongkos Kirim</span>
                  <span className="text-green-500 font-medium text-sm">Gratis</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 mb-6">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckoutAndPay}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? 'Memproses...' : 'Lanjut ke Checkout'}
                  <ArrowRight size={18} />
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/"
                  className="block text-center text-blue-500 text-sm mt-4 hover:text-blue-700 transition-colors no-underline font-medium"
                >
                  Lanjut Belanja
                </Link>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 mt-auto text-center text-gray-400 text-sm">
        <p>&copy; 2025 StepZone. Semua hak dilindungi.</p>
      </footer>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-slideUp">
          <div className="bg-blue-500 p-1 rounded-full">
            <Check size={14} />
          </div>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}