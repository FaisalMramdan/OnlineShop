import React, { useState, useEffect, useRef } from 'react';
import { Package, List, ShoppingCart, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const profileRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600"
      : "text-gray-600 hover:text-blue-600";

  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('email');

  // Fetch cart count
  useEffect(() => {
    if (token) {
      fetchCartCount();
    }
  }, [token, location.pathname]);

  const fetchCartCount = async () => {
    try {
      const res = await axiosInstance.get('/user/cart');
      const items = res.data.item || [];
      const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="border-b px-8 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-blue-600 text-white p-1.5 rounded-md">
          <Package size={20} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-gray-800 leading-tight">StepZone</span>
          <span className="text-[10px] text-gray-400 leading-tight">Toko Sepatu Online</span>
        </div>
      </Link>

      {/* Navigation */}
      <div className="flex items-center gap-6">

        <Link to="/" className={`font-medium flex items-center gap-2 transition-colors ${isActive('/')}`}>
          <List size={18} /> Katalog
        </Link>

        {token ? (
          <>
            {/* Cart with badge */}
            <Link to="/cart" className={`font-medium flex items-center gap-2 relative transition-colors ${isActive('/cart')}`}>
              <ShoppingCart size={18} /> Keranjang
              {cartCount > 0 && (
                <span className="absolute -top-2 left-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <Link to="/orders" className={`font-medium flex items-center gap-2 transition-colors ${isActive('/orders')}`}>
              <Package size={18} /> Pesanan Saya
            </Link>

            {/* Profile Dropdown */}
            <div className="relative ml-2" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                  isProfileOpen 
                    ? 'border-blue-200 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <User size={18} /> {name || "Customer User"}
              </button>

              {/* Dropdown Popup */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                  {/* User Info */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">{name || "Customer User"}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{email || "customer@example.com"}</p>
                  </div>

                  {/* Logout Button */}
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}