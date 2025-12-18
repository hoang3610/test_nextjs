import React from 'react';
import { Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    className?: string; // Tailwind classes
    render?: (item: T) => React.ReactNode;
}

interface SelectedItemsTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRemove: (item: T) => void;
    onAdd: () => void;

    // Customization
    title?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    searchPlaceholder?: string;

    // Mobile Render
    mobileRowRender?: (item: T, onRemove: (item: T) => void) => React.ReactNode;

    // Optional Key for React List Keys (default to 'id')
    keyField?: keyof T;
}

export const SelectedItemsTable = <T extends Record<string, any>>({
    data,
    columns,
    onRemove,
    onAdd,
    title = "Đã chọn",
    emptyTitle = "Chưa có mục nào",
    emptyDescription = "Vui lòng chọn từ danh sách để tiếp tục.",
    searchPlaceholder = "Tìm kiếm trong danh sách đã chọn...",
    mobileRowRender,
    keyField = "id"
}: SelectedItemsTableProps<T>) => {

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 gap-3">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">{title}</span>
                        <span className="bg-blue-100 text-[#1890ff] px-2 py-0.5 rounded-full text-xs font-bold">{data.length}</span>
                    </div>

                    <Button
                        variant="secondary"
                        className="h-9 px-3 text-xs border border-[#1890ff] text-[#1890ff] hover:bg-blue-50"
                        onClick={onAdd}
                    >
                        <Plus size={16} className="mr-2" />
                        Chọn từ danh sách
                    </Button>
                </div>

                <div className="relative w-full sm:w-72 mt-2 sm:mt-0 opacity-50 pointer-events-none">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input disabled type="text" placeholder={searchPlaceholder} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-gray-50" />
                </div>
            </div>

            {/* EMPTY STATE */}
            {data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-white">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-gray-800 font-medium mb-1">{emptyTitle}</h3>
                    <p className="text-gray-500 text-sm mb-4">{emptyDescription}</p>
                    <Button
                        onClick={onAdd}
                        className="px-6 py-2 bg-[#1462B0] text-white font-medium rounded hover:bg-[#104e8b] transition-colors shadow-sm"
                    >
                        Mở danh sách
                    </Button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold sticky top-0 z-10">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className={`px-6 py-3 ${col.className || ''}`}>
                                            {col.header}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm bg-white">
                                {data.map((item, idx) => (
                                    <tr key={String(item[keyField] || idx)} className="hover:bg-gray-50 group transition-colors">
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                                                {col.render ? col.render(item) : (col.accessor ? item[col.accessor] : '')}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => onRemove(item)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="block sm:hidden p-2 space-y-2 bg-gray-100 flex-1 overflow-y-auto">
                        {data.map((item, idx) => (
                            <React.Fragment key={String(item[keyField] || idx)}>
                                {mobileRowRender ? mobileRowRender(item, onRemove) : (
                                    // Fallback simple render if no mobileRowRender provided
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center relative">
                                        <span className="text-sm font-medium text-gray-700 truncate pr-8">
                                            Item #{String(item[keyField])}
                                        </span>
                                        <button
                                            onClick={() => onRemove(item)}
                                            className="p-1.5 text-gray-300 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
