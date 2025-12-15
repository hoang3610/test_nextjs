'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

// --- Imports ---
import { ModalCustom } from '../../../custom/modal-custom';
import { ProductResponse } from '../models/response/product';
import ImageUploading, { ErrorsType, ImageListType } from 'react-images-uploading';
import { showToast } from '@/components/custom/custom-toast';
import IconEdit from '@/components/icons/icon-edit';
import IconX from '@/components/icons/icon-x';
import ImageCustom from '@/components/custom/image-custom';
import QuillEditor from '@/components/custom/quill-editor';

// --- Interface ---
export interface Attribute {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  original_price?: number; // Renamed from price_original
  image_url?: string;
}

// Internal state interface for the form, extending the response payload with UI specific fields
export interface ProductFormState extends Partial<ProductResponse> {
  product_attributes?: Attribute[];
  variants?: ProductVariant[];
  // Ensure these exist for binding even if optional in Response
  original_price?: number;
  price?: number;
  stock?: number;
  short_description?: string;
}

// --- Constants ---
const PRODUCT_TYPE = {
  PHYSICAL: 1,
  COURSE: 2,
  HITA: 3,
};


// --- Props Interface ---
// --- Props Interface ---
interface EditProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<ProductFormState>) => void;
  productData: Partial<ProductFormState> | null;
  isViewMode: boolean;
  categories: { _id: string; name: string }[]; // Add categories prop
}

