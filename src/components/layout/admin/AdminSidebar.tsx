'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import IconCaretsDown from '@/components/icons/icon-carets-down'; // Giữ nguyên icon của bạn
import { useSidebar } from '@/context/SidebarContext'; // Import Context

// --- 1. INTERFACES ---
export interface SidebarTheme {
  container: string;
  border: string;
  itemHover: string;
  itemActive: string;
  itemText: string;
  itemIcon: string;
  sectionTitle: string;
}

export interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface AdminSidebarProps {
  items: MenuItem[];
  theme: SidebarTheme;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

// --- 2. DEFAULT THEME (Fallback an toàn) ---
const DEFAULT_THEME: SidebarTheme = {
  container: 'bg-slate-900 text-gray-300',
  border: 'border-slate-800',
  itemHover: 'hover:bg-slate-800 hover:text-white',
  itemActive: 'bg-blue-600 text-white shadow-md',
  itemText: 'text-gray-400',
  itemIcon: 'text-gray-400',
  sectionTitle: 'text-gray-500',
};

// --- 3. MAIN COMPONENT ---
const AdminSidebar = ({ 
  items, 
  theme, 
  header, 
  footer, 
}: AdminSidebarProps) => {
  const pathname = usePathname();
  
  // Lấy state từ Context
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Logic an toàn: Nếu không truyền theme/items thì dùng mặc định
  const safeTheme = theme || DEFAULT_THEME;
  const safeItems = Array.isArray(items) ? items : [];

  return (
        /* Mobile: Ẩn/Hiện bằng transform */
/* Desktop: Thay đổi chiều rộng và reset transform */
    <aside 
      className={`
        fixed top-0 left-0 z-50 h-full
        flex flex-col
        border-r ${theme.border} ${theme.container}
        transition-transform duration-300 ease-in-out md:transition-all
        w-64 transform ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}
    >
      
      {/* --- HEADER SECTION --- */}
      <div 
        className={`
          flex items-center h-16 px-4 border-b transition-all duration-300
          ${safeTheme.border}
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}
      >
        {/* Logo: Chỉ hiện khi mở */}
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap transition-opacity duration-300">
             {header || <span className="font-bold text-lg">Admin</span>}
          </div>
        )}

        {/* Nút Toggle: Xoay dựa theo trạng thái */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={`
            flex items-center justify-center w-8 h-8 rounded-full 
            hover:bg-white/10 text-current transition-all duration-300
            ${isCollapsed ? 'rotate-[-90deg]' : 'rotate-90'}
          `}
        >
          <IconCaretsDown />
        </button>
      </div>

      {/* --- MENU ITEMS --- */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {safeItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : ''} // Tooltip native khi đóng
              className={`
                group flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isCollapsed ? 'justify-center px-0' : 'px-3'} 
                ${isActive 
                  ? safeTheme.itemActive
                  : `${safeTheme.itemText} ${safeTheme.itemHover}`
                }
              `}
            >
              <item.icon 
                className={`
                  flex-shrink-0 h-5 w-5 transition-colors
                  ${isActive ? 'text-current' : safeTheme.itemIcon} 
                  ${!isCollapsed && 'mr-3'} 
                `} 
              />
              
              {/* Text menu: Ẩn khi đóng + whitespace-nowrap để không bị vỡ dòng */}
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden opacity-100 transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* --- FOOTER SECTION --- */}
      {footer && (
        <div className={`border-t p-4 ${safeTheme.border} overflow-hidden`}>
          {!isCollapsed ? footer : (
             // Khi đóng, hiện một dấu chấm hoặc icon nhỏ để báo hiệu footer
             <div className="w-8 h-8 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
             </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;