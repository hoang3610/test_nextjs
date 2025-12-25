'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { X, Calendar, User, MapPin, CreditCard, Box, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { ModalCustom } from '@/components/custom/modal-custom';
import { showToast } from '@/components/custom/custom-toast';
import { Table, Column } from '@/components/custom/table';
import { OrderResponse } from '../models/response/order';

interface ViewOrderProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
}

const ViewOrder: React.FC<ViewOrderProps> = ({ isOpen, onClose, orderId }) => {
    // --- State ---
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState<OrderResponse | null>(null);

    // --- Helpers ---
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED':
            case 'REFUNDED': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PROCESSING':
            case 'SHIPPING': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 font-bold';
            case 'FAILED': return 'text-red-600 font-bold';
            default: return 'text-gray-500';
        }
    };

    // --- Table Columns ---
    const columns: Column<any>[] = [
        {
            header: 'STT',
            className: 'text-center w-[50px] hidden md:table-cell',
            render: (_: any, index: number) => (
                <div className="text-gray-500 font-medium">
                    {index + 1}
                </div>
            )
        },
        {
            header: 'Sản phẩm',
            className: 'min-w-[200px] md:min-w-[250px]',
            render: (item: any) => (
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Box size={20} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 line-clamp-2 text-sm md:text-base">{item.name}</p>
                        <p className="text-xs text-blue-600 font-mono mt-0.5">{item.sku}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'SL',
            className: 'text-center min-w-[60px] md:min-w-[80px]',
            render: (item: any) => <span className="font-medium text-gray-700 text-sm md:text-base">{item.quantity}</span>
        },
        {
            header: 'Đơn giá',
            className: 'text-right font-mono min-w-[100px] hidden md:table-cell',
            render: (item: any) => <span className="text-sm text-gray-600">{formatCurrency(item.price)}</span>
        },
        {
            header: 'Thành tiền',
            className: 'text-right font-bold text-gray-800 font-mono min-w-[100px] md:min-w-[120px]',
            render: (item: any) => <span className="text-sm md:text-base">{formatCurrency(item.total_line_amount)}</span>
        }
    ];

    // --- Data Fetching ---
    useEffect(() => {
        if (isOpen && orderId) {
            const fetchOrder = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/orders/${orderId}/detail`);
                    const data = await res.json();

                    if (data.success) {
                        setOrder(data.data);
                    } else {
                        showToast({ message: data.message || "Không tìm thấy đơn hàng", type: "error" });
                        onClose();
                    }
                } catch (error) {
                    console.error("Error fetching order detail:", error);
                    showToast({ message: "Lỗi tải thông tin đơn hàng", type: "error" });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrder();
        } else {
            setOrder(null);
        }
    }, [isOpen, orderId, onClose]);


    // --- Custom Header ---
    const renderCustomHeader = () => {
        if (!order) return null;
        return (
            <div className="bg-white border-b border-gray-200 flex-shrink-0 z-10 w-full rounded-t-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 md:px-6 md:py-4 gap-3 md:gap-4">
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="flex items-start justify-between sm:justify-start gap-4">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Box className="w-5 h-5 md:w-6 md:h-6 text-[#1462B0]" />
                                Đơn hàng #{order.order_code}
                            </h2>
                            {/* Mobile Close Button */}
                            <button onClick={onClose} className="sm:hidden -mr-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                            <span className="text-gray-300 hidden sm:inline">|</span>
                            <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Close Button */}
                    <button onClick={onClose} className="hidden sm:block p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>
        );
    };

    // --- Modal Body ---
    const renderModalBody = (() => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-[300px]">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Đang tải chi tiết đơn hàng...</p>
                </div>
            )
        }

        if (!order) return null;

        return (
            <div className="p-4 md:p-6 space-y-6 md:space-y-8 bg-gray-50/50">
                {/* 1. Customer & Shipping Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Khách hàng
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Người nhận</p>
                                <p className="font-medium text-gray-800 text-base">{order.shipping_address?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p className="font-medium text-gray-800">{order.shipping_address?.phone_number}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Địa chỉ giao hàng
                        </h3>
                        <div className="space-y-1">
                            <p className="font-medium text-gray-800 text-base leading-relaxed">
                                {[
                                    order.shipping_address?.street_address,
                                    order.shipping_address?.ward?.name,
                                    order.shipping_address?.district?.name,
                                    order.shipping_address?.province?.name
                                ].filter(Boolean).join(', ')}
                            </p>
                            {order.shipping_address?.note && (
                                <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 italic">
                                    Note: {order.shipping_address.note}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Thanh toán
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Phương thức</span>
                                <span className="font-bold text-gray-800">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Trạng thái</span>
                                <span className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Order Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Box className="w-5 h-5 text-gray-500" /> Danh sách sản phẩm
                        </h3>
                        <span className="text-sm text-gray-500">{order.items?.length || 0} sản phẩm</span>
                    </div>
                    <div className="h-[300px] overflow-hidden">
                        <Table
                            columns={columns}
                            data={order.items || []}
                        />
                    </div>
                </div>

                {/* 3. Financial Summary */}
                <div className="flex justify-end">
                    <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tạm tính:</span>
                            <span className="font-medium">{formatCurrency(order.subtotal_amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Phí vận chuyển:</span>
                            <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm text-orange-600">
                                <span>Giảm giá:</span>
                                <span className="font-medium">-{formatCurrency(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                            <span className="text-base font-bold text-gray-800">Tổng cộng:</span>
                            <span className="text-xl font-bold text-[#1462B0]">{formatCurrency(order.grand_total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <ModalCustom
            isOpen={isOpen}
            onClose={onClose}
            modalSize="5xl"
            titleModal="" // Using custom header
            customHeader={renderCustomHeader()}
            bodyModal={renderModalBody()}
            className="!p-0" // Remove default padding for custom header to sit flush
        />
    );
};

export default ViewOrder;
