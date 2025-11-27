'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  
  // State lưu dữ liệu nhập vào
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State thông báo lỗi
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Xóa lỗi khi người dùng gõ lại
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- LOGIC MOCK TÀI KHOẢN ---
    // Giả lập độ trễ mạng 1 giây cho giống thật
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { email, password } = formData;

    // 1. Kiểm tra trường hợp ADMIN
    if (email === 'admin@hoanggia.com' && password === '123456') {
      // Login vào Context
      login({ name: 'Super Admin', role: 'admin' });
      
      // Set Cookie để Middleware cho phép đi qua
      document.cookie = "user_role=ADMIN; path=/; max-age=3600";
      
      // Chuyển hướng
      router.push('/admin/dashboard');
    } 
    // 2. Kiểm tra trường hợp USER
    else if (email === 'user@gmail.com' && password === '123456') {
      login({ name: 'Khách hàng Juan', role: 'user' });
      document.cookie = "user_role=USER; path=/; max-age=3600";
      router.push('/');
    } 
    // 3. Sai tài khoản
    else {
      setError('Email hoặc mật khẩu không chính xác!');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Mock: admin@hoanggia.com / 123456
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-full border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-all"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;