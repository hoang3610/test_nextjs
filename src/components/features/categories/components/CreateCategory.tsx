'use client';

import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

// --- Imports ---
import { ModalCustom } from '../../../custom/modal-custom';
import { CategoryRequest } from '../models/request';
import ImageUploading, { ErrorsType, ImageListType } from 'react-images-uploading';
import { ButtonCustom } from '@/components/custom/button-custom';
import { showToast } from '@/components/custom/custom-toast';
import IconEdit from '@/components/icons/icon-edit';
import IconX from '@/components/icons/icon-x';
import ImageCustom from '@/components/custom/image-custom';

// --- Props Interface ---
interface CreateCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: CategoryRequest) => void;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ isOpen, onClose, onSave }) => {
  // --- State ---
  const [formData, setFormData] = useState<Partial<CategoryRequest>>({
    name: '',
    slug: '',
    is_active: true,
    description: '',
    image_url: '',
  });

  // --- Handlers ---
  const handleSaveClick = () => {
    // Basic validation
    if (!formData.name) {
      alert('Tên danh mục là bắt buộc');
      return;
    }

    const payload: CategoryRequest = {
      name: formData.name,
      slug: formData.slug || '', // server will generate if empty, but interface expects string
      is_active: formData.is_active || false,
      description: formData.description,
      image_url: formData.image_url
    };
    onSave(payload);
    onClose();
    // Reset form? Optional.
    setFormData({ name: '', slug: '', is_active: true, description: '', image_url: '' });
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

  const renderRowImageUploading = ({ labelName, required, value }: any) => {
    // value is string | undefined from formData.
    const images: ImageListType = value ? [{ data_url: value }] : [];

    const onChange = (imageList: ImageListType) => {
      // Extract the data_url to save back to string
      const newValue = imageList.length > 0 ? imageList[0].data_url : '';
      setFormData(prev => ({ ...prev, image_url: newValue }));
    };

    return (
      <div className="mt-4 w-full">
        <label className="text-base sm:text-sm font-bold sm:font-semibold text-gray-800 sm:text-gray-700 mb-2 block">
          {labelName} {required && <span className="text-red-500">*</span>}
        </label>
        <ImageUploading
          multiple={false}
          value={images}
          onChange={onChange}
          maxNumber={1}
          dataURLKey="data_url"
          acceptType={['jpg', 'png', 'jpeg', 'webp']}
          onError={(errors: ErrorsType) => {
            if (errors?.maxNumber) showToast({ message: "Chỉ được chọn tối đa 1 ảnh", type: "warning" });
            if (errors?.acceptType) showToast({ message: "Chỉ được phép tải lên ảnh", type: "warning" });
            if (errors?.maxFileSize) showToast({ message: "Dung lượng ảnh quá lớn", type: "warning" });
          }}
        >
          {({
            imageList,
            onImageUpload,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps,
          }) => (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-4">
                {imageList.map((image, index) => (
                  <div key={index} className="relative group w-24 h-24">
                    <div className="w-full h-full rounded-lg border border-gray-200 overflow-hidden bg-white">
                      <ImageCustom
                        isUser={false}
                        isLocal={!!image.data_url}
                        url={image.data_url || null}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="p-1 text-white hover:text-blue-300 transition-colors"
                        onClick={() => onImageUpdate(index)}
                        title="Thay đổi"
                      >
                        <IconEdit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-white hover:text-red-300 transition-colors"
                        onClick={() => onImageRemove(index)}
                        title="Xóa"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Button Placeholder */}
                {imageList.length < 1 && (
                  <div
                    className={`w-24 h-24 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    <Upload className="text-gray-400 w-6 h-6 mb-1" />
                    <span className="text-xs text-gray-600 font-medium">Tải ảnh</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </ImageUploading>
      </div>
    );
  };

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
                    value: values.image_url,
                    name: "image_url"
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
            font-size: 16px;
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
