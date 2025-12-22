'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Upload, X, Loader2, Plus, Info, Package } from 'lucide-react';
import ImageUploading, { ErrorsType, ImageListType } from 'react-images-uploading';

// --- Imports ---
import { ModalCustom } from '@/components/custom/modal-custom';
import { CreatePromotionRequest } from '../models/request/promotion';
import { showToast } from '@/components/custom/custom-toast';
import IconEdit from '@/components/icons/icon-edit';
import IconX from '@/components/icons/icon-x';
import ImageCustom from '@/components/custom/image-custom';
import { MultiSelectModal, Column as ModalColumn } from '@/components/custom/multi-select-modal';
import { Table, Column as TableColumn } from '@/components/custom/table';
import { TabsCustom, TabCustom } from '@/components/custom/tab-custom';


// --- Interfaces (Copied from CreatePromotion for self-containment, ideally shared) ---
interface ProductSku {
    id: string;
    sku: string;
    price: number;
    original_price?: number;
    stock: number;
    image_url?: string;
    attributes?: { code: string; name: string; value: string; meta_value?: string }[];
}

interface Product {
    id: string | number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    image: string;
    // New fields
    sold_count: number;
    view_count: number;
    is_featured: boolean;
    min_price: number;
    max_price: number;
    sale_start_at: string | null;
    sale_end_at: string | null;
    is_new_arrival: boolean;
    // Arrays
    image_urls: string[];
    image_mobile_urls: string[];
    attributes_summary: { code: string; name: string; values: string[] }[];
    skus: ProductSku[];
}

interface PromotionItemConfig {
    discountPercent: number;
    discountQuantity: number;
}

// --- Props Interface ---
interface EditPromotionProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promotionData: CreatePromotionRequest) => void;
    promotionId: string | null;
}

