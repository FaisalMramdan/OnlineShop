import React, { useState, useEffect } from 'react';
import { List, Search, ShoppingCart, Filter, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';
import Navbar from '../../pages/User/Navbar';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', product: '' });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH CATEGORIES =================
  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================= FILTER =================
  const filteredProducts = (products || []).filter(product => {
    const matchSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'Semua Kategori' ||
      product.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  // ================= TOAST =================
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  // ================= ADD TO CART =================
  const handleAddToCart = async (product) => {
    if (!token) {
      alert("Silakan login dulu!");
      navigate("/login");
      return;
    }

    try {
      await axiosInstance.post('/user/cart', {
        product_id: product.id,
        quantity: 1
      });

      showToast(`${product.name} ditambahkan ke keranjang!`);
    } catch (err) {
      console.error(err);
      showToast("Gagal tambah ke cart");
    }
  };

  // ================= CATEGORY BADGE COLORS =================
  const getCategoryColor = (category) => {
    const colors = {
      'Sepatu Olahraga': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      'Sepatu Casual': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      'Sepatu Formal': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      'Sepatu Boots': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    };
    return colors[category] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* NAVBAR */}
      <Navbar />
      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* FILTER SECTION */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari sepatu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* CATEGORY DROPDOWN */}
            <div className="relative w-full md:w-80">
              <div
                className="w-full px-4 py-3 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer bg-white hover:border-blue-300 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter size={18} /> {selectedCategory}
                </div>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">

                  <div
                    className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${selectedCategory === 'Semua Kategori' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                    onClick={() => {
                      setSelectedCategory('Semua Kategori');
                      setIsDropdownOpen(false);
                    }}
                  >
                    Semua Kategori
                  </div>

                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${selectedCategory === cat.name ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-300 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-gray-400 text-lg">Produk tidak ditemukan</p>
            <p className="text-gray-300 text-sm mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const catColor = getCategoryColor(product.category);
              return (
                <div key={product.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">

                  {/* Product Image */}
                  <div className="h-52 bg-gray-50 overflow-hidden">
                    <img
                      src={`http://localhost:8080/uploads/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Category Badge */}
                    <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full border ${catColor.bg} ${catColor.text} ${catColor.border} mb-2`}>
                      {product.category}
                    </span>

                    <h3 className="font-bold text-base text-gray-800 mb-1">{product.name}</h3>

                    {/* Description */}
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {product.description || `${product.category} berkualitas tinggi`}
                    </p>

                    {/* Price & Stock */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-blue-600 text-base">
                        Rp {product.price?.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        Stok: {product.stock}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <ShoppingCart size={16} /> Tambah ke Keranjang
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 mt-12 text-center text-gray-400 text-sm">
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