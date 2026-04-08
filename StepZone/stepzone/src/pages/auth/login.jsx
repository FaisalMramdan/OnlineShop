import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post('/login', {
        email,
        password
      });

      // 🔥 SIMPAN DATA
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', email); // sementara pakai email

      alert("Login berhasil!");

      // 🔥 REDIRECT BERDASARKAN ROLE
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl mb-4">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat Datang
          </h1>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            Masuk
          </button>

        </form>

        <p className="text-center text-sm mt-8">
          Belum punya akun?{" "}
          <Link to="/register" className="text-blue-600 font-bold">
            Daftar di sini
          </Link>
        </p>

      </div>
    </div>
  );
}