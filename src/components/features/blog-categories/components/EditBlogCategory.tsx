import React, { useState, useEffect } from 'react';
import { ModalCustom } from '@/components/custom/modal-custom';
import { showToast } from '@/components/custom/custom-toast';

interface EditBlogCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
  categoryData: any;
  isViewMode?: boolean;
}

const EditBlogCategory: React.FC<EditBlogCategoryProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryData,
  isViewMode = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || '',
        slug: categoryData.slug || '',
        description: categoryData.description || '',
        sort_order: categoryData.sort_order || 0,
        is_active: categoryData.is_active ?? true,
      });
    }
  }, [categoryData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isViewMode) return;
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      showToast({ message: 'Vui lòng nhập tên và slug', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await onSave(categoryData._id, formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderBody = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên danh mục <span className="text-red-500">*</span></label>
        <input
          disabled={isViewMode}
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug (URL) <span className="text-red-500">*</span></label>
        <input
          disabled={isViewMode}
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          disabled={isViewMode}
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Thứ tự sắp xếp</label>
          <input
            disabled={isViewMode}
            type="number"
            name="sort_order"
            value={formData.sort_order}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
          />
        </div>
        <div className="flex items-center mt-6">
           <input
            disabled={isViewMode}
            id="is_active_edit"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
          />
          <label htmlFor="is_active_edit" className="ml-2 block text-sm text-gray-900">
            Kích hoạt
          </label>
        </div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        {isViewMode ? 'Đóng' : 'Hủy'}
      </button>
      {!isViewMode && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      )}
    </div>
  );

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      titleModal={isViewMode ? "Chi Tiết Danh Mục" : "Chỉnh Sửa Danh Mục"}
      bodyModal={renderBody()}
      footerModal={renderFooter()}
      modalSize="md"
    />
  );
};

export default EditBlogCategory;
