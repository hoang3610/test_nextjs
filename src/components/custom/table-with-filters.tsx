import React, { ReactNode } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Table, Column } from './table';

interface TabItem {
    value: string;
    label: string;
    color?: string; // Optional class for specialized styling
    count?: number;
}

interface TableWithFiltersProps<T> {
    title: string;
    description?: string;

    // Tabs
    tabs?: TabItem[];
    activeTab?: string;
    onTabChange?: (value: string) => void;

    // Search & Filter
    onSearch?: (value: string) => void;
    searchPlaceholder?: string;
    onFilterClick?: () => void;

    // Actions
    onAdd?: () => void;
    addText?: string;
    addIcon?: ReactNode;

    // Data
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        onPageChange: (page: number) => void;
    };

    // Empty State
    emptyState?: ReactNode;
}

export function TableWithFilters<T extends { id?: string | number, _id?: string }>({
    title,
    description,
    tabs = [],
    activeTab,
    onTabChange,
    onSearch,
    searchPlaceholder = "Tìm kiếm...",
    onFilterClick,
    onAdd,
    addText = "Thêm mới",
    addIcon = <Plus size={16} />,
    data,
    columns,
    isLoading = false,
    pagination,
    emptyState
}: TableWithFiltersProps<T>) {

    const hasData = data && data.length > 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            {/* --- HEADER --- */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-gray-800">{title}</h3>
                    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                </div>

                {tabs.length > 0 && (
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.value;
                            // Default styling for active/inactive
                            const activeClass = "bg-white text-gray-800 shadow-sm";
                            const inactiveClass = "text-gray-500 hover:text-gray-700";

                            // If specific color logic is needed it can be injected via tab.color (not fully implemented here as typically needs specific context)
                            // For now using user's simple style

                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => onTabChange?.(tab.value)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${isActive ? activeClass : inactiveClass}`}
                                >
                                    {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-70">({tab.count})</span>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- BODY --- */}
            {!hasData && !isLoading ? (
                <div className="flex-1 flex flex-col justify-center items-center p-8 text-center">
                    {emptyState || (
                        <div className="text-gray-500">
                            <p>Không có dữ liệu</p>
                            {onAdd && (
                                <button onClick={onAdd} className="mt-4 text-blue-600 hover:underline text-sm opacity-50">
                                    Thêm mới ngay
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                onChange={(e) => onSearch?.(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1890ff] transition-shadow bg-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            {onFilterClick && (
                                <button
                                    onClick={onFilterClick}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Filter size={16} /> <span className="hidden sm:inline">Lọc</span>
                                </button>
                            )}

                            {onAdd && (
                                <button
                                    onClick={onAdd}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-[#1890ff] text-[#1890ff] rounded-md text-sm font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
                                >
                                    {addIcon} {addText}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <Table
                            columns={columns}
                            data={data}
                            pagination={pagination}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
