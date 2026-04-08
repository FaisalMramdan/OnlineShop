import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';


export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      {/* 1. Sidebar di Kiri */}
      <Sidebar />

      {/* 2. Area Konten Utama di Kanan */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
 

        {/* Area Scroll untuk Halaman (Dashboard, Produk, dll masuk ke sini) */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </main>

      </div>
    </div>
  );
}