const EditPromotion: React.FC<EditPromotionProps> = ({ isOpen, onClose, onSave, promotionId }) => {
    // --- State ---
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [formData, setFormData] = useState<Partial<CreatePromotionRequest>>({
        name: '',
        description: '',
        thumbnail_url: '',
        status: 'DRAFT',
        is_auto_active: true,
        start_at: '',
        end_at: ''
    });

    // --- Tabs Configuration ---
    const [currentTab, setCurrentTab] = useState(0);

    // --- Product Selection State ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productList, setProductList] = useState<Product[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<(number | string)[]>([]);
    const [promotionItems, setPromotionItems] = useState<Record<string | number, PromotionItemConfig>>({});

    // Fetch Products (Always fetch to have the 'pool' available)
    useEffect(() => {
        if (isOpen) {
            const fetchProducts = async () => {
                try {
                    const res = await fetch('/api/products?limit=1000');
                    const data = await res.json();
                    if (data.data) {
                        const mappedProducts: Product[] = data.data.map((p: any) => ({
                            id: p._id,
                            name: p.name,
                            sku: p.skus && p.skus.length > 0 ? p.skus[0].sku : (p.slug || ''),
                            price: p.min_price || (p.skus && p.skus.length > 0 ? p.skus[0].price : 0),
                            stock: p.skus ? p.skus.reduce((acc: number, sku: any) => acc + (sku.stock || 0), 0) : 0,
                            image: p.thumbnail_url || (p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : ''),
                            sold_count: p.sold_count || 0,
                            view_count: p.view_count || 0,
                            is_featured: p.is_featured || false,
                            min_price: p.min_price || 0,
                            max_price: p.max_price || 0,
                            sale_start_at: p.sale_start_at,
                            sale_end_at: p.sale_end_at,
                            is_new_arrival: p.is_new_arrival || false,
                            image_urls: p.image_urls || [],
                            image_mobile_urls: p.image_mobile_urls || [],
                            attributes_summary: p.attributes_summary || [],
                            skus: p.skus ? p.skus.map((s: any) => ({
                                id: s.id || s._id || s.sku,
                                sku: s.sku,
                                price: s.price,
                                original_price: s.original_price,
                                stock: s.stock,
                                image_url: s.image_url,
                                attributes: s.attributes
                            })) : []
                        }));
                        setProductList(mappedProducts);
                    }
                } catch (error) {
                    console.error("Failed to fetch products", error);
                    showToast({ message: "Lỗi tải danh sách sản phẩm", type: "error" });
                }
            };
            fetchProducts();
        }
    }, [isOpen]);

    // Fetch Promotion Details
    useEffect(() => {
        if (isOpen && promotionId && productList.length > 0) {
            const fetchDetail = async () => {
                setIsLoadingData(true);
                try {
                    const res = await fetch(`/api/promotions/${promotionId}/detail`);
                    if (!res.ok) throw new Error('Failed to fetch detail');
                    const data = await res.json();

                    // Fill Form Data
                    setFormData({
                        name: data.name,
                        description: data.description,
                        thumbnail_url: data.thumbnail_url,
                        status: data.status,
                        is_auto_active: data.is_auto_active,
                        start_at: data.start_at,
                        end_at: data.end_at
                    });

                    // Fill Items
                    const items = data.items || [];
                    const newSelectedIds: (string | number)[] = [];
                    const newPromotionItems: Record<string | number, PromotionItemConfig> = {};

                    items.forEach((item: any) => {
                        // Find product in local list to get correct IDs
                        // item.product_id is populated Object (has _id) OR just ID string
                        const productIdRaw = item.product_id?._id || item.product_id;
                        const parentProduct = productList.find(p => String(p.id) === String(productIdRaw));

                        // We need the ID used in Selection (Product ID or SKU ID)
                        // If item has SKU, we try to find the SKU ID in parent's skus.
                        let selectionId: string | number | undefined;

                        if (parentProduct) {
                            if (item.sku && parentProduct.skus && parentProduct.skus.length > 0) {
                                // Find SKU object
                                const skuObj = parentProduct.skus.find(s => s.sku === item.sku);
                                if (skuObj) selectionId = skuObj.id;
                            } else {
                                // Simple product or no sku variant match
                                selectionId = parentProduct.id;
                            }
                        }

                        // If not found in product list (maybe removed product?), we skip or handle gracefully.
                        if (selectionId) {
                            newSelectedIds.push(selectionId);
                            newPromotionItems[selectionId] = {
                                discountPercent: item.discount_value || 0,
                                discountQuantity: item.stock_sale || 0
                            };
                        }
                    });

                    setSelectedProductIds(newSelectedIds);
                    setPromotionItems(newPromotionItems);

                } catch (error) {
                    console.error("Fetch detail error", error);
                    showToast({ message: "Lỗi tải thông tin chiến dịch", type: "error" });
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchDetail();
        }
    }, [isOpen, promotionId, productList]); // Dependency on productList ensures we have products before mapping items

    // Update promotionItems when inputs change
    const handlePromotionItemChange = (productId: number | string, field: keyof PromotionItemConfig, value: number) => {
        setPromotionItems(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    // Derived Lists (Same logic as Create)
    const selectedProducts = useMemo(() => {
        const result: any[] = [];
        productList.forEach(p => {
            if (selectedProductIds.includes(p.id)) {
                if (p.skus && p.skus.length > 0) {
                    p.skus.forEach(s => {
                        result.push({
                            ...s,
                            name: `${p.name} - ${s.attributes?.map(a => a.value).join(' - ')}`,
                            image: s.image_url || p.image,
                            product_id: p.id,
                        });
                    });
                } else {
                    result.push({ ...p, product_id: p.id });
                }
            } else {
                if (p.skus) {
                    const selectedSkus = p.skus.filter(s => selectedProductIds.includes(s.id));
                    selectedSkus.forEach(s => {
                        result.push({
                            ...s,
                            name: `${p.name} - ${s.attributes?.map(a => a.value).join(' - ')}`,
                            image: s.image_url || p.image,
                            product_id: p.id
                        });
                    });
                }
            }
        });

        const unique = new Map();
        result.forEach(item => {
            unique.set(item.id, item);
        });
        return Array.from(unique.values());
    }, [selectedProductIds, productList]);

    const availableProducts = useMemo(() => {
        return productList.map(p => {
            const product = { ...p };
            if (selectedProductIds.includes(product.id)) {
                return null;
            }
            if (product.skus && product.skus.length > 0) {
                const remainingSkus = product.skus.filter(s => !selectedProductIds.includes(s.id));
                if (remainingSkus.length === 0) {
                    return null;
                }
                product.skus = remainingSkus;
            }
            return product;
        }).filter(Boolean) as Product[];
    }, [selectedProductIds, productList]);

    // --- Columns Configuration ---
    const productModalColumns: ModalColumn<Product>[] = [
        {
            header: 'Sản phẩm',
            accessor: (item) => (
                <div className="flex items-center gap-3">
                    {item.image ? (
                        <img src={item.image} className="w-10 h-10 rounded border object-cover bg-gray-100" alt={item.name} />
                    ) : (
                        <div className="w-10 h-10 rounded border bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                    )}
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.sku}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Giá',
            className: 'text-right font-mono text-gray-600',
            accessor: (item) => `${item.price.toLocaleString()}₫`
        },
        {
            header: 'Kho',
            className: 'text-center',
            accessor: (item) => item.stock
        }
    ];

    const skuModalColumns: ModalColumn<ProductSku>[] = [
        {
            header: '',
            accessor: (sku) => (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="font-medium text-gray-700">
                        {sku.attributes?.map(a => a.value).join(' - ') || 'Mặc định'}
                    </span>
                    <span className="text-gray-400 text-xs">#{sku.sku}</span>
                </div>
            )
        },
        {
            header: '',
            className: 'text-right font-mono text-gray-600',
            accessor: (sku) => `${sku.price.toLocaleString()}₫`
        },
        {
            header: '',
            className: 'text-center text-gray-500',
            accessor: (sku) => sku.stock
        }
    ];

    const productTableColumns: TableColumn<Product>[] = [
        {
            header: 'Thông tin sản phẩm',
            render: (p) => (
                <div className="flex items-center gap-3">
                    {p.image ? (
                        <img src={p.image} className="w-10 h-10 rounded border object-cover bg-gray-100" alt={p.name} />
                    ) : (
                        <div className="w-10 h-10 rounded border bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                    )}
                    <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.sku}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Giá bán',
            className: 'text-right font-mono',
            render: (p) => `${p.price.toLocaleString()}₫`
        },
        {
            header: 'Tồn kho',
            className: 'text-center',
            render: (p) => p.stock
        }
    ];

    const renderProductMobile = (p: Product, onRemove: (item: Product) => void) => (
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3 relative">
            {p.image ? (
                <img src={p.image} className="w-16 h-16 rounded border object-cover bg-gray-50" alt="" />
            ) : (
                <div className="w-16 h-16 rounded border bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Img</div>
            )}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1">{p.name}</div>
                <div className="text-xs text-gray-500 mb-2">{p.sku}</div>
                <div className="flex justify-between items-end">
                    <div className="text-[#1890ff] font-semibold text-sm">{p.price.toLocaleString()}₫</div>
                    <div className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Kho: {p.stock}</div>
                </div>
            </div>
            <button
                onClick={() => onRemove(p)}
                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500"
            >
                <X size={16} />
            </button>
        </div>
    );

    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            description: '',
            thumbnail_url: '',
            status: 'DRAFT',
            is_auto_active: true,
            start_at: '',
            end_at: ''
        });
        setCurrentTab(0);
        setSelectedProductIds([]);
        setPromotionItems({});
    }, []);

    // NOTE: Only reset when closing or ID changes?
    // We already fetch data on Open if ID fits.

    // --- Handlers ---
    const handleSaveClick = async () => {
        // Basic validation
        if (!formData.name) {
            showToast({ message: "Tên chiến dịch là bắt buộc", type: "error" });
            return;
        }
        if (!formData.start_at || !formData.end_at) {
            showToast({ message: "Vui lòng chọn thời gian bắt đầu và kết thúc", type: "error" });
            return;
        }
        if (new Date(formData.start_at) >= new Date(formData.end_at)) {
            showToast({ message: "Thời gian kết thúc phải sau thời gian bắt đầu", type: "error" });
            return;
        }

        const payload: CreatePromotionRequest = {
            name: formData.name,
            description: formData.description,
            thumbnail_url: formData.thumbnail_url,
            status: formData.status as any || 'DRAFT',
            is_auto_active: formData.is_auto_active,
            start_at: formData.start_at,
            end_at: formData.end_at,
            items: selectedProducts.map(product => {
                const config = promotionItems[product.id] || { discountPercent: 0, discountQuantity: product.stock };
                const discountValue = config.discountPercent || 0;
                const salePrice = product.price * (1 - discountValue / 100);

                return {
                    product_id: (product as any).product_id,
                    sku: product.sku,
                    product_name: product.name,
                    sku_name: product.name,
                    original_price: product.price,
                    sale_price: salePrice,
                    discount_type: 'PERCENTAGE',
                    discount_value: discountValue,
                    stock_sale: config.discountQuantity || product.stock,
                };
            })
        };
        await onSave(payload);
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
        const images: ImageListType = value ? [{ data_url: value }] : [];

        const onChange = (imageList: ImageListType) => {
            const newValue = imageList.length > 0 ? imageList[0].data_url : '';
            setFormData(prev => ({ ...prev, thumbnail_url: newValue }));
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
                    {({ imageList, onImageUpload, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-4">
                                {imageList.map((image, index) => (
                                    <div key={index} className="relative group w-full h-40 sm:w-64">
                                        <div className="w-full h-full rounded-lg border border-gray-200 overflow-hidden bg-white">
                                            <ImageCustom isUser={false} isLocal={!!image.data_url} url={image.data_url || null} className="object-cover w-full h-full" />
                                        </div>
                                        <div className="absolute top-1 right-1 flex gap-1 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" className="p-1 text-white hover:text-blue-300" onClick={() => onImageUpdate(index)}><IconEdit className="w-3 h-3" /></button>
                                            <button type="button" className="p-1 text-white hover:text-red-300" onClick={() => onImageRemove(index)}><IconX className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))}
                                {imageList.length < 1 && (
                                    <div
                                        className={`w-full sm:w-64 h-40 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
                                        onClick={onImageUpload}
                                        {...dragProps}
                                    >
                                        <Upload className="text-gray-400 w-6 h-6 mb-1" />
                                        <span className="text-xs text-gray-600 font-medium">Tải Banner</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </ImageUploading>
            </div>
        );
    };

    // --- Custom Header Render ---
    const renderCustomHeader = () => (
        <div className="bg-white border-b border-gray-200 flex-shrink-0 z-10 w-full">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">CẬP NHẬT CHIẾN DỊCH</h2>
                    <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Chỉnh sửa thông tin chiến dịch khuyến mãi.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="px-6">
                <TabsCustom
                    value={currentTab}
                    onChange={setCurrentTab}
                    className="border-b border-gray-200"
                >
                    <TabCustom
                        label="Thông tin chung"
                        icon={<Info size={16} />}
                        iconPosition="start"
                    />
                    <TabCustom
                        label="Sản phẩm áp dụng"
                        icon={<Package size={16} />}
                        iconPosition="start"
                    />
                </TabsCustom>
            </div>
        </div>
    );

    // --- Render Modal Body ---
    const renderModalBody = useCallback(() => {
        if (isLoadingData) {
            return (
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500">Đang tải dữ liệu chiến dịch...</p>
                </div>
            )
        }

        const values = formData;
        return (
            <div className="relative space-y-5 p-1 pr-2 max-w-5xl mx-auto">
                {currentTab === 0 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Main Info */}
                        <div className="panel bg-white rounded-lg col-span-2">
                            {/* <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Thông tin chiến dịch</label> */}
                            <div className="grid grid-cols-1 gap-y-3 gap-x-4 lg:grid-cols-2 p-1">
                                <div className="lg:col-span-2">
                                    {renderField({
                                        required: true,
                                        label: 'Tên chiến dịch',
                                        field: (
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="VD: Flash Sale 12.12"
                                                value={values.name || ''}
                                                onChange={(e) => setFormData({ ...values, name: e.target.value })}
                                            />
                                        ),
                                    })}
                                </div>

                                <div className="lg:col-span-1">
                                    {renderField({
                                        required: true,
                                        label: 'Thời gian bắt đầu',
                                        field: (
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={values.start_at ? new Date(values.start_at).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => setFormData({ ...values, start_at: e.target.value })}
                                            />
                                        ),
                                    })}
                                </div>

                                <div className="lg:col-span-1">
                                    {renderField({
                                        required: true,
                                        label: 'Thời gian kết thúc',
                                        field: (
                                            <input
                                                type="datetime-local"
                                                className="form-input"
                                                value={values.end_at ? new Date(values.end_at).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => setFormData({ ...values, end_at: e.target.value })}
                                            />
                                        ),
                                    })}
                                </div>

                                <div className="lg:col-span-1">
                                    {renderField({
                                        label: 'Cấu hình tự động',
                                        field: (
                                            <div className="h-[38px] flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    checked={values.is_auto_active || false}
                                                    onChange={(e) => setFormData({ ...values, is_auto_active: e.target.checked })}
                                                />
                                                <span className="text-sm text-gray-700">Tự động kích hoạt khi đến giờ</span>
                                            </div>
                                        ),
                                    })}
                                </div>

                                <div className="lg:col-span-2">
                                    {renderRowImageUploading({
                                        required: false,
                                        labelName: "Banner chiến dịch",
                                        value: values.thumbnail_url
                                    })}
                                </div>

                                <div className="lg:col-span-2">
                                    {renderField({
                                        label: 'Mô tả',
                                        field: (
                                            <textarea
                                                className="form-input h-24 resize-none"
                                                placeholder="Mô tả chi tiết chương trình..."
                                                value={values.description || ''}
                                                onChange={(e) => setFormData({ ...values, description: e.target.value })}
                                            />
                                        ),
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 1 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-end p-1">
                            <button
                                onClick={() => setIsProductModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm"
                            >
                                <Plus size={18} /> Thêm sản phẩm
                            </button>
                        </div>
                        <div className="h-[500px] -mx-4 sm:mx-0">
                            <Table
                                data={selectedProducts}
                                columns={[
                                    {
                                        header: 'Sản phẩm',
                                        render: (p: Product) => (
                                            <div className="flex items-center gap-3">
                                                {p.image ? (
                                                    <img src={p.image} className="w-10 h-10 rounded border object-cover bg-gray-100" alt={p.name} />
                                                ) : (
                                                    <div className="w-10 h-10 rounded border bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-1">{p.name}</div>
                                                    <div className="text-xs text-gray-500">{p.sku}</div>
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Giá gốc',
                                        className: 'text-right font-mono',
                                        render: (p: Product) => `${p.price.toLocaleString()}₫`
                                    },
                                    {
                                        header: 'Giá giảm (%)',
                                        className: 'w-32',
                                        render: (p: Product) => (
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-right pr-8"
                                                    placeholder="0"
                                                    value={promotionItems[p.id]?.discountPercent || ''}
                                                    onChange={(e) => {
                                                        const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                                        handlePromotionItemChange(p.id, 'discountPercent', val);
                                                    }}
                                                />
                                                <span className="absolute right-3 top-1.5 text-gray-500">%</span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Sau giảm',
                                        className: 'text-right font-mono',
                                        render: (p: Product) => {
                                            const discountPercent = promotionItems[p.id]?.discountPercent || 0;
                                            const discountedPrice = p.price * (1 - discountPercent / 100);
                                            return <span className="text-red-600 font-bold">{discountedPrice.toLocaleString()}₫</span>;
                                        }
                                    },
                                    {
                                        header: 'SL giảm',
                                        className: 'w-32',
                                        render: (p: Product) => (
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-center"
                                                placeholder="SL"
                                                value={promotionItems[p.id]?.discountQuantity ?? p.stock}
                                                onChange={(e) => handlePromotionItemChange(p.id, 'discountQuantity', Number(e.target.value))}
                                            />
                                        )
                                    },
                                    {
                                        header: '',
                                        className: 'w-10 text-center',
                                        render: (p: Product) => (
                                            <button
                                                onClick={() => setSelectedProductIds(prev => {
                                                    // Duplicate logic from onRemove in CreatePromotion
                                                    // Since we are inside renderModalBody, we can just use the setter or extract functionality
                                                    if (prev.includes(p.id)) return prev.filter(id => id !== p.id);
                                                    const parent = productList.find(parent => parent.skus && parent.skus.some(s => s.id === String(p.id)));
                                                    if (parent && prev.includes(parent.id)) {
                                                        let newIds = prev.filter(id => id !== parent.id);
                                                        const otherSkus = parent.skus?.filter(s => s.id !== String(p.id)).map(s => s.id) || [];
                                                        return [...newIds, ...otherSkus];
                                                    }
                                                    return prev;
                                                })}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        )
                                    }
                                ]}
                            />
                        </div>
                    </div>
                )}

                <style jsx>{`
          .form-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            font-size: 16px;
            outline: none;
            transition: border-color 0.15s ease-in-out;
          }
          .form-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}</style>
            </div>
        );
    }, [formData, currentTab, selectedProducts, productTableColumns, renderProductMobile, renderField, renderRowImageUploading, promotionItems, isLoadingData, productList]);

    const renderModalFooter = () => (
        <div className="flex gap-2 w-full justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors">
                Hủy bỏ
            </button>
            <button onClick={handleSaveClick} className="px-6 py-2 bg-[#1462B0] text-white font-medium rounded hover:bg-[#104e8b] transition-colors shadow-sm">
                Cập nhật
            </button>
        </div>
    );

    return (
        <>
            <ModalCustom
                isOpen={isOpen}
                onClose={onClose}
                titleModal="CẬP NHẬT CHIẾN DỊCH KHUYẾN MÃI"
                modalSize="90%"
                bodyModal={renderModalBody()}
                footerModal={renderModalFooter()}
                centered
                customHeader={renderCustomHeader()}
            />

            <MultiSelectModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onConfirm={(newIds) => setSelectedProductIds(prev => [...prev, ...newIds])}
                data={availableProducts}
                initialSelectedIds={[]}
                columns={productModalColumns}
                title="Chọn sản phẩm áp dụng"
                description="Tìm kiếm theo tên hoặc mã SKU"
                searchKeys={['name', 'sku']}
                subDataKey="skus"
                subColumns={skuModalColumns}
            />
        </>
    );
};

export default EditPromotion;
