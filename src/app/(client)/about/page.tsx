import React from 'react';
import Image from 'next/image'; // 1. Import component Image
import { Metadata } from 'next';

// 2. Thêm Metadata cho SEO (Thay thế thẻ <Helmet> bên React thường)
export const metadata: Metadata = {
  title: 'Về Chúng Tôi | KeoHoangGia Shop',
  description: 'Câu chuyện hình thành và đội ngũ phát triển của KeoHoangGia Shop.',
};

// --- Mock Data (Giữ nguyên) ---
const teamMembers = [
  {
    name: 'Hoàng Văn',
    role: 'Founder & CEO',
    imageUrl: 'https://picsum.photos/id/1005/400/400',
    bio: 'Với niềm đam mê thời trang và công nghệ, Hoàng đã sáng lập KeoHoangGia...',
  },
  {
    name: 'Nguyễn Thị B',
    role: 'Trưởng phòng Marketing',
    imageUrl: 'https://picsum.photos/id/1011/400/400',
    bio: 'Chuyên gia xây dựng thương hiệu và kết nối với khách hàng...',
  },
  {
    name: 'Trần Văn C',
    role: 'Trưởng phòng Sản phẩm',
    imageUrl: 'https://picsum.photos/id/1025/400/400',
    bio: 'Luôn tìm kiếm và phát triển những sản phẩm độc đáo...',
  },
];

// 3. Đây là Server Component mặc định (Không cần 'use client' vì không có state/hook)
const AboutPage = () => {
  return (
    <div className="py-12 dark:bg-gray-900 container mx-auto px-4">
      {/* --- 1. Hero Section --- */}
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Về Chúng Tôi
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          Hành trình tạo nên phong cách và chất lượng tại KeoHoangGia Shop.
        </p>
      </div>

      {/* --- 2. Our Story Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Câu chuyện của chúng tôi</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            KeoHoangGia Shop được thành lập từ năm 2020 với một mục tiêu đơn giản...
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Từ những ngày đầu tiên, chúng tôi đã không ngừng nỗ lực...
          </p>
        </div>
        <div className="order-1 md:order-2 relative h-64 md:h-96 w-full">
          {/* Thay img bằng Image */}
          <Image 
            src="https://picsum.photos/id/145/800/600" 
            alt="Our Story" 
            fill // Tự động fill đầy thẻ cha (cần thẻ cha có relative)
            className="rounded-lg shadow-xl object-cover"
            sizes="(max-width: 768px) 100vw, 50vw" // Giúp load ảnh đúng kích thước thiết bị
          />
        </div>
      </div>

      {/* --- 3. Meet Our Team Section --- */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Gặp gỡ đội ngũ</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Những con người làm nên thành công của KeoHoangGia.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
              {/* Thay img bằng Image */}
              <div className="relative w-32 h-32 mb-4">
                <Image 
                  src={member.imageUrl} 
                  alt={member.name} 
                  fill
                  className="rounded-full object-cover"
                  sizes="128px"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{member.role}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- 4. Our Values Section (Giữ nguyên SVG) --- */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Giá trị cốt lõi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* ... (Phần SVG icon giữ nguyên code cũ vì nó là vector, không cần sửa) ... */}
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Chất lượng</h3>
                <p className="text-gray-600 dark:text-gray-300">Cam kết sản phẩm đạt tiêu chuẩn cao nhất.</p>
            </div>
            {/* Các items khác tương tự */}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;