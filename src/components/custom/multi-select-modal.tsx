import React, { useState, useEffect } from 'react';
import { X, Search, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
    header: string;
    accessor: (item: T) => React.ReactNode;
    className?: string; // Tailwind classes for width, alignment (e.g., 'text-right', 'w-20')
}

interface MultiSelectModalProps<T extends { id: number | string }> {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedIds: (number | string)[]) => void;
    data: T[];
    initialSelectedIds?: (number | string)[];
    title?: string;
    description?: string;
    columns: Column<T>[];
    searchKeys?: (keyof T)[]; // Keys to search in (e.g., ['name', 'sku'])

    // Pagination (Optional)
    page?: number;
    totalPage?: number;
    onPageChange?: (page: number) => void;
    onSearch?: (term: string) => void; // Async search callback
}

export const MultiSelectModal = <T extends { id: number | string }>({
    isOpen,
    onClose,
    onConfirm,
    data,
    initialSelectedIds = [],
    title = "Chọn danh sách",
    description = "Tìm kiếm và chọn các mục bên dưới",
    columns,
    searchKeys = [],
    page,
    totalPage,
    onPageChange,
    onSearch
}: MultiSelectModalProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedIds, setTempSelectedIds] = useState<(number | string)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setTempSelectedIds(initialSelectedIds);
            setSearchTerm(''); // Reset search on open
        }
    }, [isOpen, initialSelectedIds]);

    // Handle Search
    useEffect(() => {
        if (isOpen && onSearch) {
            // Debounce logic could be added here, but keeping it simple for now
            const timer = setTimeout(() => {
                onSearch(searchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, onSearch, isOpen]);

    // Determine filtered data
    // If onSearch is provided, we assume parent handles filtering via data prop updates
    // If not, we filter client-side
    const filteredData = onSearch ? data : data.filter(item => {
        if (searchTerm.trim() === '') return true;
        if (searchKeys.length === 0) return true;

        const lowerTerm = searchTerm.toLowerCase();
        return searchKeys.some(key => {
            const value = item[key];
            return String(value).toLowerCase().includes(lowerTerm);
        });
    });

    // Check if all filtered items are selected
    const areAllSelected = filteredData.length > 0 && filteredData.every(item => tempSelectedIds.includes(item.id));

    const toggleSelect = (id: number | string) => {
        setTempSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (areAllSelected) {
            // Deselect all filtered items
            const filteredIds = filteredData.map(item => item.id);
            setTempSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            // Select all filtered items
            const filteredIds = filteredData.map(item => item.id);
            setTempSelectedIds(prev => {
                const uniqueIds = new Set([...prev, ...filteredIds]);
                return Array.from(uniqueIds);
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-3xl h-[80vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                        <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* Search Toolbar */}
                <div className="p-4 border-b border-gray-100 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1890ff] transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center px-3 bg-blue-50 text-[#1890ff] rounded-md text-xs font-medium border border-blue-100 whitespace-nowrap">
                        Đã chọn: {tempSelectedIds.length}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-semibold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3 w-12 text-center cursor-pointer" onClick={toggleSelectAll}>
                                    <div className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-colors ${areAllSelected ? 'bg-[#1890ff] border-[#1890ff]' : 'border-gray-300 bg-white hover:border-[#1890ff]'}`}>
                                        {areAllSelected && <Check size={12} className="text-white" />}
                                    </div>
                                </th>
                                {columns.map((col, idx) => (
                                    <th key={idx} className={`px-6 py-3 ${col.className || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="py-12 text-center text-gray-400">
                                        Không tìm thấy dữ liệu phù hợp
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(item => {
                                    const isSelected = tempSelectedIds.includes(item.id);
                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => toggleSelect(item.id)}
                                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <div className={`w-5 h-5 rounded border mx-auto flex items-center justify-center transition-colors ${isSelected ? 'bg-[#1890ff] border-[#1890ff]' : 'border-gray-300 bg-white'}`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                            </td>
                                            {columns.map((col, idx) => (
                                                <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                                                    {col.accessor(item)}
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/30">
                    {/* Pagination Controls */}
                    {page && totalPage && onPageChange ? (
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => onPageChange(page - 1)}
                                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-xs font-medium text-gray-600">
                                Trang {page} / {totalPage}
                            </span>
                            <button
                                disabled={page >= totalPage}
                                onClick={() => onPageChange(page + 1)}
                                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    ) : <div />}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            disabled={tempSelectedIds.length === 0}
                            onClick={() => {
                                onConfirm(tempSelectedIds);
                                onClose();
                            }}
                            className={`px-6 py-2 font-medium rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1462B0]
                                ${tempSelectedIds.length === 0
                                    ? 'bg-gray-300 text-white cursor-not-allowed'
                                    : 'bg-[#1462B0] text-white hover:bg-[#104e8b]'}
                            `}
                        >
                            Xác nhận thêm ({tempSelectedIds.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
