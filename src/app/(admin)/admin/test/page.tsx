'use client';

import { Table, Column } from '@/components/custom/table';
import { Plus, Filter } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

const MOCK_USERS: User[] = [
    { id: 1, name: 'Nguyen Van A', email: 'vana@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Tran Thi B', email: 'thib@example.com', role: 'User', status: 'Inactive' },
    { id: 3, name: 'Le Van C', email: 'vanc@example.com', role: 'Editor', status: 'Active' },
    { id: 4, name: 'Pham Thi D', email: 'thid@example.com', role: 'User', status: 'Active' },
    { id: 5, name: 'Hoang Van E', email: 'vane@example.com', role: 'User', status: 'Inactive' },
];

const TestPage = () => {
    const columns: Column<User>[] = [
        { header: 'ID', accessor: 'id', className: 'w-16 text-center' },
        { header: 'Họ và tên', accessor: 'name', className: 'font-medium' },
        { header: 'Email', accessor: 'email', className: 'text-gray-500' },
        {
            header: 'Vai trò',
            accessor: 'role',
            render: (item) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.role}
                </span>
            )
        },
        {
            header: 'Trạng thái',
            accessor: 'status',
            render: (item) => (
                <span className={`flex items-center gap-1.5 text-sm ${item.status === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {item.status}
                </span>
            )
        },
    ];

    const renderCustomHeader = () => (
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-bold text-gray-800">Danh sách thành viên</h3>
                <p className="text-sm text-gray-500">Quản lý thành viên và phân quyền</p>
            </div>
        </div>
    );

    return (
        <div className="w-full p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Demo Table Header</h1>
                    <p className="text-gray-600">Ví dụ về cách sử dụng props <code>customHeader</code> trong component Table.</p>
                </div>

                <div className="h-[500px]">
                    <Table
                        data={MOCK_USERS}
                        columns={columns}
                        customHeader={renderCustomHeader()}
                        pagination={{
                            currentPage: 1,
                            totalPages: 1,
                            totalItems: 5,
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