const EditProduct: React.FC<EditProductProps> = ({ isOpen, onClose, onSave, productData, isViewMode, categories }) => {
  // --- State ---
  // categories state lifted up

  const [formData, setFormData] = useState<Partial<ProductFormState>>({
    name: '',
    original_price: 0,
    price: 0,
    stock: 0,
    category_id: '',
    product_type: PRODUCT_TYPE.PHYSICAL,
    is_active: false,
    // skus: ...
    image_urls: [],
    image_mobile_urls: [],
    short_description: '',
    description: '',
    has_variants: false,
    product_attributes: [],
    variants: [],
  });

  useEffect(() => {
    if (productData) {
      // Transform API response to UI state
      const mappedData: Partial<ProductFormState> = {
        ...productData,
        // Map attributes_summary to product_attributes (UI)
        product_attributes: productData.attributes_summary?.map(attr => ({
          id: attr.code, // Use code as ID for stability
          name: attr.name,
          values: attr.values
        })) || [],
        // Map skus to variants (UI)
        variants: productData.skus?.map(sku => {
          const variantAttributes: Record<string, string> = {};
          sku.attributes?.forEach(attr => {
            variantAttributes[attr.name] = attr.value;
          });
          return {
            sku: sku.sku || '',
            price: sku.price || 0,
            stock: sku.stock || 0,
            attributes: variantAttributes,
            original_price: sku.original_price || 0, // Map original_price
            image_url: sku.image_url || '',
          };
        }) || []
      };
      setFormData(mappedData);
    }
  }, [productData]);

  // --- Handlers ---
  const handleSaveClick = () => {
    onSave(formData);
    onClose();
  };

  const handleAddAttribute = () => {
    if (isViewMode) return;
    const newAttribute: Attribute = {
      id: Date.now().toString(),
      name: '',
      values: [],
    };
    setFormData(prev => ({
      ...prev,
      product_attributes: [...(prev.product_attributes || []), newAttribute],
    }));
  };

  const handleRemoveAttribute = (id: string) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      product_attributes: (prev.product_attributes || []).filter(attr => attr.id !== id),
      variants: [] // Clear variants to force regeneration or cleanup
    }));
  };

  const handleAttributeChange = (id: string, field: 'name' | 'values', value: string | string[]) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      product_attributes: (prev.product_attributes || []).map(attr => {
        if (attr.id === id) {
          return { ...attr, [field]: value };
        }
        return attr;
      }),
      // Don't clear variants here, let useEffect handle updates if possible, or clear if critical change
    }));
  };

  const handleAddAttributeValue = (id: string, value: string) => {
    if (isViewMode) return;
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      product_attributes: (prev.product_attributes || []).map(attr => {
        if (attr.id === id && !attr.values.includes(value.trim())) {
          return { ...attr, values: [...attr.values, value.trim()] };
        }
        return attr;
      }),
    }));
  };

  const handleRemoveAttributeValue = (id: string, valueToRemove: string) => {
    if (isViewMode) return;
    setFormData(prev => ({
      ...prev,
      product_attributes: (prev.product_attributes || []).map(attr => {
        if (attr.id === id) {
          return { ...attr, values: attr.values.filter(v => v !== valueToRemove) };
        }
        return attr;
      }),
      variants: [] // Clear variants to force regeneration or cleanup
    }));
  };

  // Generate variants when attributes change
  useEffect(() => {
    // Skip generation if in view mode
    if (isViewMode) return;

    // If turning off variants, preserve data (hide only)
    if (!formData.has_variants) {
      return;
    }

    if (!formData.product_attributes?.length) {
      if (formData.variants?.length && formData.variants.length > 0) {
        setFormData(prev => ({ ...prev, variants: [] }));
      }
      return;
    }

    const attributes = formData.product_attributes.filter(attr => attr.name && attr.values.length > 0);
    if (attributes.length === 0) return;

    const generateCombinations = (arrays: string[][]): string[][] => {
      if (arrays.length === 0) return [[]];
      const first = arrays[0];
      const rest = generateCombinations(arrays.slice(1));
      const combinations: string[][] = [];
      first.forEach(val => {
        rest.forEach(r => {
          combinations.push([val, ...r]);
        });
      });
      return combinations;
    };

    const attributeValues = attributes.map(attr => attr.values);
    const combinations = generateCombinations(attributeValues);

    const newVariants: ProductVariant[] = combinations.map(combination => {
      const variantAttributes: Record<string, string> = {};
      attributes.forEach((attr, index) => {
        variantAttributes[attr.name] = combination[index];
      });

      const existingVariant = formData.variants?.find(v => {
        if (!v.attributes) return false;
        const vEntries = Object.entries(v.attributes);
        // Check exact match of attributes
        if (vEntries.length !== Object.keys(variantAttributes).length) return false;
        return vEntries.every(([key, val]) => variantAttributes[key] === val);
      });

      return existingVariant ? {
        ...existingVariant,
        attributes: variantAttributes,
      } : {
        sku: '',
        price: formData.price || 0,
        stock: 0,
        attributes: variantAttributes,
        image_url: '',
      };
    });

    if (JSON.stringify(newVariants) !== JSON.stringify(formData.variants)) {
      setFormData(prev => ({ ...prev, variants: newVariants }));
    }

  }, [formData.product_attributes, formData.has_variants, formData.original_price, isViewMode]);

  // --- Render Helpers ---
  const renderField = ({ label, required, field }: any) => (
    <div className="flex flex-col gap-1 mb-1">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {field}
    </div>
  );

  const renderRowImageUploading = ({ labelName, required, value, name }: any) => {
    const images: ImageListType = Array.isArray(value)
      ? value.map((url: string) => ({ data_url: url }))
      : [];

    const onChange = (imageList: ImageListType) => {
      const newValues = imageList.map(img => img.data_url);
      setFormData(prev => ({ ...prev, [name]: newValues }));
    };

    return (
      <div className="mt-4 w-full">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {labelName} {required && <span className="text-red-500">*</span>}
        </label>
        <ImageUploading
          multiple={true}
          value={images}
          onChange={onChange}
          maxNumber={5}
          dataURLKey="data_url"
          onError={(errors: ErrorsType) => {
            if (errors?.maxNumber) showToast({ message: "Chỉ được chọn tối đa 5 ảnh", type: "warning" });
            if (errors?.acceptType) showToast({ message: "Chỉ được phép tải lên ảnh", type: "warning" });
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
                {imageList.length < 5 && (
                  <div
                    className={`w-24 h-24 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    <Upload className="text-gray-400 w-6 h-6 mb-1" />
                    <span className="text-xs text-gray-600 font-medium">Tải ảnh</span>
                    <span className="text-[10px] text-gray-400">({imageList.length}/5)</span>
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
                      disabled={isViewMode}
                      type="text"
                      className="form-input"
                      placeholder="Nhập tên sản phẩm"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      disabled={isViewMode}
                      className="form-select"
                      value={(typeof formData.category_id === 'object' ? (formData.category_id as any)._id : formData.category_id) || ''}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="" disabled>Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ),
                })}
              </div>
              <div className="lg:col-span-2 sub-panel grid grid-cols-1 lg:grid-cols-3 gap-4">
                {renderField({
                  required: true,
                  label: 'Giá sản phẩm',
                  field: (
                    <input
                      disabled={isViewMode || values.has_variants}
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      placeholder="Nhập giá sản phẩm"
                      value={values.price ?? 0}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        setFormData({ ...values, price: Number(e.target.value.replace(/\D/g, '')) })
                      }
                    />
                  ),
                })}
                {renderField({
                  required: true,
                  label: 'Giá nhập',
                  field: (
                    <input
                      disabled={isViewMode || values.has_variants}
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      placeholder="Nhập giá nhập"
                      value={values.original_price ?? 0}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        setFormData({ ...values, original_price: Number(e.target.value.replace(/\D/g, '')) })
                      }
                    />
                  ),
                })}
                {renderField({
                  required: true,
                  label: 'Tồn kho',
                  field: (
                    <input
                      disabled={isViewMode || values.has_variants}
                      type="text"
                      inputMode="numeric"
                      className="form-input"
                      placeholder="Nhập tồn kho"
                      value={values.stock ?? 0}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        setFormData({ ...values, stock: Number(e.target.value.replace(/\D/g, '')) })
                      }
                    />
                  ),
                })}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderRowImageUploading({
                required: true,
                labelName: "Hình ảnh sản phẩm",
                value: values.image_urls,
                name: "image_urls"
              })}
              {renderRowImageUploading({
                required: true,
                labelName: "Hình ảnh hiển thị trên mobile",
                value: values.image_mobile_urls,
                name: "image_mobile_urls"
              })}
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Mô tả ngắn
              </label>
              <QuillEditor
                readOnly={isViewMode}
                value={formData.short_description || ''}
                onChange={(val) => setFormData({ ...formData, short_description: val })}
              />
            </div>
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Mô tả sản phẩm
              </label>
              <QuillEditor
                readOnly={isViewMode}
                value={formData.description || ''}
                onChange={(val) => setFormData({ ...formData, description: val })}
              />
            </div>

          </div>
          {/* Right Column: Description */}
          <div className="flex flex-col gap-6">
            {/* Panel 1: Settings */}
            <div className="panel bg-white rounded-lg p-4">
              <label className="text-xl font-bold text-[#1462B0] mb-4 mt-6 block border-b pb-2">Sản phẩm có nhiều phiên bản?</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 cursor-pointer w-fit" onClick={() => {
                  if (isViewMode) return;
                  const newValue = !values.has_variants;
                  let updatedValues = { ...values, has_variants: newValue };

                  // If turning OFF variants, and we have variants, copy price/stock from the CHEAPEST variant
                  if (!newValue && values.variants && values.variants.length > 0) {
                    // Sort by price ascending
                    const sortedVariants = [...values.variants].sort((a, b) => (a.price || 0) - (b.price || 0));
                    const cheapestVariant = sortedVariants[0];

                    updatedValues = {
                      ...updatedValues,
                      price: cheapestVariant.price || 0,
                      stock: cheapestVariant.stock || 0,
                      original_price: cheapestVariant.original_price || values.original_price || 0
                    };
                  }

                  setFormData(updatedValues);
                }}>
                  {values.has_variants ? (
                    <ToggleRight className="text-blue-600" size={40} strokeWidth={1.5} />
                  ) : (
                    <ToggleLeft className="text-gray-400" size={40} strokeWidth={1.5} />
                  )}
                  <span className={`text-sm font-medium ${values.has_variants ? 'text-blue-600' : 'text-gray-700'}`}>
                    {values.has_variants ? 'Đang bật' : 'Đang tắt'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Bật nếu sản phẩm có các tùy chọn như kích thước, màu sắc.
                </p>
              </div>
            </div>

            {/* Panel 4: Attributes & Variants (Only show if HAS variants) */}
            {values.has_variants && (
              <>
                <div className="panel bg-white rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b pb-2 gap-2">
                    <label className="text-xl font-bold text-[#1462B0]">Thuộc tính & Biến thể</label>
                    {!isViewMode && (
                      <button
                        onClick={handleAddAttribute}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium self-start sm:self-auto"
                      >
                        <Plus size={16} /> Thêm nhóm thuộc tính
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {values.product_attributes?.map((attr, index) => (
                      <div key={attr.id} className="p-3 bg-gray-50 rounded border border-gray-200 relative">
                        {!isViewMode && (
                          <button
                            onClick={() => handleRemoveAttribute(attr.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Tên thuộc tính</label>
                            <input
                              disabled={isViewMode}
                              type="text"
                              className="form-input bg-white"
                              placeholder="Ví dụ: Màu sắc, Size..."
                              value={attr.name}
                              onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Giá trị {isViewMode ? '' : '(Nhấn Enter để thêm)'}</label>
                            <div className="form-input bg-white min-h-[38px] flex flex-wrap gap-2 p-1">
                              {attr.values.map((val, vIndex) => (
                                <span key={vIndex} className="bg-yellow-400 text-black text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                                  {val}
                                  {!isViewMode && (
                                    <button
                                      onClick={() => handleRemoveAttributeValue(attr.id, val)}
                                      className="hover:text-red-600 focus:outline-none"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </span>
                              ))}
                              {!isViewMode && (
                                <input
                                  type="text"
                                  className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
                                  placeholder="Nhập giá trị..."
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddAttributeValue(attr.id, e.currentTarget.value);
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!values.product_attributes || values.product_attributes.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm italic">
                        {isViewMode ? 'Không có thuộc tính nào.' : 'Chưa có thuộc tính nào. Nhấn "Thêm nhóm thuộc tính" để bắt đầu.'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel bg-white rounded-lg p-4">
                  <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Danh sách phiên bản (SKU)</label>
                  {values.variants && values.variants.length > 0 ? (
                    <>
                      {/* Mobile View: Cards */}
                      <div className="md:hidden flex flex-col gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                        {values.variants.map((variant, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex flex-col gap-3 shadow-sm">
                            <div className="font-bold text-gray-800 border-b border-gray-200 pb-2">
                              {/* Safety check for attributes to avoid potential crash if undefined */}
                              {variant.attributes && Object.values(variant.attributes).join(' - ')}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Giá</label>
                                <input
                                  disabled={isViewMode}
                                  type="text"
                                  inputMode="numeric"
                                  className="form-input w-full bg-white h-9"
                                  placeholder="0"
                                  value={variant.price ?? 0}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const newVariants = [...values.variants!];
                                    newVariants[index].price = Number(e.target.value.replace(/\D/g, ''));
                                    setFormData({ ...values, variants: newVariants });
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Giá nhập</label>
                                <input
                                  disabled={isViewMode}
                                  type="text"
                                  inputMode="numeric"
                                  className="form-input w-full bg-white h-9"
                                  placeholder="0"
                                  value={variant.original_price ?? 0}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const newVariants = [...values.variants!];
                                    newVariants[index].original_price = Number(e.target.value.replace(/\D/g, ''));
                                    setFormData({ ...values, variants: newVariants });
                                  }}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Kho</label>
                                <input
                                  disabled={isViewMode}
                                  type="text"
                                  inputMode="numeric"
                                  className="form-input w-full bg-white h-9"
                                  placeholder="0"
                                  value={variant.stock ?? 0}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const newVariants = [...values.variants!];
                                    newVariants[index].stock = Number(e.target.value.replace(/\D/g, ''));
                                    setFormData({ ...values, variants: newVariants });
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-500 mb-1 block">SKU</label>
                              <input
                                disabled={isViewMode}
                                type="text"
                                className="form-input w-full bg-white h-9"
                                placeholder="Mã SKU"
                                value={variant.sku ?? ''}
                                onChange={(e) => {
                                  const newVariants = [...values.variants!];
                                  newVariants[index].sku = e.target.value;
                                  setFormData({ ...values, variants: newVariants });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View: Table */}
                      <div className="hidden md:block overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 bg-gray-100">Phiên bản</th>
                              <th className="px-4 py-3 w-20 bg-gray-100 text-center">Ảnh</th>
                              <th className="px-4 py-3 w-32 bg-gray-100">Giá</th>
                              <th className="px-4 py-3 w-32 bg-gray-100">Giá nhập</th>
                              <th className="px-4 py-3 w-24 bg-gray-100">Kho</th>
                              <th className="px-4 py-3 w-32 bg-gray-100">SKU</th>
                            </tr>
                          </thead>
                          <tbody>
                            {values.variants.map((variant, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {variant.attributes && Object.values(variant.attributes).join(' - ')}
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <ImageUploading
                                    multiple={false}
                                    value={variant.image_url ? [{ data_url: variant.image_url }] : []}
                                    onChange={(imageList) => {
                                      const newVariants = [...values.variants!];
                                      newVariants[index].image_url = imageList[0]?.data_url || '';
                                      setFormData({ ...values, variants: newVariants });
                                    }}
                                    maxNumber={1}
                                    dataURLKey="data_url"
                                  >
                                    {({
                                      imageList,
                                      onImageUpload,
                                      onImageUpdate,
                                      isDragging,
                                      dragProps,
                                    }) => (
                                      <div className="flex justify-center">
                                        {imageList[0] ? (
                                          <div className="relative group w-10 h-10">
                                            <img
                                              src={imageList[0].data_url}
                                              alt="Variant"
                                              className="w-full h-full object-cover rounded border border-gray-200 cursor-pointer"
                                              onClick={() => onImageUpdate(0)}
                                            />
                                          </div>
                                        ) : (
                                          <button
                                            className={`w-10 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                            disabled={isViewMode}
                                          >
                                            <Upload size={14} className="text-gray-400" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </ImageUploading>
                                </td>

                                <td className="px-4 py-3">
                                  <input
                                    disabled={isViewMode}
                                    type="text"
                                    inputMode="numeric"
                                    className="form-input py-1 px-2 h-8 w-full"
                                    value={variant.price ?? 0}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const newVariants = [...values.variants!];
                                      newVariants[index].price = Number(e.target.value.replace(/\D/g, ''));
                                      setFormData({ ...values, variants: newVariants });
                                    }}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    disabled={isViewMode}
                                    type="text"
                                    inputMode="numeric"
                                    className="form-input py-1 px-2 h-8 w-full"
                                    value={variant.original_price ?? 0}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const newVariants = [...values.variants!];
                                      newVariants[index].original_price = Number(e.target.value.replace(/\D/g, ''));
                                      setFormData({ ...values, variants: newVariants });
                                    }}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    disabled={isViewMode}
                                    type="text"
                                    inputMode="numeric"
                                    className="form-input py-1 px-2 h-8 w-full"
                                    value={variant.stock ?? 0}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const newVariants = [...values.variants!];
                                      newVariants[index].stock = Number(e.target.value.replace(/\D/g, ''));
                                      setFormData({ ...values, variants: newVariants });
                                    }}
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    disabled={isViewMode}
                                    type="text"
                                    className="form-input py-1 px-2 h-8 w-full"
                                    value={variant.sku ?? ''}
                                    onChange={(e) => {
                                      const newVariants = [...values.variants!];
                                      newVariants[index].sku = e.target.value;
                                      setFormData({ ...values, variants: newVariants });
                                    }}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 italic">
                      {isViewMode ? 'Không có phiên bản nào.' : 'Vui lòng thêm thuộc tính và giá trị để tạo phiên bản.'}
                    </div>
                  )}
                </div>
              </>
            )}
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
           .form-input:disabled, .form-select:disabled {
              background-color: #f8fafc;
              color: #94a3b8;
           }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}</style>
      </div >
    );
  }, [formData, isViewMode, categories]);

  // --- Render Modal Footer ---
  const renderModalFooter = () => (
    <>
      <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors">
        {isViewMode ? 'Đóng' : 'Hủy bỏ'}
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
      titleModal={isViewMode ? 'XEM CHI TIẾT SẢN PHẨM' : 'CHỈNH SỬA SẢN PHẨM'}
      modalSize="90%"
      bodyModal={renderModalBody()}
      footerModal={renderModalFooter()}
      centered
    />
  );
};

export default EditProduct;