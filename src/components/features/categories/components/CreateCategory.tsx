'use client';

import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

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
interface CreateCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CategoryPayload) => void;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ isOpen, onClose, onSave }) => {
  // --- State ---
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    code: '',
    is_app_visible: false,
    description: '',
    image: '',
  });

  // --- Handlers ---
  const handleSaveClick = () => {
    // Tạo payload để gửi đi, chuyển đổi boolean thành number
    const payload = {
      ...formData,
      is_app_visible: formData.is_app_visible ? 1 : 0,
    };
    onSave(payload);
    onClose(); // Close modal after saving
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

  const renderRowImageUploading = ({ labelName, required, value }: any) => (
    <div className="mt-0">
      <label className="text-sm font-semibold text-gray-700 mb-2 block">
        {labelName} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg bg-gray-50 border border-gray-300 flex items-center justify-center overflow-hidden relative group shrink-0">
          {value ? (
            <img src={value} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <Upload className="text-gray-300" size={24} />
          )}
        </div>
        <button className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 flex items-center gap-2 transition-colors">
          <Upload size={16} /> Tải ảnh lên
        </button>
      </div>
    </div>
  );

  // --- Render Modal Body ---
  const renderModalBody = useCallback(() => {
    const values = formData;
    return (
      <div className="relative space-y-5 p-1 pr-2">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Product Info */}
          <div className="panel bg-white rounded-lg col-span-2">
            <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Thông tin danh mục</label>
            <div className="grid grid-cols-1 gap-y-3 gap-x-4 lg:grid-cols-3">
              <div className="lg:col-span-1">
                {renderField({
                  required: true,
                  label: 'Tên danh mục',
                  field: (
                    <input
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
                  label: 'Mã danh mục',
                  field: (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập mã danh mục"
                      value={values.code || ''}
                      onChange={(e) => setFormData({ ...values, code: e.target.value })}
                    />
                  ),
                })}
              </div>
              <div className="lg:col-span-1">
                {renderField({
                  label: 'Hiển thị trên mobile',
                  field: (
                    <div className="h-[38px] flex items-center">
                      <input type="checkbox" className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked={values.is_app_visible || false} onChange={(e) => setFormData({ ...values, is_app_visible: e.target.checked })} />
                    </div>
                  ),
                })}
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  {renderRowImageUploading({
                    required: true,
                    labelName: "Hình ảnh",
                    value: values.image,
                    name: "image"
                  })}
                </div>
                <div className="lg:col-span-2">
                  {renderField({
                    label: 'Mô tả trên mobile',
                    field: (
                      <textarea
                        className="form-input h-24 resize-none"
                        placeholder="Nhập mô tả..."
                        value={values.description || ''}
                        onChange={(e) => setFormData({ ...values, description: e.target.value })}
                      />
                    ),
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .form-input, .form-select {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.15s ease-in-out;
          }
          .form-input:focus, .form-select:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
        `}</style>
      </div>
    );
  }, [formData, setFormData]);

  // --- Render Modal Footer ---
  const renderModalFooter = () => (
    <>
      <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors">
        Hủy bỏ
      </button>
      <button onClick={handleSaveClick} className="px-6 py-2 bg-[#1462B0] text-white font-medium rounded hover:bg-[#104e8b] transition-colors shadow-sm">
        Tạo danh mục
      </button>
    </>
  );

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      titleModal="TẠO MỚI DANH MỤC"
      modalSize="50%"
      bodyModal={renderModalBody()}
      footerModal={renderModalFooter()}
      centered
    />
  );
};

export default CreateCategory;
