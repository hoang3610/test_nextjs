import React, { useState } from 'react';
import { ModalCustom } from '@/components/custom/modal-custom';
import { showToast } from '@/components/custom/custom-toast';

interface CreateBlogCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const CreateBlogCategory: React.FC<CreateBlogCategoryProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD') // Remove accents
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    
    setFormData((prev) => ({ ...prev, name, slug: slug })); // Auto set slug logic can be improved but this is basic
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await onSave(formData);
      // Reset form on success
      setFormData({
        name: '',
        slug: '',
        description: '',
        sort_order: 0,
        is_active: true,
      });
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
          type="text"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          placeholder="Nhập tên danh mục..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug (URL) <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          placeholder="tu-dong-tao-tu-ten"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          placeholder="Mô tả ngắn..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Thứ tự sắp xếp</label>
          <input
            type="number"
            name="sort_order"
            value={formData.sort_order}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
          />
        </div>
        <div className="flex items-center mt-6">
           <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
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
        Hủy
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Đang lưu...' : 'Tạo mới'}
      </button>
    </div>
  );

  return (
    <ModalCustom
      isOpen={isOpen}
      onClose={onClose}
      titleModal="Tạo Danh Mục Blog Mới"
      bodyModal={renderBody()}
      footerModal={renderFooter()}
      modalSize="md"
    />
  );
};

export default CreateBlogCategory;
