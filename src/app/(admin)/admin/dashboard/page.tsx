'use client'; // Bắt buộc: Vì Recharts render ở phía Client

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

// 1. Mock Data cho Biểu đồ (Doanh thu 7 ngày qua)
const revenueData = [
  { name: 'T2', total: 1500000 },
  { name: 'T3', total: 2300000 },
  { name: 'T4', total: 3200000 },
  { name: 'T5', total: 2100000 },
  { name: 'T6', total: 4500000 },
  { name: 'T7', total: 6800000 },
  { name: 'CN', total: 5400000 },
];

// 2. Mock Data cho Đơn hàng gần đây
const recentOrders = [
  { id: '#ORD-001', customer: 'Nguyễn Văn A', amount: 500000, status: 'Hoàn thành', date: '2023-10-25' },
  { id: '#ORD-002', customer: 'Trần Thị B', amount: 1200000, status: 'Đang xử lý', date: '2023-10-25' },
  { id: '#ORD-003', customer: 'Lê Văn C', amount: 850000, status: 'Đang giao', date: '2023-10-24' },
  { id: '#ORD-004', customer: 'Phạm Thị D', amount: 250000, status: 'Hủy', date: '2023-10-24' },
  { id: '#ORD-005', customer: 'Hoàng Văn E', amount: 3200000, status: 'Hoàn thành', date: '2023-10-23' },
];

// 3. Component Dashboard Chính
const DashboardPage = () => {
  
  // Helper format tiền tệ
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // Danh sách thẻ thống kê
  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '128.500.000₫',
      icon: DollarSign,
      trend: '+12.5%',
      isPositive: true,
      color: 'bg-blue-500',
    },
    {
      title: 'Đơn hàng',
      value: '452',
      icon: ShoppingBag,
      trend: '+8.2%',
      isPositive: true,
      color: 'bg-orange-500',
    },
    {
      title: 'Khách hàng',
      value: '1,203',
      icon: Users,
      trend: '-2.1%',
      isPositive: false, // Giảm
      color: 'bg-green-500',
    },
    {
      title: 'Sản phẩm active',
      value: '89',
      icon: Package,
      trend: '+5%',
      isPositive: true,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm">Tổng quan tình hình kinh doanh hôm nay.</p>
      </div>

      {/* 4. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white shadow-lg shadow-opacity-20`}>
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center text-sm font-semibold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isPositive ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 5. Chart Section (Chiếm 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Biểu đồ doanh thu (Tuần này)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Bar 
                  dataKey="total" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Recent Orders List (Chiếm 1/3) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Đơn hàng mới</h2>
            <button className="text-sm text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {order.customer.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800 dark:text-white">{formatCurrency(order.amount)}</p>
                  <span className={`
                    inline-block px-2 py-0.5 text-xs rounded-full font-medium mt-1
                    ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : ''}
                    ${order.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${order.status === 'Đang giao' ? 'bg-blue-100 text-blue-700' : ''}
                    ${order.status === 'Hủy' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;