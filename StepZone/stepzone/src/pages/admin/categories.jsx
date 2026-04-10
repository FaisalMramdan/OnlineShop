import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';

export default function Categories() {
  // State untuk menyimpan data dari Backend
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fungsi untuk mengambil data dari Golang
  const fetchCategories = async () => {
    try {
      // Nembak ke endpoint GET /api/categories (Sesuaikan dengan route di Golang-mu)
       const response = await axiosInstance.get('/admin/categories')
      setCategories(response.data || []); // Masukkan data dari database ke state
      setIsLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data kategori:", error);
      setIsLoading(false);
    }
  };

  // useEffect: Jalan otomatis 1x saat halaman pertama kali dibuka
  useEffect(() => {
    (async () => {
      await fetchCategories();
    })();
  }, []);

  // Handle Tambah Kategori
  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post('/admin/categories', {
        name: categoryName
      });

      alert("Kategori berhasil ditambahkan!");
      setIsModalOpen(false);
      setCategoryName('');
      fetchCategories();
    } catch (error) {
      alert("Gagal tambah kategori");
    }
  };

  // Handle Edit Kategori
  const handleEdit = (cat) => {
    setIsEditMode(true);
    setSelectedId(cat.id);
    setCategoryName(cat.name);
    setIsModalOpen(true);
  };

  // Handle Update Kategori
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.put(`/admin/categories/${selectedId}`, {
        name: categoryName
      });

      alert("Kategori berhasil diupdate!");
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedId(null);
      setCategoryName('');
      fetchCategories();
    } catch (error) {
      alert("Gagal update kategori");
    }
  };

  // Handle Hapus Kategori
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin hapus kategori?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
      alert("Kategori berhasil dihapus!");
      fetchCategories();
    } catch (error) {
      alert("Gagal hapus kategori");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kategori Produk</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola pengelompokan produk dari database.</p>
      </div>

      {/* Wrapper Utama */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Toolbar (Search & Tombol Tambah) */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kategori..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button onClick={() => {
            setIsEditMode(false);
            setCategoryName('');
            setIsModalOpen(true);
          }} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
            <Plus size={16} />
            Tambah Kategori
          </button>
        </div>

        {/* Grid List Kategori */}
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Memuat data dari database...</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Belum ada kategori di database.</div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div key={cat.id} className="p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="font-bold text-gray-800 text-lg">{cat.name}</h2>
                  {/* Tombol Edit/Hapus */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                  </div>
                </div>
                {/* Kita hilangkan totalProducts dan desc karena di database kamu cuma ada id dan name */}
                <p className="text-sm text-gray-500 mb-2">ID Kategori: {cat.id}</p>
              </div>
            ))}
          </div>
        )}  

      </div>

      {/* MODAL TAMBAH/EDIT KATEGORI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-800 text-lg">{isEditMode ? "Edit Kategori" : "Tambah Kategori"}</h2>
            </div>
            
            <form onSubmit={isEditMode ? handleUpdate : handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kategori</label>
                <input 
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Nama kategori"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setSelectedId(null);
                    setCategoryName('');
                  }} 
                  className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                  {isEditMode ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}