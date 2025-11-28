'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Settings, Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';

// --- Imports ---
import { ModalCustom } from '../../../custom/modal-custom';

// --- Interface ---
interface Product {
  id: string;
  name: string;
  price_original: number;
  category_id: number;
  product_type: number;
  is_app_visible: boolean;
  skus: {
    sku: string;
    dimension_length: number;
    dimension_width: number;
    dimension_height: number;
    weight: number;
  };
  images: string;
  images_mobile: string;
  short_description: string;
  brand?: string;
  stock?: number;
  status?: string;
}

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
interface CreateProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
}

const CreateProduct: React.FC<CreateProductProps> = ({ isOpen, onClose, onSave }) => {
  // --- State ---
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price_original: 0,
    category_id: 0,
    product_type: PRODUCT_TYPE.PHYSICAL,
    is_app_visible: false,
    skus: { sku: '', dimension_length: 0, dimension_width: 0, dimension_height: 0, weight: 0 },
    images: '',
    images_mobile: '',
    short_description: '',
  });

  // --- Handlers ---
  const handleSaveClick = () => {
    onSave(formData);
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
    <div className="mt-4">
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
          <div className="panel bg-white rounded-lg">
            <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Thông tin sản phẩm</label>
            <div className="grid grid-cols-1 gap-y-3 gap-x-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                {renderField({
                  required: true,
                  label: 'Tên sản phẩm',
                  field: (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập tên sản phẩm"
                      value={values.name || ''}
                      onChange={(e) => setFormData({ ...values, name: e.target.value })}
                    />
                  ),
                })}
              </div>
              <div className="lg:col-span-1">
                {renderField({
                  required: true,
                  label: 'Giá sản phẩm',
                  field: (
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Nhập giá sản phẩm"
                      value={values.price_original || 0}
                      onChange={(e) =>
                        setFormData({ ...values, price_original: Number(e.target.value) })
                      }
                    />
                  ),
                })}
              </div>
              <div className="lg:col-span-1">
                {renderField({
                  required: true,
                  label: 'Danh mục',
                  field: (
                    <select
                      className="form-select"
                      value={values.category_id || 0}
                      onChange={(e) => setFormData({ ...values, category_id: Number(e.target.value) })}
                    >
                      <option value={0} disabled>Chọn danh mục</option>
                      {dataCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ),
                })}
              </div>
              <div className="lg:col-span-1">
                {renderField({
                  required: true,
                  label: 'Loại sản phẩm',
                  field: (
                    <select
                      className="form-select bg-white"
                      value={values.product_type || 1}
                      onChange={(e) => setFormData({ ...values, product_type: Number(e.target.value) })}
                    >
                      {/* Sử dụng hằng số PRODUCT_TYPE đã định nghĩa */}
                      <option value={PRODUCT_TYPE.PHYSICAL}>Kéo tỉa</option>
                      <option value={PRODUCT_TYPE.COURSE}>Kéo cắt</option>
                      <option value={PRODUCT_TYPE.HITA}>HITA</option>
                    </select>
                  ),
                })}
              </div>
            </div>
             <div className="pt-2">
                {renderRowImageUploading({
                    required: true,
                    labelName: "Hình ảnh sản phẩm",
                    value: values.images,
                    name: "images"
                })}
                {renderRowImageUploading({
                    required: true,
                    labelName: "Hình ảnh hiển thị trên mobile",
                    value: values.images_mobile,
                    name: "images_mobile"
                })}
            </div>
          </div>
          {/* Right Column: Description */}
          <div className="panel bg-white rounded-lg flex flex-col h-full">
            <div className="flex flex-col gap-2 h-full">
              <div>
                <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Mô tả trên mobile</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col h-[500px]">
                  <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2 items-center">
                    <button className="p-1 hover:bg-gray-200 rounded"><Bold size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded"><Italic size={16} /></button>
                    {/* Other toolbar buttons */}
                  </div>
                  <textarea
                    className="flex-1 w-full p-4 outline-none resize-none"
                    placeholder="Nhập mô tả..."
                    value={values.short_description || ''}
                    onChange={(e) => setFormData({ ...values, short_description: e.target.value })}
                  />
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
        Tạo sản phẩm
      </button>
    </>
  );

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      titleModal="TẠO MỚI SẢN PHẨM"
      modalSize="90%"
      bodyModal={renderModalBody()}
      footerModal={renderModalFooter()}
      centered
    />
  );
};

export default CreateProduct;
