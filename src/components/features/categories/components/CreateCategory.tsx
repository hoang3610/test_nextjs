'use client';

import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

// --- Imports ---
import { ModalCustom } from '../../../custom/modal-custom';

// --- Interface ---
interface CategoryPayload {
  name: string;
  slug: string;
  is_active: boolean;
  description?: string;
  image?: string;
}

// --- Props Interface ---
interface CreateCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CategoryPayload) => void;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ isOpen, onClose, onSave }) => {
  // --- State ---
  const [formData, setFormData] = useState<Partial<CategoryPayload>>({
    name: '',
    slug: '',
    is_active: true,
    description: '',
    image: '',
  });

  // --- Handlers ---
  const handleSaveClick = () => {
    // Basic validation
    if (!formData.name) {
      alert('Tên danh mục là bắt buộc');
      return;
    }

    const payload: CategoryPayload = {
      name: formData.name,
      slug: formData.slug || '', // server will generate if empty, but interface expects string
      is_active: formData.is_active || false,
      description: formData.description,
      image: formData.image
    };
    onSave(payload);
    onClose();
    // Reset form? Optional.
    setFormData({ name: '', slug: '', is_active: true, description: '', image: '' });
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
      <div className="relative space-y-5 p-1 pr-2 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Info */}
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
                  required: false,
                  label: 'Slug (Mã danh mục)',
                  field: (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tự động tạo nếu để trống"
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
                    <div className="h-[38px] flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={values.is_active || false}
                        onChange={(e) => setFormData({ ...values, is_active: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Hoạt động</span>
                    </div>
                  ),
                })}
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  {renderRowImageUploading({
                    required: false,
                    labelName: "Hình ảnh",
                    value: values.image,
                    name: "image"
                  })}
                </div>
                <div className="lg:col-span-2">
                  {renderField({
                    label: 'Mô tả',
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
      modalSize="90%"
      bodyModal={renderModalBody()}
      footerModal={renderModalFooter()}
      centered
    />
  );
};

export default CreateCategory;
