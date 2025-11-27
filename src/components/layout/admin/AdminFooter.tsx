import Link from 'next/link';

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Phần bên trái: Bản quyền */}
        <div className="text-sm text-gray-500">
          © {currentYear} <span className="font-semibold text-gray-700">Tên Cửa Hàng</span>. All rights reserved.
        </div>

        {/* Phần bên phải: Links & Version */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <Link 
            href="/admin/support" 
            className="hover:text-blue-600 transition-colors"
          >
            Hỗ trợ
          </Link>
          <Link 
            href="/admin/privacy" 
            className="hover:text-blue-600 transition-colors"
          >
            Bảo mật
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
            v1.0.0
          </span>
        </div>

      </div>
    </footer>
  );
}