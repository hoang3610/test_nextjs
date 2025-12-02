'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings, 
  Package, 
  FileText 
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'; // Import Context
import AdminHeader from '@/components/layout/admin/AdminHeader';
import AdminSidebar, { MenuItem, SidebarTheme } from '@/components/layout/admin/AdminSidebar';

// --- 1. Inner Component (Nơi chứa logic giao diện chính) ---
const AdminLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  
  // Lấy state isCollapsed để tính toán padding cho main content
  const { isCollapsed } = useSidebar();
  
  const isDark = theme === 'dark';

  // Định nghĩa Theme cho Sidebar dựa trên Dark/Light mode hiện tại
  const sidebarTheme: SidebarTheme = {
    container: isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800',
    border: isDark ? 'border-gray-800' : 'border-gray-200',
    itemHover: isDark ? 'hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900',
    itemActive: 'bg-blue-600 text-white shadow-md',
    itemText: isDark ? 'text-gray-400' : 'text-gray-600',
    itemIcon: isDark ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-700',
    sectionTitle: isDark ? 'text-gray-500' : 'text-gray-400',
  };

  // Định nghĩa Menu Items
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Khách hàng', href: '/admin/users', icon: Users },
    { name: 'Bài viết', href: '/admin/posts', icon: FileText },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* 1. Sidebar (Fixed Left - Z-index 50) */}
      <AdminSidebar
        items={menuItems}
        theme={sidebarTheme}
        header={
           <span className="text-xl font-bold tracking-wide">
             HoangGia<span className="text-blue-600">Admin</span>
           </span>
        }
      />

      {/* 2. Header (Fixed Top - Z-index 40) */}
      <AdminHeader />

      {/* 3. Main Content (Scrollable) */}
      <main 
        className={`
          flex-1 
          pt-20 /* Padding Top = Header Height (16) + Gap (4) */
          p-6    /* Padding chung cho nội dung */
          transition-[padding] duration-300 ease-in-out /* Hiệu ứng trượt mượt mà */
          
          /* LOGIC QUAN TRỌNG: Dịch chuyển nội dung tránh Sidebar */
          ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}
        `}
      >
        {/* Render nội dung trang con (Page) */}
        <div className="mx-auto max-w-7xl animate-fade-in">
          {children}
        </div>
      </main>

    </div>
  );
};

// --- 2. Outer Component (Wrapper cung cấp Context) ---
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Bọc SidebarProvider ở đây để AdminLayoutContent bên trong có thể dùng useSidebar()
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
};

export default AdminLayout;