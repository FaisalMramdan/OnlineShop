import React from 'react';
import { Package, List, ShoppingCart, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600"
      : "text-gray-600 hover:text-blue-600";

  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name'); // 🔥 ambil nama

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name'); // 🔥 hapus juga

    alert("Berhasil Logout");
    navigate('/login');
  };

  return (
    <nav className="border-b px-8 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
      
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-blue-600 text-white p-1 rounded-md">
          <Package size={20} />
        </div>
        <span className="font-bold text-xl text-gray-800">Shoe Store</span>
      </Link>

      <div className="flex items-center gap-6">

        <Link to="/" className={`font-medium flex items-center gap-2 ${isActive('/')}`}>
          <List size={18} /> Katalog
        </Link>

        {token ? (
          <>
            <Link to="/cart" className={`font-medium flex items-center gap-2 ${isActive('/cart')}`}>
              <ShoppingCart size={18} /> Keranjang
            </Link>

            <Link to="/orders" className={`font-medium flex items-center gap-2 ${isActive('/orders')}`}>
              <Package size={18} /> Pesanan Saya
            </Link>

            {/* 🔥 PROFIL + LOGOUT */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l">

              <span className="flex items-center gap-2 text-gray-700 font-medium">
                <User size={18}/> {name || "User"}
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-md font-medium hover:bg-red-100"
              >
                <LogOut size={18} /> Logout
              </button>

            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}