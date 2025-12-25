'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} strokeWidth={3} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
                <p className="text-gray-500 mb-8">
                    Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/products"
                        className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                    >
                        Tiếp tục mua sắm
                    </Link>
                    <Link
                        href="/"
                        className="block w-full bg-white text-gray-700 font-medium py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
