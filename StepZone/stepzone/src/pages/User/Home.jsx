import React, { useState, useEffect } from 'react';
import { List, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';
import Navbar from '../../pages/User/Navbar'; // 🔥 PENTING

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH CATEGORIES =================
  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================= FILTER =================
  const filteredProducts = products.filter(product => {
    const matchSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'Semua Kategori' ||
      product.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  // ================= ADD TO CART =================
  const handleAddToCart = async (productId) => {
    if (!token) {
      alert("Silakan login dulu!");
      navigate("/login");
      return;
    }

    try {
      await axiosInstance.post('/user/cart', {
        product_id: productId,
        quantity: 1
      });

      alert("Berhasil ditambahkan ke keranjang!");
    } catch (err) {
      console.error(err);
      alert("Gagal tambah ke cart");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* 🔥 NAVBAR GLOBAL (INI YANG FIX MASALAH) */}
      <Navbar />

      {/* HERO */}
      <div className="bg-blue-600 text-white py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">Katalog Sepatu</h1>
          <p className="text-blue-100 text-lg">Temukan sepatu impian Anda</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari sepatu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg"
            />
          </div>

          {/* CATEGORY */}
          <div className="relative w-full md:w-72">
            <div
              className="w-full px-4 py-3 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2 text-gray-600">
                <List size={18} /> {selectedCategory}
              </div>
              <ChevronDown size={18} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10">

                <div
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
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
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
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

        <p className="text-gray-500 mb-6 text-sm">
          Menampilkan {filteredProducts.length} produk
        </p>

        {/* PRODUK */}
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-400">Produk tidak ditemukan</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-xl overflow-hidden bg-white hover:shadow-md">

                <div className="h-48 bg-gray-100">
                  <img
                    src={`http://localhost:8080/uploads/${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500">{product.category}</p>
                  <h3 className="font-bold text-lg">{product.name}</h3>

                  <div className="flex justify-between mt-3 mb-3">
                    <span className="font-bold text-blue-600">
                      Rp {product.price?.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs">Stok: {product.stock}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Tambah ke Keranjang
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}