import React from 'react';
import { Metadata } from 'next';

import OrderIndexPage from '@/components/features/orders/pages/order-index-page';

export const metadata: Metadata = {
    title: 'Quản lý Đơn hàng| Admin Dashboard',
    description: 'Trang quản lý đơn hàng.',
};

const OrderManagementPage = () => {
    return (
        <div className="w-full">
            <OrderIndexPage />
        </div>
    );
};

export default OrderManagementPage;