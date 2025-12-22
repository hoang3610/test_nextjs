'use client';

import React, { useState } from 'react';
import { TabsCustom, TabCustom, TabPanelCustom } from '@/components/custom/tab-custom';
import { User, Settings, Shield } from 'lucide-react';

const TestPage = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleChangeTab = (newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <div className="w-full p-8 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">TabCustom Demo</h1>
                    <p className="text-gray-600">Ví dụ về cách sử dụng component TabsCustom.</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <TabsCustom
                        value={currentTab}
                        onChange={handleChangeTab}
                        className="border-b border-gray-200 mb-4"
                    >
                        <TabCustom
                            label="Thông tin chung"
                            icon={<User size={18} />}
                            iconPosition="start"
                        />
                        <TabCustom
                            label="Cấu hình"
                            icon={<Settings size={18} />}
                            iconPosition="start"
                        />
                        <TabCustom
                            label="Bảo mật"
                            icon={<Shield size={18} />}
                            iconPosition="start"
                        />
                    </TabsCustom>

                    <TabPanelCustom value={currentTab} index={0}>
                        <div className="p-4 bg-gray-50 rounded border border-gray-100 min-h-[200px]">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tab 1: Thông tin chung</h3>
                            <p className="text-gray-600">Nội dung của tab thông tin chung...</p>
                        </div>
                    </TabPanelCustom>
                    <TabPanelCustom value={currentTab} index={1}>
                        <div className="p-4 bg-gray-50 rounded border border-gray-100 min-h-[200px]">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tab 2: Cấu hình</h3>
                            <p className="text-gray-600">Nội dung của tab cấu hình hệ thống...</p>
                        </div>
                    </TabPanelCustom>
                    <TabPanelCustom value={currentTab} index={2}>
                        <div className="p-4 bg-gray-50 rounded border border-gray-100 min-h-[200px]">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tab 3: Bảo mật</h3>
                            <p className="text-gray-600">Nội dung của tab bảo mật và quyền hạn...</p>
                        </div>
                    </TabPanelCustom>
                </div>
            </div>
        </div>
    );
};

export default TestPage;