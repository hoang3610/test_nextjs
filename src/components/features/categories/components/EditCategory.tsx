'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Settings, Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';

// --- Imports ---
import { ModalCustom } from '../../../custom/modal-custom';
import { Category, CategoryPayload } from '../data/categories';

// --- Constants ---
const PRODUCT_TYPE = {
  PHYSICAL: 1,
  COURSE: 2,
  HITA: 3,
};

// --- Mock Data ---
// TODO: Thay thế bằng dữ liệu thật từ API
const dataCategories = [
  { id: 1, name: 'Điện tử' },
  { id: 2, name: 'Thời trang' },
  { id: 3, name: 'Nhà cửa' },
];
// --- Props Interface ---
interface EditCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CategoryPayload) => void;
  categoryData: Partial<Category> | null;
  isViewMode: boolean;
}

const EditCategory: React.FC<EditCategoryProps> = ({ isOpen, onClose, onSave, categoryData, isViewMode }) => {
  // --- State ---
  const [formData, setFormData] = useState<Partial<Category>>({});

  useEffect(() => {
    if (categoryData) {
      setFormData(categoryData);
    }
  }, [categoryData]);

  // --- Handlers ---
  const handleSaveClick = () => {
    const payload = {
      ...formData,
      is_active: formData.is_active || false,
    } as CategoryPayload;
    onSave(payload);
    onClose();
  };

  // --- Render Helpers ---
  const renderField = ({ label, required, field }: any) => (
    <div className="flex flex-col gap-1 mb-1">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {field}
    </div>
  );

  // --- Render Modal Body ---
  const renderModalBody = useCallback(() => {
    const values = formData;
    return (
      <div className="relative space-y-5 p-1 pr-2">
        <div className="panel bg-white rounded-lg col-span-2">
          <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Thông tin danh mục</label>
          <div className="grid grid-cols-1 gap-y-3 gap-x-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              {renderField({
                required: true,
                label: 'Tên danh mục',
                field: (
                  <input
                    disabled={isViewMode}
                    type="text"
                    className="form-input"
                    placeholder="Nhập tên danh mục"
                    value={values.name || ''}
                    onChange={(e) => setFormData({ ...values, name: e.target.value })}
                  />
                ),
              })}
            </div>
            <div className="lg:col-span-1">
              {renderField({
                required: true,
                label: 'Slug danh mục',
                field: (
                  <input
                    disabled={isViewMode}
                    type="text"
                    className="form-input"
                    placeholder="Nhập slug danh mục"
                    value={values.slug || ''}
                    onChange={(e) => setFormData({ ...values, slug: e.target.value })}
                  />
                ),
              })}
            </div>
            <div className="lg:col-span-1">
              {renderField({
                label: 'Trạng thái hoạt động',
                field: (
                  <div className="h-[38px] flex items-center">
                    <input disabled={isViewMode} type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked={values.is_active || false} onChange={(e) => setFormData({ ...values, is_active: e.target.checked })} />
                  </div>
                ),
              })}
            </div>
            <div className="lg:col-span-3">
              {renderField({
                label: 'Mô tả',
                field: (
                  <textarea
                    disabled={isViewMode}
                    className="form-input"
                    rows={4}
                    placeholder="Nhập mô tả..."
                    value={values.description || ''}
                    onChange={(e) => setFormData({ ...values, description: e.target.value })}
                  />
                ),
              })}
            </div>
          </div>
        </div>
        <style jsx>{`
          .form-input, .form-select {
            /* styles... */
          }
          .form-input:disabled, .form-select:disabled {
              background-color: #f8fafc;
              color: #94a3b8;
           }
        `}</style>
      </div>
    );
  }, [formData, isViewMode]);

  // --- Render Modal Footer ---
  const renderModalFooter = () => (
    <>
      <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors">
        Hủy bỏ
      </button>
      {!isViewMode && (
        <button onClick={handleSaveClick} className="px-6 py-2 bg-[#1462B0] text-white font-medium rounded hover:bg-[#104e8b] transition-colors shadow-sm">
          Lưu thay đổi
        </button>
      )}
    </>
  );

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      titleModal={isViewMode ? 'XEM CHI TIẾT DANH MỤC' : 'CHỈNH SỬA DANH MỤC'}
      modalSize="50%"
      bodyModal={renderModalBody()}
      footerModal={renderModalFooter()}
      centered
    />
  );
};

export default EditCategory;