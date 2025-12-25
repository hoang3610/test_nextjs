'use client'; // 1. Bắt buộc: Vì trang này dùng Context và Event Handler

import React from 'react';
import Link from 'next/link';   // 2. Import Link của Next.js
import Image from 'next/image'; // 3. Import Image tối ưu
import { useCart } from '@/hooks/useCart'; // Sử dụng alias @ để import gọn hơn

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Helper format tiền tệ (nếu chưa có trong utils)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Trường hợp giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Giỏ hàng của bạn đang trống
        </h2>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
        Giỏ hàng của bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm (Bên trái) */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">

              {/* Hình ảnh sản phẩm */}
              <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600 mr-6">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              {/* Thông tin & Giá */}
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Đơn giá: {formatCurrency(item.price)}
                </p>
              </div>

              {/* Bộ điều khiển số lượng & Xóa */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val > 0) updateQuantity(item.id, val);
                  }}
                  className="w-16 text-center border rounded-md py-1 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1"
                />

                <p className="font-semibold w-28 text-right text-blue-600 dark:text-blue-400">
                  {formatCurrency(item.price * item.quantity)}
                </p>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Xóa sản phẩm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tóm tắt đơn hàng (Bên phải) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tóm tắt đơn hàng</h2>

            <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-300">
              <span>Tạm tính</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>

            <div className="flex justify-between mb-4 text-gray-600 dark:text-gray-300">
              <span>Phí vận chuyển</span>
              <span className="text-green-600 font-medium">Miễn phí</span>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
              <span>Tổng cộng</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(cartTotal)}</span>
            </div>

            <Link href="/checkout" className="w-full mt-6 bg-blue-600 text-white py-3 rounded-full font-bold hover:bg-blue-700 transition-transform active:scale-95 shadow-md block text-center">
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;