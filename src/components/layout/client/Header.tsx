'use client'; // 1. BẮT BUỘC: Vì dùng useState, useRef, hooks

import React, { useState, useRef } from 'react';
import Link from 'next/link';             // 2. Thay thế react-router-dom
import { usePathname } from 'next/navigation'; // 3. Thay thế useLocation
import Image from 'next/image';           // 4. Dùng Image tối ưu

// Giả định bạn đã copy các hooks này vào folder src/hooks hoặc src/context
// Nhớ sửa đường dẫn import cho đúng với dự án mới nhé
import { useTheme } from '@/hooks/useTheme'; 
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartItems, cartCount, cartTotal } = useCart();
  
  const [isProductMenuOpen, setProductMenuOpen] = useState(false);
  const [isCartMenuOpen, setCartMenuOpen] = useState(false);
  
  const closeProductMenuTimer = useRef<NodeJS.Timeout | null>(null); // Fix type cho TypeScript
  const closeCartMenuTimer = useRef<NodeJS.Timeout | null>(null);
  
  const pathname = usePathname(); // 5. Lấy đường dẫn hiện tại
  const isCartPage = pathname === '/cart';

  // Định nghĩa style
  const navLinkClasses = "font-medium transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";
  const activeNavLinkClasses = "text-blue-600 dark:text-blue-400 font-semibold";

  // 6. Hàm kiểm tra Active Link thủ công (Thay thế NavLink)
  const getLinkClass = (path: string) => {
    return pathname === path ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        
        {/* 1. Logo */}
        <div>
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m7.848 8.25 1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.165 2.165 0 0 1 1.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 1 1-5.196 3 3 3 0 0 1 5.196-3Zm1.536-.887a2.165 2.165 0 0 0 1.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863 2.077-1.199m0-3.328a4.323 4.323 0 0 1 2.068-1.379l5.325-1.628a4.5 4.5 0 0 1 2.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.33 4.33 0 0 0 10.607 12m3.736 0 7.794 4.5-.802.215a4.5 4.5 0 0 1-2.48-.043l-5.326-1.629a4.324 4.324 0 0 1-2.068-1.379M14.343 12l-2.882 1.664" />
            </svg>
            <span>HoangGia</span>
          </Link>
        </div>

        {/* 2. Menu điều hướng */}
        <nav className="flex gap-8 h-full items-center">
          <Link href="/" className={getLinkClass('/')}>
            Trang chủ
          </Link>
          
          {/* --- Products Dropdown Menu --- */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => {
              if (closeProductMenuTimer.current) clearTimeout(closeProductMenuTimer.current);
              setProductMenuOpen(true);
            }}
            onMouseLeave={() => {
              closeProductMenuTimer.current = setTimeout(() => setProductMenuOpen(false), 150);
            }}
          >
            {/* Logic Active cho menu cha: Nếu path chứa '/products' thì active */}
            <Link 
              href="/products" 
              className={`${pathname.includes('/products') ? activeNavLinkClasses : ''} ${navLinkClasses} flex items-center gap-1`}
            >
              Sản phẩm
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 transition-transform ${isProductMenuOpen ? 'rotate-180' : ''}`}>
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </Link>

            {/* Dropdown Panel */}
            {isProductMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[1px] w-max bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border dark:border-gray-700">
                <div className="flex gap-10">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 dark:text-white">Kéo</h3>
                    <ul className="space-y-2 text-sm">
                      <li><Link href="/products?category=ao-thun" className={navLinkClasses}>Áo Thun</Link></li>
                      <li><Link href="/products?category=quan-dai" className={navLinkClasses}>Quần Dài</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 dark:text-white">Phụ kiện</h3>
                    <ul className="space-y-2 text-sm">
                       <li><Link href="/products?category=balo" className={navLinkClasses}>Balo & Túi</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/about" className={getLinkClass('/about')}>
            Giới thiệu
          </Link>

          <Link href="/booking" className={getLinkClass('/booking')}>
            Đặt lịch
          </Link>
        </nav>

        {/* 3. Actions */}
        <div className="flex h-full items-center gap-5">
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>

          {/* --- Cart --- */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => {
              if (isCartPage) return;
              if (closeCartMenuTimer.current) clearTimeout(closeCartMenuTimer.current);
              setCartMenuOpen(true);
            }}
            onMouseLeave={() => {
              if (isCartPage) return;
              closeCartMenuTimer.current = setTimeout(() => setCartMenuOpen(false), 150);
            }}
          >
            <Link href="/cart" className="text-gray-800 dark:text-gray-200 flex items-center">
              Giỏ hàng ({cartCount})
            </Link>
            
            {isCartMenuOpen && !isCartPage && (
              <div className="absolute mt-[1px] top-full right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700 z-10 rounded-t-none">
                {cartItems.length > 0 ? (
                  <>
                    <div className="p-4 max-h-64 overflow-y-auto">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 mb-4">
                          {/* 7. Dùng Next Image thay cho img */}
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.name} 
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-grow">
                            <p className="font-semibold text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} x {item.price.toLocaleString()}₫</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* ... Phần tổng tiền giữ nguyên ... */}
                    <div className="border-t dark:border-gray-700 p-4">
                        <div className="flex justify-between font-bold mb-4">
                          <span>Tổng cộng:</span>
                          <span>{cartTotal.toLocaleString()}₫</span>
                        </div>
                        <div className="flex gap-2">
                           <Link href="/cart" className="flex-1 text-center bg-gray-200 dark:bg-gray-600 text-sm font-bold py-2 px-4 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500">Xem giỏ hàng</Link>
                           <button className="flex-1 text-center bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-blue-700">Thanh toán</button>
                        </div>
                    </div>
                  </>
                ) : (
                  <p className="p-8 text-center text-gray-500">Giỏ hàng trống.</p>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Chào, {user.name}</span>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors">
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;