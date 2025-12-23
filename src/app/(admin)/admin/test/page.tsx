'use client';

import React, { useState } from 'react';
import { TableWithFilters } from '@/components/custom/table-with-filters';
import { Column } from '@/components/custom/table';

const TestPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [currentSearch, setCurrentSearch] = useState('');

    const tabs = [
        { value: 'all', label: 'Tất cả' },
        { value: 'warning', label: 'Sắp hết', count: 3 },
        { value: 'out_of_stock', label: 'Hết hàng', count: 1 }
    ];

    const mockData = [
        { id: 1, name: 'Sản phẩm A', stock: 100, status: 'AVAILABLE' },
        { id: 2, name: 'Sản phẩm B', stock: 5, status: 'WARNING' },
        { id: 3, name: 'Sản phẩm C', stock: 0, status: 'OUT_OF_STOCK' },
        { id: 4, name: 'Sản phẩm D', stock: 50, status: 'AVAILABLE' }
    ];

    const filteredData = mockData.filter(item => {
        if (activeTab === 'warning' && item.status !== 'WARNING') return false;
        if (activeTab === 'out_of_stock' && item.status !== 'OUT_OF_STOCK') return false;
        if (currentSearch && !item.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
        return true;
    });

    const columns: Column<typeof mockData[0]>[] = [
        { header: 'ID', accessor: 'id' as const },
        { header: 'Tên sản phẩm', accessor: 'name' as const },
        {
            header: 'Tồn kho',
            accessor: 'stock' as const,
            render: (item: any) => (
                <span className={item.stock < 10 ? 'text-red-500 font-bold' : ''}>{item.stock}</span>
            )
        },
        { header: 'Trạng thái', accessor: 'status' as const }
    ];

    return (
        <div className="w-full p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold mb-4">TableWithFilters Demo</h1>
                    <TableWithFilters
                        title="Hiệu quả sản phẩm"
                        description="Danh sách sản phẩm tham gia và tiến độ bán."
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onSearch={setCurrentSearch}
                        searchPlaceholder="Tìm kiếm sản phẩm..."
                        onFilterClick={() => alert('Filter Clicked')}
                        onAdd={() => alert('Add Clicked')}
                        data={filteredData}
                        columns={columns}
                        pagination={{
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: filteredData.length,
                            itemsPerPage: 10,
                            onPageChange: () => { }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TestPage;