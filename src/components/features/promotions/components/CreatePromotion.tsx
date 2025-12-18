'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Upload, Check, X } from 'lucide-react';
import ImageUploading, { ErrorsType, ImageListType } from 'react-images-uploading';

// --- Imports ---
import { ModalCustom } from '@/components/custom/modal-custom';
import { CreatePromotionRequest } from '../models/request/promotion';
import { showToast } from '@/components/custom/custom-toast';
import IconEdit from '@/components/icons/icon-edit';
import IconX from '@/components/icons/icon-x';
import ImageCustom from '@/components/custom/image-custom';
import ProgressBar from '@/components/custom/progress-bar';
import { SelectedItemsTable, Column as TableColumn } from '@/components/custom/selected-items-table';
import { MultiSelectModal, Column as ModalColumn } from '@/components/custom/multi-select-modal';
import { Table } from '@/components/custom/table';

// --- MOCK DATA ---
interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    image: string;
}

const MOCK_PRODUCTS: Product[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Sản phẩm mẫu ${i + 1}`,
    sku: `SKU_${String(i + 1).padStart(3, '0')}`,
    price: 100000 + (i * 10000),
    stock: Math.floor(Math.random() * 100),
    image: `https://picsum.photos/seed/${i + 1}/100`
}));

interface PromotionItemConfig {
    discountPercent: number;
    discountQuantity: number;
}

// --- Props Interface ---
interface CreatePromotionProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promotionData: CreatePromotionRequest) => void;
}

