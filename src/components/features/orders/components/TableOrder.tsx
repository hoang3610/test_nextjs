'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { Table, Column } from '@/components/custom/table';
import { ActionButtons } from '@/components/custom/action-button';
import { OrderResponse } from '../models/response/order';

interface TableOrderProps {
    orders: OrderResponse[];
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    // placeholders for future actions
    onView?: (order: OrderResponse) => void;
    onEdit?: (order: OrderResponse) => void;
    onDelete?: (order: OrderResponse) => void;
}

const TableOrder: React.FC<TableOrderProps> = ({
    orders = [],
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
    onView,
    onEdit,
    onDelete
}) => {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED':
            case 'REFUNDED': return 'bg-red-100 text-red-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PROCESSING':
            case 'SHIPPING': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-600 font-bold';
            case 'FAILED': return 'text-red-600 font-bold';
            default: return 'text-gray-500';
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    const columns: Column<OrderResponse>[] = [
        {
            header: 'STT',
            className: 'w-[50px] text-center',
            render: (order: OrderResponse, index: number) => (
                <div className="text-gray-500 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                </div>
            )
        },
        {
            header: 'Mã đơn hàng',
            className: 'min-w-[150px]',
            render: (order) => (
                <div className="font-semibold text-gray-800">{order.order_code}</div>
            )
        },
        {
            header: 'Khách hàng',
            className: 'min-w-[200px]',
            render: (order) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium text-gray-700">{order.shipping_address?.full_name}</span>
                    <span className="text-gray-500 text-xs">{order.shipping_address?.phone_number}</span>
                </div>
            )
        },
        {
            header: 'Trạng thái',
            className: 'min-w-[120px]',
            render: (order) => (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
            )
        },
        {
            header: 'Thanh toán',
            className: 'min-w-[120px]',
            render: (order) => (
                <div className="flex flex-col text-xs">
                    <span className="font-medium">{order.payment_method}</span>
                    <span className={getPaymentStatusColor(order.payment_status)}>{order.payment_status}</span>
                </div>
            )
        },
        {
            header: 'Tổng tiền',
            className: 'min-w-[120px]',
            render: (order) => (
                <div className="font-bold text-[#1462B0] text-sm">
                    {formatCurrency(order.grand_total)}
                </div>
            )
        },
        {
            header: 'Ngày tạo',
            className: 'min-w-[150px]',
            render: (order) => (
                <div className="text-sm text-gray-600">
                    {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </div>
            )
        },
        {
            header: 'Hành động',
            className: 'text-right w-[100px]',
            render: (order) => <ActionButtons
                className="justify-center"
                onView={onView ? () => onView(order) : undefined}
            // onEdit={onEdit ? () => onEdit(order) : undefined} 
            // onDelete={onDelete ? () => onDelete(order) : undefined}
            />
        }
    ];

    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans">
            <div className="flex flex-col h-full p-6 gap-6">
                <div className="shrink-0 flex justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Quản lý Đơn hàng</h2>
                    {/* Placeholder for 'Create Order' button if needed later */}
                    {/* <button className="bg-[#1462B0] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#104e8b] transition-colors">
                        <Plus size={18} /> Tạo đơn hàng
                     </button> */}
                </div>
                <div className="flex-1 min-h-0">
                    <Table<OrderResponse>
                        columns={columns}
                        data={orders}
                        pagination={{
                            currentPage,
                            totalPages: Math.ceil(totalItems / itemsPerPage) || 1,
                            totalItems: totalItems,
                            itemsPerPage,
                            onPageChange,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default TableOrder;
