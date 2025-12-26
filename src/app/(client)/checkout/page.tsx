'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { showToast } from '@/components/custom/custom-toast';

const GUEST_USER_ID = '674488888888888888888888';

interface Province { code: number; name: string; }
interface Ward { code: number; name: string; }

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { cartItems, cartTotal, clearCart } = useCart();

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        province_code: '',
        district: '', // Kept for backend compatibility but disabled in UI
        ward_code: '',
        street_address: '',
        note: '',
        payment_method: 'COD' as 'COD' | 'BANKING'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Location Data State
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fetch Provinces on load
        fetch('/api/locations/provinces')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProvinces(data);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (isMounted && cartItems.length === 0) {
            router.push('/cart');
        }
    }, [isMounted, cartItems, router]);

    // Fetch Wards when Province changes (Skip District)
    useEffect(() => {
        if (formData.province_code) {
            setIsLoadingWards(true);
            fetch(`/api/locations/wards?province_code=${formData.province_code}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setWards(data);
                    setFormData(prev => ({ ...prev, ward_code: '' }));
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoadingWards(false));

            // Optional: reset district if we were using it, but we aren't
        } else {
            setWards([]);
        }
    }, [formData.province_code]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (method: 'COD' | 'BANKING') => {
        setFormData(prev => ({ ...prev, payment_method: method }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            showToast({ message: 'Giỏ hàng trống!', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Get names from codes
            const provinceName = provinces.find(p => p.code === Number(formData.province_code))?.name || '';
            const wardName = wards.find(w => w.code === Number(formData.ward_code))?.name || '';

            const payload = {
                user_id: GUEST_USER_ID,
                order_code: `ORD-${Date.now()}`,
                payment_method: formData.payment_method,
                shipping_address: {
                    full_name: formData.full_name,
                    phone_number: formData.phone_number,
                    province: {
                        code: Number(formData.province_code),
                        name: provinceName
                    },
                    district: {
                        code: 0,
                        name: ""
                    },
                    ward: {
                        code: Number(formData.ward_code),
                        name: wardName
                    },
                    street_address: formData.street_address,
                    note: formData.note
                },
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    sku: item.sku || "SKU-UNKNOWN",
                    image_url: item.imageUrl
                })),
                subtotal_amount: cartTotal,
                shipping_fee: 0,
                discount_amount: 0,
                grand_total: cartTotal,
                status: 'PENDING',
                payment_status: 'PENDING'
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                showToast({ message: 'Đặt hàng thành công!', type: 'success' });
                clearCart();
                router.push('/checkout/success');
            } else {
                showToast({ message: data.message || 'Có lỗi xảy ra', type: 'error' });
            }

        } catch (error) {
            console.error('Checkout error:', error);
            showToast({ message: 'Lỗi kết nối đến máy chủ', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Thanh toán</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Shipping & Payment */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Shipping Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                                Thông tin giao hàng
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        required
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        required
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        placeholder="0912..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Tỉnh / Thành phố *</label>
                                    <select
                                        name="province_code"
                                        value={formData.province_code}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="">Chọn Tỉnh/Thành</option>
                                        {provinces.map(p => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Quận / Huyện</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        disabled
                                        placeholder="(Sử dụng phường xã mới nhé bạn ưiii)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-gray-100 opacity-60 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Phường / Xã *</label>
                                    <select
                                        name="ward_code"
                                        value={formData.ward_code}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.province_code || isLoadingWards}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        <option value="">{isLoadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}</option>
                                        {wards.map(w => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Địa chỉ cụ thể *</label>
                                    <input
                                        type="text"
                                        name="street_address"
                                        required
                                        value={formData.street_address}
                                        onChange={handleInputChange}
                                        placeholder="Số 123, đường ABC..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                                    <textarea
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        rows={2}
                                        placeholder="Giao giờ hành chính, gọi trước khi giao..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                                Phương thức thanh toán
                            </h2>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.payment_method === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="COD"
                                        checked={formData.payment_method === 'COD'}
                                        onChange={() => handlePaymentChange('COD')}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-sm text-gray-500">Bạn chỉ phải thanh toán khi đã nhận được hàng</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-not-allowed transition-all border-gray-100 bg-gray-50 opacity-60`}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="BANKING"
                                        checked={formData.payment_method === 'BANKING'}
                                        onChange={() => { }} // Disabled
                                        disabled
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-500">Chuyển khoản ngân hàng (Bảo trì)</p>
                                        <p className="text-sm text-gray-400">Quét mã QR hoặc chuyển khoản thủ công</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng ({cartItems.length} sản phẩm)</h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-auto custom-scroll pr-1">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-bl-md font-bold">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-green-600 font-medium">Miễn phí</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                                    <span>Tổng cộng</span>
                                    <span className="text-blue-600">{formatCurrency(cartTotal)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || cartItems.length === 0}
                                className="w-full mt-6 bg-blue-600 text-white py-3.5 rounded-full font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Đặt hàng ngay'
                                )}
                            </button>

                            <Link href="/cart" className="block text-center text-sm text-gray-500 mt-4 hover:underline">
                                Quay lại giỏ hàng
                            </Link>

                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
