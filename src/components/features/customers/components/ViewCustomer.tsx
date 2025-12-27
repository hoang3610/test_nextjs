'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, User, Phone, Mail, MapPin, ShoppingBag, Calendar, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- Imports ---
import { ModalCustom } from '@/components/custom/modal-custom';
import { showToast } from '@/components/custom/custom-toast';
import { CustomerResponse } from './TableCustomer';

// Extend CustomerResponse to include orders for detail view
interface CustomerDetailResponse extends CustomerResponse {
    orders?: any[]; // orders from populate
    note?: string; // User might have bio or note
}

interface ViewCustomerProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string | null;
}

const ViewCustomer: React.FC<ViewCustomerProps> = ({ isOpen, onClose, customerId }) => {
    const [customer, setCustomer] = useState<CustomerDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        if (isOpen && customerId) {
            const fetchCustomer = async () => {
                setIsLoading(true);
                try {
                    // Assuming api/users/[id]/detail exists and returns { success, data: user }
                    const res = await fetch(`/api/users/${customerId}/detail`);
                    const data = await res.json();
                    if (data.success) {
                        setCustomer(data.data);
                    } else {
                        showToast({ message: "Không tìm thấy thông tin", type: "error" });
                    }
                } catch (error) {
                    console.error("Error fetching customer:", error);
                    showToast({ message: "Lỗi kết nối", type: "error" });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCustomer();
        } else {
            setCustomer(null);
        }
    }, [isOpen, customerId]);

    // --- Stats Calculation ---
    const stats = useMemo(() => {
        if (!customer) return [];

        const orders = customer.orders || [];
        const orderCount = orders.length;
        const lastOrder = orders.length > 0 ? orders[0] : null; // Assuming sorted descending or check dates

        return [
            {
                title: 'Tổng đơn hàng',
                value: orderCount.toString(),
                icon: ShoppingBag,
                color: 'bg-blue-500',
                meta: 'Đơn hàng thành công'
            },
            {
                title: 'Lần mua cuối',
                value: lastOrder ? format(new Date(lastOrder.createdAt), 'dd/MM/yyyy') : 'N/A',
                icon: Clock,
                color: 'bg-purple-500',
                meta: lastOrder ? format(new Date(lastOrder.createdAt), 'HH:mm') : ''
            },
            {
                title: 'Tham gia từ',
                value: customer.createdAt ? format(new Date(customer.createdAt), 'dd/MM/yyyy') : 'N/A',
                icon: Calendar,
                color: 'bg-orange-500',
                meta: 'Ngày tạo'
            }
        ];
    }, [customer]);


    // --- Custom Header ---
    const renderCustomHeader = () => {
        return (
            <div className="bg-white border-b border-gray-200 flex-shrink-0 z-10 w-full rounded-t-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-6 sm:py-4 gap-3 sm:gap-4">
                    {/* Left Section: Title & Badge */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-1">
                                {customer?.full_name || 'Đang tải...'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {customer?.phone_number || customer?.email || ''}
                            </p>
                        </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    // --- Modal Body ---
    const renderBody = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-[300px]">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500">Đang tải thông tin...</p>
                </div>
            )
        }
        if (!customer) return <div className="p-8 text-center text-gray-500">Không có dữ liệu.</div>;

        return (
            <div className="p-4 sm:p-6 space-y-6 bg-gray-50/50 min-h-[400px]">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-2.5 rounded-lg text-white shadow-sm`}>
                                    <stat.icon size={18} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                                <h3 className="text-lg font-bold text-gray-800">{stat.value}</h3>
                                {stat.meta && <p className="text-xs text-gray-400 mt-1">{stat.meta}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 bg-gray-50 rounded-bl-xl border-l border-b border-gray-100">
                            <User className="text-gray-300 transform rotate-12" size={40} />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                            Thông tin liên hệ
                        </h4>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-start gap-3">
                                <Phone size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Số điện thoại</p>
                                    <p className="text-gray-700 font-mono font-medium">{customer.phone_number || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={18} className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Email</p>
                                    <p className="text-gray-700">{customer.email || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                            {/* Addresses List (if many) or just main Note */}
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5"><span className="text-lg">📝</span></div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold">Ghi chú (Bio)</p>
                                    <p className="text-gray-700 italic text-sm">{customer.note || 'Không có ghi chú'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-blue-600" />
                            Sổ địa chỉ ({customer.addresses?.length || 0})
                        </h4>
                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {customer.addresses?.map((addr, idx) => (
                                <div key={idx} className="group p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-all">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-gray-200">
                                            {addr.type || 'Khác'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                        {[
                                            addr.street_address,
                                            addr.ward?.name,
                                            addr.district?.name,
                                            addr.province?.name
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            ))}
                            {(!customer.addresses || customer.addresses.length === 0) && (
                                <div className="text-center py-8 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-lg">
                                    Chưa có địa chỉ nào được lưu
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderFooter = () => (
        <div className="flex gap-2 w-full justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition-colors">
                Đóng
            </button>
        </div>
    );

    return (
        <ModalCustom
            isOpen={isOpen}
            onClose={onClose}
            titleModal="" // Using custom header
            customHeader={renderCustomHeader()}
            bodyModal={renderBody()}
            footerModal={renderFooter()}
            modalSize="4xl"
            className="!p-0"
        />
    );
};

export default ViewCustomer;
