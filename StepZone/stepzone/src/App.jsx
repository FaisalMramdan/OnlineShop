import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Layout Pembungkus
import AdminLayout from "./components/AdminLayout";

// Import Halaman User
import Home from "./pages/User/Home";
import Cart from "./pages/User/Cart";
import MyOrders from "./pages/User/Orders";

// Import Halaman Admin
import Dashboard from "./pages/admin/Dashboard";
import Produk from "./pages/admin/Produk";
import Categories from "./pages/admin/categories";
import AdminOrders from "./pages/admin/Order";

// Import Halaman Auth
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute User Area */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<MyOrders />} />
     
        {/* Rute Khusus Admin (Semua punya Sidebar & Navbar) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />              {/* url: /admin */}
          <Route path="produk" element={<Produk />} />         {/* url: /admin/produk */}
          <Route path="kategori" element={<Categories />} />   {/* url: /admin/kategori */}
          <Route path="pesanan" element={<AdminOrders />} />   {/* url: /admin/pesanan */}
        </Route>

        {/* Redirect untuk rute yang tidak ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;