import React from 'react';
import { Metadata } from 'next';

import GuestIndexPage from '@/components/features/guests/pages/guest-index-page';

export const metadata: Metadata = {
  title: 'Quản lý Khách hàng vãng lai| Admin Dashboard',
  description: 'Trang quản lý khách hàng .',
};

const GuestManagementPage = () => {
  return (
    <div className="w-full">
      <GuestIndexPage />
    </div>
  );
};

export default GuestManagementPage;