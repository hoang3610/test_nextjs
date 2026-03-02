import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProductTabsProps {
  description: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ description }) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'policy'>('desc');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'desc', label: 'MÔ TẢ' },
    { id: 'info', label: 'THÔNG TIN BỔ SUNG' },
    { id: 'policy', label: 'CHÍNH SÁCH ĐỔI TRẢ' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'desc':
        return (
          <div className="text-gray-700 dark:text-gray-300">
             {description ? (
                 <div 
                    className="ql-editor"
                    dangerouslySetInnerHTML={{ __html: description }}
                    style={{ padding: 0 }}
                 />
             ) : (
                 <p className="italic text-gray-500">Chưa có mô tả cho sản phẩm này.</p>
             )}
          </div>
        );
      case 'info':
        return (
            <div className="text-gray-700 dark:text-gray-300">
                <p>Thông tin bổ sung đang cập nhật...</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Chất liệu: Thép không gỉ cao cấp</li>
                    <li>Xuất xứ: Chính hãng</li>
                    <li>Bảo hành: 12 tháng</li>
                </ul>
            </div>
        );
      case 'policy':
        return (
            <div className="text-gray-700 dark:text-gray-300">
                <p>Chính sách đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.</p>
                <p className="mt-2">Hotline hỗ trợ: 1900 xxxx</p>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tabs Header */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
                setActiveTab(tab.id as any);
                setIsExpanded(false); // Reset expand when switching tabs
            }}
            className={`px-6 py-4 text-sm font-bold uppercase transition-colors relative ${
              activeTab === tab.id
                ? 'text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
                <span className="absolute top-0 left-0 w-full h-0.5 bg-gray-500 dark:bg-white"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 relative">
          <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-none' : 'max-h-[300px]'}`}>
             {renderContent()}
          </div>
          
          {!isExpanded && activeTab === 'desc' && description && description.length > 500 && (
             <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent flex items-end justify-center pb-4">
             </div>
          )}
          
          {(activeTab === 'desc' && description && description.length > 300) && (
              <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 px-6 py-2 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition-colors font-medium text-sm"
                  >
                      {isExpanded ? (
                          <>Thu gọn <ChevronUp size={16}/></>
                      ) : (
                          <>Xem thêm <ChevronDown size={16}/></>
                      )}
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default ProductTabs;
