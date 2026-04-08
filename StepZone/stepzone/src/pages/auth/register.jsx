import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';

export default function Register() {
  // 1. Deklarasi state yang sebelumnya terlewat
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 2. Fungsi hit API backend (Auth.go)
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Pastikan field sesuai dengan struct RegisterInput di Auth.go
      await axiosInstance.post('/register', { name, email, password });
      alert('Register berhasil! Silakan login.');
      navigate('/login'); // Lempar ke halaman login setelah sukses
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Register gagal. Pastikan email belum digunakan.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl mb-4">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar untuk mulai belanja</p>
        </div>

        {/* Form Register dihubungkan ke onSubmit dan State */}
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full block text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 mt-4"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link>
        </p>

      </div>
    </div>
  );
}