'use client';

import React, { useState, useCallback, useEffect, KeyboardEvent } from 'react';
import { Upload, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

// --- Imports ---
import { ModalCustom } from '../../../custom/modal-custom';

// --- Interface ---
interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  price_original: number;
  import_price?: number;
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
  description?: string;
  brand?: string;
  stock?: number;
  status?: string;
  has_variants: boolean;
  product_attributes: Attribute[];
  variants: ProductVariant[];
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
    import_price: 0,
    category_id: 0,
    product_type: PRODUCT_TYPE.PHYSICAL,
    is_app_visible: false,
    skus: { sku: '', dimension_length: 0, dimension_width: 0, dimension_height: 0, weight: 0 },
    images: '',
    images_mobile: '',
    short_description: '',
    description: '',
    has_variants: false,
    product_attributes: [],
    variants: [],
  });

  // --- Handlers ---
  const handleSaveClick = () => {
    onSave(formData);
    onClose(); // Close modal after saving
  };

  const handleAddAttribute = () => {
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
    setFormData(prev => ({
      ...prev,
      product_attributes: (prev.product_attributes || []).filter(attr => attr.id !== id),
    }));
  };

  const handleAttributeChange = (id: string, field: 'name' | 'values', value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      product_attributes: (prev.product_attributes || []).map(attr => {
        if (attr.id === id) {
          return { ...attr, [field]: value };
        }
        return attr;
      }),
    }));
  };

  const handleAddAttributeValue = (id: string, value: string) => {
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
    setFormData(prev => ({
      ...prev,
      product_attributes: (prev.product_attributes || []).map(attr => {
        if (attr.id === id) {
          return { ...attr, values: attr.values.filter(v => v !== valueToRemove) };
        }
        return attr;
      }),
    }));
  };

  // Generate variants when attributes change
  useEffect(() => {
    if (!formData.has_variants || !formData.product_attributes?.length) {
      if (formData.variants?.length) {
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

      // Try to find existing variant to preserve price/stock
      // 1. Exact match
      // 2. Partial match (if new variant is a superset of an old variant) - e.g. adding a new attribute
      const existingVariant = formData.variants?.find(v => {
        const vEntries = Object.entries(v.attributes);
        const newEntries = Object.entries(variantAttributes);

        // Check for exact match or if v is a subset of new variant (all props of v exist in new variant with same value)
        return vEntries.every(([key, val]) => variantAttributes[key] === val);
      });

      return existingVariant ? {
        ...existingVariant,
        attributes: variantAttributes, // Ensure we use the new full set of attributes
      } : {
        sku: '',
        price: formData.price_original || 0,
        stock: 0,
        attributes: variantAttributes,
      };
    });

    // Only update if variants have actually changed to avoid infinite loops
    // Simple check based on length or deep comparison could be added here
    // For now, we'll just set it. In a real app, use useDeepCompareEffect or similar.
    // To prevent infinite loop, we check if JSON stringify is different
    if (JSON.stringify(newVariants) !== JSON.stringify(formData.variants)) {
      setFormData(prev => ({ ...prev, variants: newVariants }));
    }

  }, [formData.product_attributes, formData.has_variants, formData.price_original]);

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
              <div className="lg:col-span-2 sub-panel grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                {renderField({
                  required: true,
                  label: 'Giá nhập',
                  field: (
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Nhập giá nhập"
                      value={values.import_price || 0}
                      onChange={(e) =>
                        setFormData({ ...values, import_price: Number(e.target.value) })
                      }
                    />
                  ),
                })}
                {renderField({
                  required: true,
                  label: 'Tồn kho',
                  field: (
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Nhập tồn kho"
                      value={values.stock || 0}
                      onChange={(e) =>
                        setFormData({ ...values, stock: Number(e.target.value) })
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
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Mô tả sản phẩm
              </label>
              <textarea
                className="form-input w-full h-32 resize-none"
                placeholder="Nhập mô tả sản phẩm..."
                value={values.description || ''}
                onChange={(e) => setFormData({ ...values, description: e.target.value })}
              />
            </div>

          </div>
          {/* Right Column: Description */}
          <div className="flex flex-col gap-6">
            {/* Panel 1: Settings */}
            <div className="panel bg-white rounded-lg p-4">
              <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Sản phẩm có nhiều phiên bản?</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 cursor-pointer w-fit" onClick={() => setFormData({ ...values, has_variants: !values.has_variants })}>
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
                  <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <label className="text-xl font-bold text-[#1462B0]">Thuộc tính & Biến thể</label>
                    <button
                      onClick={handleAddAttribute}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <Plus size={16} /> Thêm nhóm thuộc tính
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {values.product_attributes?.map((attr, index) => (
                      <div key={attr.id} className="p-3 bg-gray-50 rounded border border-gray-200 relative">
                        <button
                          onClick={() => handleRemoveAttribute(attr.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Tên thuộc tính</label>
                            <input
                              type="text"
                              className="form-input bg-white"
                              placeholder="Ví dụ: Màu sắc, Size..."
                              value={attr.name}
                              onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Giá trị (Nhấn Enter để thêm)</label>
                            <div className="form-input bg-white min-h-[38px] flex flex-wrap gap-2 p-1">
                              {attr.values.map((val, vIndex) => (
                                <span key={vIndex} className="bg-yellow-400 text-black text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                                  {val}
                                  <button
                                    onClick={() => handleRemoveAttributeValue(attr.id, val)}
                                    className="hover:text-red-600 focus:outline-none"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
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
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!values.product_attributes || values.product_attributes.length === 0) && (
                      <div className="text-center py-4 text-gray-500 text-sm italic">
                        Chưa có thuộc tính nào. Nhấn "Thêm nhóm thuộc tính" để bắt đầu.
                      </div>
                    )}
                  </div>
                </div>

                <div className="panel bg-white rounded-lg p-4">
                  <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Danh sách phiên bản (SKU)</label>
                  {values.variants && values.variants.length > 0 ? (
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3">Phiên bản</th>
                            <th className="px-4 py-3 w-32">Giá</th>
                            <th className="px-4 py-3 w-24">Kho</th>
                            <th className="px-4 py-3 w-32">SKU</th>
                          </tr>
                        </thead>
                        <tbody>
                          {values.variants.map((variant, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {Object.values(variant.attributes).join(' - ')}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  className="form-input py-1 px-2 h-8"
                                  value={variant.price}
                                  onChange={(e) => {
                                    const newVariants = [...values.variants!];
                                    newVariants[index].price = Number(e.target.value);
                                    setFormData({ ...values, variants: newVariants });
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  className="form-input py-1 px-2 h-8"
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const newVariants = [...values.variants!];
                                    newVariants[index].stock = Number(e.target.value);
                                    setFormData({ ...values, variants: newVariants });
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  className="form-input py-1 px-2 h-8"
                                  value={variant.sku}
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
                  ) : (
                    <div className="text-center py-8 text-gray-500 italic">
                      Vui lòng thêm thuộc tính và giá trị để tạo phiên bản.
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
