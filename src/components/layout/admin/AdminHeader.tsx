'use client';

import React from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  Sun, 
  Moon, 
  User 
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme'; // Sử dụng hook theme bạn đã có

const AdminHeader = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-full h-full flex items-center justify-between">
      
      {/* 1. Left Section: Mobile Menu & Search */}
      <div className="flex items-center gap-4">
        {/* Nút Hamburger (Chỉ hiện trên Mobile) */}
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden text-gray-600 dark:text-gray-300">
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
          />
        </div>
      </div>

      {/* 2. Right Section: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Đổi giao diện"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
          <Bell size={20} />
          {/* Badge chấm đỏ thông báo */}
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
        </button>

        {/* Divider dọc */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* User Profile Dropdown (Giản lược) */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <User size={18} />
            </div>
            <div className="hidden md:block text-sm">
                <p className="font-semibold text-gray-700 dark:text-gray-200">Admin</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;