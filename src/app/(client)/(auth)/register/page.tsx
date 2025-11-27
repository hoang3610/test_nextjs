'use client'; // 1. Bắt buộc: Vì có form handling và routing

import React, { useState } from 'react';
import Link from 'next/link';           // 2. Thay thế react-router-dom
import { useRouter } from 'next/navigation'; // 3. Hook điều hướng

const RegisterPage: React.FC = () => {
  const router = useRouter();
  
  // State quản lý form (Khuyên dùng để dễ validation)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cơ bản
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    // --- Gọi API Đăng ký tại đây ---
    console.log("Dữ liệu đăng ký:", formData);

    // Giả lập thành công -> Chuyển về trang login
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Hoặc{' '}
            <Link 
              href="/login" // Thay to="" bằng href=""
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              đăng nhập nếu bạn đã có tài khoản
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Họ và tên */}
            <div>
              <label htmlFor="fullname" className="sr-only">Họ và tên</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Họ và tên"
                onChange={handleChange}
              />
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email-address" className="sr-only">Địa chỉ email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Địa chỉ email"
                onChange={handleChange}
              />
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Mật khẩu"
                onChange={handleChange}
              />
            </div>
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="sr-only">Xác nhận mật khẩu</label>
              <input
                id="confirm-password"
                name="confirmPassword" // Lưu ý name trùng với state
                type="password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Xác nhận mật khẩu"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              className="group relative flex w-full justify-center rounded-full border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all shadow-lg shadow-blue-500/30"
            >
              Đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;