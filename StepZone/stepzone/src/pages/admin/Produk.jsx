import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Filter, ChevronDown } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';

export default function Produk() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    description: '',
    image: null
  });

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/admin/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/admin/categories');
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
  const filteredProducts = (products || []).filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'Semua Kategori' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // ================= HANDLE FORM =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category_id: '', price: '', stock: '', description: '', image: null });
    setIsEdit(false);
    setSelectedId(null);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axiosInstance.put(`/admin/products/${selectedId}`, {
          name: formData.name,
          category_id: Number(formData.category_id),
          price: Number(formData.price),
          stock: Number(formData.stock),
          description: formData.description
        });
      } else {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("category_id", formData.category_id);
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        data.append("description", formData.description);
        if (formData.image) data.append("image", formData.image);

        await axiosInstance.post('/admin/products', data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("ERROR:", err.response?.data);
      alert("Gagal submit data");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin hapus produk ini?')) return;
    try {
      await axiosInstance.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal menghapus produk';
      alert('Error: ' + msg);
      console.error(err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (product) => {
    setIsModalOpen(true);
    setIsEdit(true);
    setSelectedId(product.id);
    setFormData({
      name: product.name,
      category_id: product.category_id || '',
      price: product.price,
      stock: product.stock || '',
      description: product.description || '',
      image: null
    });
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola Katalog produk sepatu Anda</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setIsEdit(false); resetForm(); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors cursor-pointer text-sm"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="relative w-full sm:w-56">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer bg-white text-sm text-gray-600 hover:border-gray-300"
          >
            <span>{selectedCategory}</span>
            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
              {['Semua Kategori', ...categories.map(c => c.name)].map(cat => (
                <div
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${selectedCategory === cat ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT GRID */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-base">Produk tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">

              {/* Product Image */}
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                {p.image ? (
                  <img
                    src={`http://localhost:8080/uploads/${p.image}`}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    No Image
                  </div>
                )}

                {/* Action Buttons on Image */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-blue-600 cursor-pointer"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-xs text-blue-500 font-medium mb-1">{p.category}</p>
                <h3 className="font-bold text-gray-800 text-base mb-1">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-1">{p.description || 'Sepatu berkualitas tinggi'}</p>

                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">
                    Rp {p.price?.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-gray-400">Stok: {p.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* MODAL HEADER */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-900">
                {isEdit ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* PREVIEW IMAGE */}
              <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200">
                {formData.image ? (
                  <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-sm">Preview Gambar</p>
                    <p className="text-xs mt-1">Upload gambar di bawah</p>
                  </div>
                )}
              </div>

              {/* UPLOAD */}
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1 block">Gambar Produk</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border border-gray-200 p-2 rounded-lg text-sm file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium cursor-pointer"
                />
              </label>

              {/* NAMA */}
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1 block">Nama Produk</span>
                <input
                  name="name"
                  placeholder="Contoh: Nike Air Max 270"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              {/* KATEGORI */}
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1 block">Kategori</span>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              {/* HARGA & STOK */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 mb-1 block">Harga (Rp)</span>
                  <input
                    name="price"
                    type="number"
                    placeholder="1299000"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 mb-1 block">Stok</span>
                  <input
                    name="stock"
                    type="number"
                    placeholder="45"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* DESKRIPSI */}
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1 block">Deskripsi</span>
                <textarea
                  name="description"
                  placeholder="Deskripsi produk..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </label>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm cursor-pointer"
                >
                  {isEdit ? "Perbarui" : "Simpan"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}