"use client"

import React from 'react';
// Import Header/Footer từ thư mục bạn vừa copy
// (Lưu ý: Dấu @ đại diện cho thư mục src/)
import Header from '@/components/layout/client/Header'; 
import Footer from '@/components/layout/client/Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    // Dùng flex-col và min-h-screen để Footer luôn nằm dưới cùng
    // kể cả khi nội dung trang quá ngắn
    <div className="flex min-h-screen flex-col">
      
      {/* Header (Cố định hoặc cuộn theo tùy logic trong component Header) */}
      <Header />

      {/* Main Content: flex-1 để chiếm toàn bộ khoảng trống còn lại */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {children} 
        {/* LƯU Ý QUAN TRỌNG: children chính là nội dung của page.tsx */}
      </main>

      {/* Footer */}
      <Footer />
      
    </div>
  );
}