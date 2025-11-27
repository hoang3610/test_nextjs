'use client'; // Bắt buộc: Vì dùng usePathname để check link active

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  FileText,
  Package
} from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();

  // Danh sách menu
  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Sản phẩm', 
      href: '/admin/products', 
      icon: Package 
    },
    { 
      name: 'Đơn hàng', 
      href: '/admin/orders', 
      icon: ShoppingBag 
    },
    { 
      name: 'Khách hàng', 
      href: '/admin/users', 
      icon: Users 
    },
    { 
      name: 'Bài viết', 
      href: '/admin/posts', 
      icon: FileText 
    },
    { 
      name: 'Cài đặt', 
      href: '/admin/settings', 
      icon: Settings 
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-gray-300 shadow-xl">
      
      {/* 1. Logo Section */}
      <div className="flex items-center justify-center h-16 border-b border-slate-800 shadow-sm">
        <span className="text-2xl font-bold text-white tracking-wider">
          HoangGia<span className="text-blue-500">Admin</span>
        </span>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Quản lý chung
        </p>
        
        {menuItems.map((item) => {
          // Kiểm tra xem link này có đang active không
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon 
                className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors
                  ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                `} 
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* 3. User Profile / Logout Section */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">admin@hoanggia.com</p>
          </div>
        </div>
        
        <button 
          onClick={() => console.log('Đăng xuất...')}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-slate-800/50 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-slate-700 hover:border-red-500"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;