import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  Layers3, 
  ShoppingCart, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Produk', path: '/admin/produk', icon: Box },
    { name: 'Kategori', path: '/admin/kategori', icon: Layers3 },
    { name: 'Pesanan', path: '/admin/pesanan', icon: ShoppingCart },
  ];

  // 🔥 LOGOUT FIX TOTAL
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    alert("Berhasil logout");

    // 🔥 PAKAI INI BIAR GA BISA BACK
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-full">
      
      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          StepZone <span className="text-sm text-gray-400">Admin</span>
        </h1>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              ${isActive 
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* 🔥 LOGOUT FIX */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
        >
          <LogOut size={20} />
          Keluar Akun
        </button>
      </div>

    </aside>
  );
}