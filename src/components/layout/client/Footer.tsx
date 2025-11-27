import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Cột 1: Thông tin chung */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">KeoHoangGia</h3>
          <p className="text-sm">
            Chuyên cung cấp các sản phẩm thời trang, công nghệ chất lượng cao hàng đầu Việt Nam.
          </p>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Liên kết</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Sản phẩm mới
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Tin tức
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3: Chính sách */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Hỗ trợ</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/policy" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Vận chuyển
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 4: Địa chỉ */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Liên hệ</h3>
          <p className="text-sm">📍 123 Đường ABC, Quận 1, TP.HCM</p>
          <p className="text-sm">📞 0909 123 456</p>
          <p className="text-sm">✉️ support@KeoHoangGia.com</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-8 py-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} KeoHoangGia. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;