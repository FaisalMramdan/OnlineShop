import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';

export default function Produk() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================= HANDLE FORM =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ================= SUBMIT =================
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isEdit) {
      // 🔥 UPDATE = JSON (bukan form-data)
      await axiosInstance.put(`/admin/products/${selectedId}`, {
        name: formData.name,
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description
      });

      alert("Produk berhasil diupdate!");
    } else {
      // 🔥 CREATE = FORM DATA (untuk upload image)
      const data = new FormData();
      data.append("name", formData.name);
      data.append("category_id", formData.category_id);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("description", formData.description);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await axiosInstance.post('/admin/products', data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Produk berhasil ditambahkan!");
    }

    setIsModalOpen(false);
    setIsEdit(false);
    setSelectedId(null);

    fetchProducts();

  } catch (err) {
    console.error("ERROR:", err.response?.data);
    alert("Gagal submit data");
  }
};

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus produk?")) return;

    try {
      await axiosInstance.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Produk</h1>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEdit(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Plus size={16}/> Tambah
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="p-4">Nama</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Stok</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">Rp {p.price}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4 text-right flex justify-end gap-2">

                  <button onClick={() => handleEdit(p)}>
                    <Edit size={18}/>
                  </button>

                  <button onClick={() => handleDelete(p.id)}>
                    <Trash2 size={18}/>
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 MODAL MODERN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">

            {/* HEADER */}
            <div className="p-6 border-b flex justify-between">
              <h2 className="font-bold text-lg">
                {isEdit ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* PREVIEW */}
              <div className="w-full h-60 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Preview Gambar</span>
                )}
              </div>

              {/* UPLOAD */}
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* INPUT */}
              <input
                name="name"
                placeholder="Nama Produk"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Pilih kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="price"
                  type="number"
                  placeholder="Harga"
                  value={formData.price}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />

                <input
                  name="stock"
                  type="number"
                  placeholder="Stok"
                  value={formData.stock}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>

              <textarea
                name="description"
                placeholder="Deskripsi"
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* BUTTON */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 py-2 rounded"
                >
                  Batal
                </button>

                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
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