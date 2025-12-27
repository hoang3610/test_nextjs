'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';

const LoginPage: React.FC = () => {
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
    setError('');

    const { email, password } = formData;

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      setIsLoading(false);
      return;
    }

    try {
      // Gọi hàm signIn của NextAuth
      const result = await signIn('credentials', {
        redirect: false, // Không tự động chuyển trang để mình handle lỗi
        email,
        password
      });

      if (result?.error) {
        // Đăng nhập thất bại
        setError('Email hoặc mật khẩu không chính xác!');
        setIsLoading(false);
      } else {
        // Đăng nhập thành công
        console.log("Login successfully:", result);

        // Fetch session mới nhất để check Role
        const session = await getSession();

        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }

        router.refresh();
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra, vui lòng thử lại sau');
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
            Đăng nhập tài khoản của bạn
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