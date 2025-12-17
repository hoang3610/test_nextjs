'use client';

import React from 'react';
import { Plus } from 'lucide-react';

// --- Imports ---
import { Table, Column } from '@/components/custom/table';
import { ActionButtons } from '@/components/custom/action-button';
import { PromotionResponse } from '../models/response/promotion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- Props Interface ---
interface TablePromotionProps {
    promotions: PromotionResponse[];
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onCreate: () => void;
    // Actions are optional for now as requested
    onView?: (promotion: PromotionResponse) => void;
    onEdit?: (promotion: PromotionResponse) => void;
    onDelete?: (promotion: PromotionResponse) => void;
    onChangeStatus?: (promotion: PromotionResponse) => void;
}

const TablePromotion: React.FC<TablePromotionProps> = ({
    promotions = [],
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
    onCreate,
    onView,
    onEdit,
    onDelete,
    onChangeStatus
}) => {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'FINISHED': return 'bg-red-100 text-red-800';
            case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    // --- Columns ---
    const columns: Column<PromotionResponse>[] = [
        {
            header: 'Tên chiến dịch',
            className: 'min-w-[250px]',
            render: (item) => (
                <div className="flex items-center gap-3">
                    <img
                        src={item.thumbnail_url || 'https://placehold.co/40'}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover bg-gray-100"
                    />
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</p>}
                    </div>
                </div>
            ),
        },
        {
            header: 'Thời gian',
            className: 'min-w-[200px]',
            render: (item) => (
                <div className="flex flex-col gap-1 text-xs text-gray-600">
                    <div><span className="font-medium">Bắt đầu:</span> {format(new Date(item.start_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                    <div><span className="font-medium">Kết thúc:</span> {format(new Date(item.end_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
                </div>
            ),
        },
        {
            header: 'Trạng thái',
            className: 'min-w-[100px]',
            render: (item) => (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            ),
        },
        {
            header: 'Tự động',
            className: 'min-w-[80px] text-center',
            render: (item) => (
                <span className={`text-xs font-bold ${item.is_auto_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {item.is_auto_active ? 'Bật' : 'Tắt'}
                </span>
            ),
        },
        {
            header: 'Hành động',
            className: 'text-right w-[120px]',
            render: (item) => <ActionButtons
                onView={onView ? () => onView(item) : undefined}
                onEdit={onEdit ? () => onEdit(item) : undefined}
                onDelete={onDelete ? () => onDelete(item) : undefined}
            // onChangeStatus not directly supported by action button or needs modification? 
            // ActionButtons usually supports basic crud. keeping generic for now.
            />,
        },
    ];

    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans">
            <div className="flex flex-col h-full p-6 gap-6">
                <div className="shrink-0 flex justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Quản lý Chiến dịch</h2>
                    <button onClick={onCreate} className="bg-[#1462B0] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#104e8b] transition-colors">
                        <Plus size={18} /> Thêm chiến dịch
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    <Table<PromotionResponse>
                        columns={columns}
                        data={promotions}
                        pagination={{
                            currentPage,
                            totalPages: Math.ceil(totalItems / itemsPerPage),
                            totalItems: totalItems,
                            itemsPerPage,
                            onPageChange,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TablePromotion;
