'use client';

import React from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  Sun, 
  Moon, 
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme'; 
import { useSidebar } from '@/context/SidebarContext'; // <--- 1. Import Context

const AdminHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, toggleSidebar } = useSidebar(); 
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header 
      /* LOGIC QUAN TRỌNG: 
        - Trên Desktop (md): Padding Left thay đổi theo độ rộng Sidebar 
          (Sidebar w-64 -> Header pl-64 | Sidebar w-20 -> Header pl-20)
        - Trên Mobile: Padding Left = 0 (Vì sidebar ẩn)
      */
      className={`
        fixed top-0 right-0 z-40 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-[padding] duration-100 ease-in-out ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}
      `}
    >
      <div className="flex items-center justify-between h-full px-6">
        
        {/* --- LEFT SECTION: Mobile Toggle & Search --- */}
        <div className="flex items-center gap-4">
          
          {/* Nút Hamburger: Chỉ hiện trên Mobile để mở Sidebar */}
          <button 
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden text-gray-600 dark:text-gray-300 transition-colors"
            onClick={toggleSidebar} // Gọi hàm toggle từ context
          >
            <Menu size={24} />
          </button>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center relative group">
            <Search className="absolute left-3 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm (Ctrl + K)..." 
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* --- RIGHT SECTION: Actions --- */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Theme Toggle */}
          <div className="w-10 h-10 flex items-center justify-center"> {/* Placeholder to prevent layout shift */}
            {isMounted && (
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              >
                <div className="animate-fade-in">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
              </button>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

          {/* User Profile Dropdown */}
          <div className="group relative">
            <button className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                 <User size={18} />
              </div>
              <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Super Admin</p>
              </div>
            </button>

            {/* Dropdown Menu (Ví dụ đơn giản, nên tách ra component riêng nếu phức tạp) */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Tài khoản của tôi</p>
              </div>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Settings size={16} className="mr-2" /> Cài đặt
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={16} className="mr-2" /> Đăng xuất
              </a>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminHeader;