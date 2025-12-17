'use client';

import React, { useState, useCallback } from 'react';
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
        { id: 2, title: 'Sản phẩm áp dụng' },
        { id: 3, title: 'Xác nhận' }
    ];

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
        setFormData({ name: '', description: '', thumbnail_url: '', status: 'DRAFT', is_auto_active: true, start_at: '', end_at: '' });
        setCurrentStep(0);
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
                    <div className="panel bg-white rounded-lg p-8 text-center text-gray-500">
                        <p>Chức năng thêm sản phẩm sẽ được phát triển ở bước tiếp theo.</p>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="panel bg-white rounded-lg p-8 text-center text-gray-500">
                        <p>Vui lòng kiểm tra lại thông tin trước khi hoàn tất.</p>
                        <div className="mt-4 text-left max-w-md mx-auto bg-gray-50 p-4 rounded text-sm">
                            <p><strong>Tên:</strong> {values.name}</p>
                            <p><strong>Bắt đầu:</strong> {String(values.start_at)}</p>
                            <p><strong>Kết thúc:</strong> {String(values.end_at)}</p>
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
    }, [formData, currentStep]);

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
    );
};

export default CreatePromotion;