const CreatePromotion: React.FC<CreatePromotionProps> = ({ isOpen, onClose, onSave }) => {
    // --- State ---
    const [formData, setFormData] = useState<Partial<CreatePromotionRequest>>({
        name: '',
        description: '',
        thumbnail_url: '',
        status: 'DRAFT',
        is_auto_active: true,
        start_at: '',
        end_at: ''
    });

    // --- Steps Configuration ---
    const [currentStep, setCurrentStep] = useState(0);
    const steps = [
        { id: 1, title: 'Thông tin chung' },
        { id: 2, title: 'Chọn sản phẩm' },
        { id: 3, title: 'Cấu hình giảm giá' },
        { id: 4, title: 'Hoàn tất' }
    ];

    // --- Product Selection State ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<(number | string)[]>([]);
    const [promotionItems, setPromotionItems] = useState<Record<number, PromotionItemConfig>>({});

    // Update promotionItems when inputs change
    const handlePromotionItemChange = (productId: number, field: keyof PromotionItemConfig, value: number) => {
        setPromotionItems(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    // Derived Lists
    const selectedProducts = useMemo(() =>
        MOCK_PRODUCTS.filter(p => selectedProductIds.includes(p.id)),
        [selectedProductIds]
    );

    const availableProducts = useMemo(() =>
        MOCK_PRODUCTS.filter(p => !selectedProductIds.includes(p.id)),
        [selectedProductIds]
    );

    // --- Columns Configuration ---
    const productModalColumns: ModalColumn<Product>[] = [
        {
            header: 'Sản phẩm',
            accessor: (item) => (
                <div className="flex items-center gap-3">
                    <img src={item.image} className="w-10 h-10 rounded border object-cover bg-gray-100" alt={item.name} />
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

    const productTableColumns: TableColumn<Product>[] = [
        {
            header: 'Thông tin sản phẩm',
            render: (p) => (
                <div className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded border object-cover bg-gray-100" alt={p.name} />
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
            <img src={p.image} className="w-16 h-16 rounded border object-cover bg-gray-50" alt="" />
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
        setCurrentStep(0);
        setSelectedProductIds([]);
        setPromotionItems({});
    }, []);

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, resetForm]);

    // --- Handlers ---
    const handleSaveClick = () => {
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
            end_at: formData.end_at
        };
        onSave(payload);
        onClose();
        // Reset form
        resetForm();
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
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Tạo chiến dịch</h2>
                    <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Vui lòng điền đầy đủ thông tin theo quy trình.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Responsive Stepper */}
            <div className="bg-gray-50/50 border-t border-gray-100 w-full">
                {/* Desktop Stepper */}
                <div className="hidden sm:flex items-center justify-between max-w-3xl mx-auto py-4 px-6">
                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none group">
                                <div className="flex items-center relative">
                                    <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all z-10
                            ${isActive ? 'bg-[#1462B0] border-[#1462B0] text-white shadow-md scale-110' : ''}
                            ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                            ${!isActive && !isCompleted ? 'bg-white border-gray-300 text-gray-400' : ''}
                         `}>
                                        {isCompleted ? <Check size={16} /> : index + 1}
                                    </div>
                                    <span className={`ml-3 text-sm font-medium transition-colors ${isActive ? 'text-[#1462B0]' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Stepper (Using ProgressBar) */}
                <div className="block sm:hidden px-4 py-3">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
                        <span className="text-[#1462B0] uppercase tracking-wider">Bước {currentStep + 1}/{steps.length}</span>
                        <span className="text-gray-800 font-bold">{steps[currentStep].title}</span>
                    </div>
                    <ProgressBar
                        progress={((currentStep + 1) / steps.length) * 100}
                        height="h-1.5"
                        barColor="bg-[#1462B0]"
                        showLabel={false}
                    />
                </div>
            </div>
        </div>
    );

    // --- Render Modal Body ---
    const renderModalBody = useCallback(() => {
        const values = formData;
        return (
            <div className="relative space-y-5 p-1 pr-2 max-w-5xl mx-auto">
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Main Info */}
                        <div className="panel bg-white rounded-lg col-span-2">
                            <label className="text-xl font-bold text-[#1462B0] mb-4 block border-b pb-2">Thông tin chiến dịch</label>
                            <div className="grid grid-cols-1 gap-y-3 gap-x-4 lg:grid-cols-2">
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

                {currentStep === 1 && (
                    <div className="h-[500px] -mx-4 sm:mx-0">
                        <SelectedItemsTable
                            data={selectedProducts}
                            columns={productTableColumns}
                            onRemove={(item) => setSelectedProductIds(prev => prev.filter(id => id !== item.id))}
                            onAdd={() => setIsProductModalOpen(true)}
                            title="Sản phẩm áp dụng"
                            emptyTitle="Chưa có sản phẩm nào"
                            emptyDescription="Vui lòng chọn sản phẩm để áp dụng khuyến mãi"
                            mobileRowRender={renderProductMobile}
                        />
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="h-[500px] -mx-4 sm:mx-0">
                        <Table
                            data={selectedProducts}
                            columns={[
                                {
                                    header: 'Sản phẩm',
                                    render: (p: Product) => (
                                        <div className="flex items-center gap-3">
                                            <img src={p.image} className="w-10 h-10 rounded border object-cover bg-gray-100" alt={p.name} />
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
                                }
                            ]}
                            customHeader={(
                                <div className="p-4 border-b border-gray-200 bg-white">
                                    <h3 className="text-lg font-bold text-gray-800">Thiết lập giá & kho</h3>
                                    <p className="text-sm text-gray-500">{selectedProducts.length} sản phẩm đã chọn</p>
                                </div>
                            )}
                        />
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="panel flex flex-col items-center justify-center p-6 sm:p-12 animate-in zoom-in-95 duration-300 h-full">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-sm">
                            <Check size={32} strokeWidth={3} className="sm:w-10 sm:h-10" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Đã sẵn sàng tạo!</h2>
                        <p className="text-gray-500 text-center max-w-md mb-8 text-sm sm:text-base">
                            Bạn đang tạo chiến dịch với <strong>{selectedProducts.length} sản phẩm</strong>. Vui lòng kiểm tra lại.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 w-full max-w-md border border-gray-200 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tên chiến dịch:</span>
                                <span className="font-medium text-gray-900 text-right">{formData.name || "Chưa đặt tên"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tổng sản phẩm:</span>
                                <span className="font-medium text-gray-900">{selectedProducts.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Trạng thái:</span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">Chờ chạy</span>
                            </div>
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
        `}</style>
            </div>
        );
    }, [formData, currentStep, selectedProducts, productTableColumns, renderProductMobile, renderField, renderRowImageUploading, promotionItems]);

    const renderModalFooter = () => (
        <div className="flex gap-2 w-full justify-end">
            {currentStep > 0 && (
                <button onClick={() => setCurrentStep(curr => curr - 1)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors">
                    Quay lại
                </button>
            )}
            {currentStep < steps.length - 1 ? (
                <button onClick={() => setCurrentStep(curr => curr + 1)} className="px-6 py-2 bg-[#1462B0] text-white font-medium rounded hover:bg-[#104e8b] transition-colors shadow-sm">
                    Tiếp tục
                </button>
            ) : (
                <button onClick={handleSaveClick} className="px-6 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors shadow-sm">
                    Hoàn tất & Tạo mới
                </button>
            )}
        </div>
    );

    return (
        <>
            <ModalCustom
                isOpen={isOpen}
                onClose={onClose}
                titleModal="TẠO CHIẾN DỊCH KHUYẾN MÃI"
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
            />
        </>
    );
};

export default CreatePromotion;
