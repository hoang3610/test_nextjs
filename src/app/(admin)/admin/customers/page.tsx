import React from 'react';
import { Metadata } from 'next';

import CustomerIndexPage from '@/components/features/customers/pages/customer-index-page';

export const metadata: Metadata = {
    title: 'Quản lý Khách hàng vãng lai| Admin Dashboard',
    description: 'Trang quản lý khách hàng .',
};

const CustomerManagementPage = () => {
    return (
        <div className="w-full">
            <CustomerIndexPage />
        </div>
    );
};

export default CustomerManagementPage;