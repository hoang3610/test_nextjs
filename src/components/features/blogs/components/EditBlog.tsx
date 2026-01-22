import React, { useState, useEffect } from 'react';
import { ModalCustom } from '@/components/custom/modal-custom';
import { showToast } from '@/components/custom/custom-toast';
import BlogEditor from './BlogEditor';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { Upload, X } from 'lucide-react';
import { uploadImageClient } from '@/lib/cloudinary-client';

interface EditBlogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
  blogData: any;
  categories: any[];
  isViewMode?: boolean;
}

const EditBlog: React.FC<EditBlogProps> = ({
  isOpen,
  onClose,
  onSave,
  blogData,
  categories,
  isViewMode = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    status: 'PUBLISHED',
    is_featured: false,
    thumbnail_url: '',
  });

  const [images, setImages] = useState<ImageListType>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blogData) {
      setFormData({
        title: blogData.title || '',
        slug: blogData.slug || '',
        excerpt: blogData.excerpt || '',
        content: blogData.content || '',
        category_id: blogData.category?._id || blogData.category || '',
        status: blogData.status || 'PUBLISHED',
        is_featured: blogData.is_featured || false,
        thumbnail_url: blogData.thumbnail_url || '',
      });

      if (blogData.thumbnail_url) {
        setImages([{ data_url: blogData.thumbnail_url }]);
      } else {
        setImages([]);
      }
    }
  }, [blogData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isViewMode) return;
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleEditorChange = (content: string) => {
    if (isViewMode) return;
    setFormData(prev => ({ ...prev, content }));
  };

  const onImageChange = (imageList: ImageListType) => {
    if (isViewMode) return;
    setImages(imageList);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.category_id) {
      showToast({ message: 'Vui lòng nhập tiêu đề, slug và chọn danh mục', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      let thumbnail_url = formData.thumbnail_url;
      // Upload new image if changed and new one is data url
      if (images.length > 0 && images[0].data_url && images[0].data_url.startsWith('data:')) {
         thumbnail_url = await uploadImageClient(images[0].data_url);
      } else if (images.length === 0) {
        thumbnail_url = '';
      }

      await onSave(blogData._id, {
        ...formData,
        thumbnail_url,
      });

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderBody = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề <span className="text-red-500">*</span></label>
                <input
                disabled={isViewMode}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Slug <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-medium text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                <select
                    disabled={isViewMode}
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                    disabled={isViewMode}
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
                >
                    <option value="PUBLISHED">Xuất bản</option>
                    <option value="DRAFT">Bản nháp</option>
                    <option value="ARCHIVED">Lưu trữ</option>
                </select>
            </div>
        </div>

        <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh thumbnail</label>
                <ImageUploading
                    multiple={false}
                    value={images}
                    onChange={onImageChange}
                    maxNumber={1}
                    dataURLKey="data_url"
                >
                    {({
                    imageList,
                    onImageUpload,
                    onImageRemoveAll,
                    isDragging,
                    dragProps,
                    }) => (
                    <div className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors ${!isViewMode ? 'hover:bg-gray-50' : ''}`}>
                        {imageList.length === 0 ? (
                        <button
                            className="flex flex-col items-center justify-center space-y-2 text-gray-500"
                            style={isDragging ? { color: 'red' } : undefined}
                            onClick={onImageUpload}
                            {...dragProps}
                            disabled={isViewMode}
                        >
                            <Upload size={32} />
                            <span className="text-xs">Nhấn hoặc kéo thả ảnh vào đây</span>
                        </button>
                        ) : (
                        <div className="relative w-full h-40">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageList[0]['data_url']} alt="" className="w-full h-full object-cover rounded-md" />
                            {!isViewMode && (
                                <button
                                    onClick={onImageRemoveAll}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                >
                                <X size={14} />
                                </button>
                            )}
                        </div>
                        )}
                    </div>
                    )}
                </ImageUploading>
             </div>
             <div>
                 <label className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
                 <textarea
                    disabled={isViewMode}
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-100"
                 />
             </div>
              <div className="flex items-center mt-2">
                <input
                    disabled={isViewMode}
                    id="is_featured_edit"
                    name="is_featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
                />
                <label htmlFor="is_featured_edit" className="ml-2 block text-sm text-gray-900">
                    Bài viết nổi bật
                </label>
            </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung bài viết <span className="text-red-500">*</span></label>
        <BlogEditor value={formData.content} onChange={handleEditorChange} disabled={isViewMode} />
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
      titleModal={isViewMode ? 'Xem chi tiết bài viết' : 'Chỉnh sửa bài viết'}
      bodyModal={renderBody()}
      footerModal={renderFooter()}
      modalSize="90%"
    />
  );
};

export default EditBlog;
