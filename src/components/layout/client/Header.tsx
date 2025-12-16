'use client'; // 1. BẮT BUỘC: Vì dùng useState, useRef, hooks

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';             // 2. Thay thế react-router-dom
import { usePathname } from 'next/navigation'; // 3. Thay thế useLocation
import Image from 'next/image';           // 4. Dùng Image tối ưu
import { ShoppingCart, ChevronDown } from 'lucide-react'; // Import Icon

// Giả định bạn đã copy các hooks này vào folder src/hooks hoặc src/context
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

// --- DATA MENU ---
const PRODUCT_MENU = [
  {
    title: "Kéo cắt tóc",
    slug: "keo-cat-toc",
    items: [
      { name: "Kéo cắt", slug: "keo-cat" },
      { name: "Kéo tỉa", slug: "keo-tia" },
      { name: "Bộ kéo", slug: "bo-keo" },
      { name: "Kéo tay trái", slug: "keo-tay-trai" },
    ]
  },
  {
    title: "Tông đơ cắt tóc",
    slug: "tong-do-cat-toc",
    items: [
      { name: "Tông đơ pin", slug: "tong-do-pin" },
      { name: "Tông đơ dây", slug: "tong-do-day" },
      { name: "Tông đơ chấn viền", slug: "tong-do-chan-vien" },
      { name: "Lưỡi tông đơ", slug: "luoi-tong-do" },
    ]
  },
  {
    title: "Phụ kiện tóc",
    slug: "phu-kien-toc",
    items: [
      { name: "Lược cắt tóc", slug: "luoc-cat-toc" },
      { name: "Áo choàng", slug: "ao-choang" },
      { name: "Bình xịt", slug: "binh-xit" },
      { name: "Kẹp tóc", slug: "kep-toc" },
      { name: "Đồ nghề khác", slug: "do-nghe-khac" },
    ]
  }
];

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { cartItems, cartCount, cartTotal } = useCart();

  const [isProductMenuOpen, setProductMenuOpen] = useState(false);
  const [isCartMenuOpen, setCartMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile Accordion States
  const [mobileExpandedLevels, setMobileExpandedLevels] = useState<{ [key: string]: boolean }>({});

  const closeProductMenuTimer = useRef<NodeJS.Timeout | null>(null);
  const closeCartMenuTimer = useRef<NodeJS.Timeout | null>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const isCartPage = pathname === '/cart';

  // Định nghĩa style
  const navLinkClasses = "font-medium transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";
  const activeNavLinkClasses = "text-blue-600 dark:text-blue-400 font-semibold";

  const getLinkClass = (path: string) => {
    return pathname === path ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses;
  };

  const toggleMobileLevel = (id: string) => {
    setMobileExpandedLevels(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 7. Auto-close empty cart popup
  useEffect(() => {
    if (isCartMenuOpen && cartItems.length === 0) {
      const timer = setTimeout(() => {
        setCartMenuOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCartMenuOpen, cartItems]);

  // 8. Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartMenuOpen(false);
      }
    };
    if (isCartMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartMenuOpen]);

  // Handle Mobile Cart Click
  const handleMobileCartClick = (e: React.MouseEvent) => {
    if (!isCartPage) {
      e.preventDefault();
      setCartMenuOpen(!isCartMenuOpen);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* 1. Left - Hamburger & Logo */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <Link href="/" className="hidden md:flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
            <span className="hidden sm:inline">HoangGia</span>
          </Link>
        </div>

        {/* 1b. Mobile Logo (Absolute Center) */}
        <div className="md:hidden absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
            <span className="">HoangGia</span>
          </Link>
        </div>

        {/* 2. Menu Desktop */}
        <nav className="hidden md:flex gap-8 h-full items-center">
          <Link href="/" className={getLinkClass('/')}>
            Trang chủ
          </Link>

          {/* --- Products Dropdown Menu (Desktop) --- */}
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
            <Link
              href="/products"
              className={`${pathname.includes('/products') ? activeNavLinkClasses : ''} ${navLinkClasses} flex items-center gap-1`}
            >
              Sản phẩm
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 transition-transform ${isProductMenuOpen ? 'rotate-180' : ''}`}>
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </Link>

            {isProductMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[1px] w-max bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border dark:border-gray-700">
                <div className="flex gap-10">
                  {PRODUCT_MENU.map((category) => (
                    <div key={category.slug} className="space-y-3">
                      <Link href={`/products?category=${category.slug}`} className="font-bold text-gray-800 dark:text-white hover:text-blue-600 block">
                        {category.title}
                      </Link>
                      <ul className="space-y-2 text-sm">
                        {category.items.map(item => (
                          <li key={item.slug}>
                            <Link href={`/products?category=${item.slug}`} className={navLinkClasses}>
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
            ref={cartRef}
            className="relative h-full flex items-center"
            onMouseEnter={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) return;
              if (isCartPage) return;
              if (closeCartMenuTimer.current) clearTimeout(closeCartMenuTimer.current);
              setCartMenuOpen(true);
            }}
            onMouseLeave={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) return;
              if (isCartPage) return;
              closeCartMenuTimer.current = setTimeout(() => setCartMenuOpen(false), 300);
            }}
          >
            <Link
              href="/cart"
              className="text-gray-800 dark:text-gray-200 flex items-center gap-2"
              onClick={handleMobileCartClick}
            >
              <div className="relative md:hidden">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="hidden md:inline">Giỏ hàng ({cartCount})</span>
            </Link>

            {isCartMenuOpen && !isCartPage && (
              <div className="absolute mt-[1px] top-full right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700 z-10 rounded-t-none">
                {cartItems.length > 0 ? (
                  <>
                    <div className="p-4 max-h-64 overflow-y-auto">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 mb-4">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image
                              src={item.imageUrl || 'https://placehold.co/600'}
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
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm font-medium">Chào, {user.name}</span>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors">
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:inline-flex bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg p-5 flex flex-col gap-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <Link href="/" className={getLinkClass('/')} onClick={() => setMobileMenuOpen(false)}>
            Trang chủ
          </Link>

          {/* Mobile Product Accordion Level 1 */}
          <div>
            <div
              className={`flex items-center justify-between cursor-pointer ${getLinkClass('/products')}`}
              onClick={() => toggleMobileLevel('products')}
            >
              <span>Sản phẩm</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileExpandedLevels['products'] ? 'rotate-180' : ''}`} />
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${mobileExpandedLevels['products'] ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-3 pl-4 border-l-2 border-gray-100 dark:border-gray-700 ml-1">

                {/* Level 2 Categories */}
                {PRODUCT_MENU.map((category) => (
                  <div key={category.slug}>
                    {/* Category Title + Arrow */}
                    <div
                      className="flex items-center justify-between cursor-pointer py-1"
                      onClick={() => toggleMobileLevel(category.slug)}
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-200">{category.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileExpandedLevels[category.slug] ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Level 3 Items */}
                    <div className={`overflow-hidden transition-all duration-300 ${mobileExpandedLevels[category.slug] ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col gap-2 pl-4 border-l border-gray-200 dark:border-gray-600 ml-1">
                        {category.items.map(item => (
                          <Link
                            key={item.slug}
                            href={`/products?category=${item.slug}`}
                            className="text-sm text-gray-500 dark:text-gray-400 py-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

          <Link href="/about" className={getLinkClass('/about')} onClick={() => setMobileMenuOpen(false)}>
            Giới thiệu
          </Link>
          <Link href="/booking" className={getLinkClass('/booking')} onClick={() => setMobileMenuOpen(false)}>
            Đặt lịch
          </Link>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
          {user ? (
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-red-600 font-medium">
              Đăng xuất
            </button>
          ) : (
            <Link href="/login" className="text-blue-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;