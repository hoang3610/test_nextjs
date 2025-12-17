import React from 'react';
import { Metadata } from 'next';

import PromotionIndexPage from '@/components/features/promotions/pages/promotion-index-page';

export const metadata: Metadata = {
    title: 'Quản lý chiến dịch | Admin Dashboard',
    description: 'Trang quản lý danh sách chiến dịch',
};

const PromotionManagementPage = () => {
    return (
        <div className="w-full">
            <PromotionIndexPage />
        </div>
    );
};

export default PromotionManagementPage;