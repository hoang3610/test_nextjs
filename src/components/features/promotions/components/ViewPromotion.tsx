'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, Loader2, Package, Percent, Calendar, Activity, Edit3, Play, Pause, Square } from 'lucide-react';
import { format } from 'date-fns';

// --- Imports ---
import { ModalCustom } from '@/components/custom/modal-custom';
import ModalConfirmCustom from '@/components/custom/modal-confirm-custom';
import { showToast } from '@/components/custom/custom-toast';
import { useRouter } from 'next/navigation';
import { TableWithFilters } from '@/components/custom/table-with-filters';
import EditPromotion from './EditPromotion'; // Ensure correct path
import { CreatePromotionRequest } from '../models/request/promotion';
import { uploadImageClient } from '@/lib/cloudinary-client';

// --- Interfaces ---
interface PromotionItemConfig {
    discountPercent: number;
    discountQuantity: number;
}

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
    skus: ProductSku[];
}

interface ViewPromotionProps {
    isOpen: boolean;
    onClose: () => void;
    promotionId: string | null;
    onUpdate?: () => void;
}

const ViewPromotion: React.FC<ViewPromotionProps> = ({ isOpen, onClose, promotionId, onUpdate }) => {
    const router = useRouter();
    // --- State ---
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConfirmStopOpen, setIsConfirmStopOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        thumbnail_url: '',
        status: '',
        is_auto_active: false,
        start_at: '',
        end_at: ''
    });

    // --- Table State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // --- Product Data State ---
    const [productList, setProductList] = useState<Product[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<(number | string)[]>([]);
    const [promotionItems, setPromotionItems] = useState<Record<string | number, PromotionItemConfig>>({});

    // --- Handlers ---
    const handleUpdatePromotion = async (data: CreatePromotionRequest) => {
        try {
            setIsLoadingData(true);
            // 1. Upload Banner Image if changed
            if (data.thumbnail_url && data.thumbnail_url.startsWith('data:')) {
                const uploadedUrl = await uploadImageClient(data.thumbnail_url, 'ecommerce_promotions');
                data.thumbnail_url = uploadedUrl;
            }

            // 2. Call API
            const response = await fetch(`/api/promotions/${promotionId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (response.ok) {
                showToast({ message: "Cập nhật chiến dịch thành công!", type: "success" });
                setIsEditOpen(false);
                // Trigger refresh by re-fetching detail
                // We can do this by toggling a refresh trigger or just letting the effect run if we depended on something better
                // For now, simpler to just force re-run fetchDetail logic conceptually?
                // Actually, since promotionId doesn't change, we might need to manually trigger fetch.
                // Let's break out fetchDetail logic or just set a refresh trigger.
                setRefreshTrigger(prev => prev + 1);
                if (onUpdate) onUpdate();
            } else {
                showToast({ message: `Lỗi: ${resData.error}`, type: "error" });
            }

        } catch (error) {
            console.error("Error updating promotion:", error);
            showToast({ message: "Có lỗi xảy ra khi cập nhật chiến dịch.", type: "error" });
        } finally {
            setIsLoadingData(false);
        }
    };


    // Fetch Products (Always fetch to have the 'pool' available for mapping)
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
                        const productIdRaw = item.product_id?._id || item.product_id;
                        const parentProduct = productList.find(p => String(p.id) === String(productIdRaw));
                        let selectionId: string | number | undefined;

                        if (parentProduct) {
                            if (item.sku && parentProduct.skus && parentProduct.skus.length > 0) {
                                const skuObj = parentProduct.skus.find(s => s.sku === item.sku);
                                if (skuObj) selectionId = skuObj.id;
                            } else {
                                selectionId = parentProduct.id;
                            }
                        }

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
    }, [isOpen, promotionId, productList, refreshTrigger]);

    // Data Calculation for Stats
    const stats = useMemo(() => {
        // 1. Total Items (SKUs/Products configured)
        const totalItems = Object.keys(promotionItems).length;

        // 2. Max Discount
        let maxDiscount = 0;
        Object.values(promotionItems).forEach(item => {
            if (item.discountPercent > maxDiscount) maxDiscount = item.discountPercent;
        });

        // 3. Duration (Days)
        let durationText = 'N/A';
        if (formData.start_at && formData.end_at) {
            const start = new Date(formData.start_at);
            const end = new Date(formData.end_at);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            durationText = `${days} ngày`;
        }

        // 4. Status (Using formatted string)
        const statusMap: Record<string, string> = {
            'ACTIVE': 'Đang chạy',
            'PAUSED': 'Tạm dừng',
            'DRAFT': 'Chưa bắt đầu',
            'FINISHED': 'Đã kết thúc'
        };
        const statusText = statusMap[formData.status as string] || formData.status || 'N/A';

        return [
            {
                title: 'Sản phẩm tham gia',
                value: totalItems.toString(),
                icon: Package,
                color: 'bg-blue-500',
                meta: 'Tổng mã hàng áp dụng'
            },
            {
                title: 'Mức giảm sâu nhất',
                value: `${maxDiscount}%`,
                icon: Percent,
                color: 'bg-orange-500',
                meta: 'Ưu đãi cao nhất'
            },
            {
                title: 'Thời gian chạy',
                value: durationText,
                icon: Calendar,
                color: 'bg-purple-500',
                meta: formData.end_at ? `Đến: ${format(new Date(formData.end_at), 'dd/MM/yyyy')}` : 'N/A'
            },
            {
                title: 'Trạng thái',
                value: statusText,
                icon: Activity,
                color: formData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500',
                meta: formData.is_auto_active ? 'Tự động kích hoạt' : 'Thủ công'
            }
        ];
    }, [promotionItems, formData]);


    // Derived Lists for Table
    const displayedProducts = useMemo(() => {
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
        result.forEach(item => unique.set(item.id, item));
        return Array.from(unique.values());
    }, [selectedProductIds, productList]);

    // Filtering & Pagination
    const filteredProducts = useMemo(() => {
        let data = displayedProducts;

        // 1. Filter by Tab
        if (activeTab === 'expiring') {
            data = data.filter(p => {
                const quantity = promotionItems[p.id]?.discountQuantity || 0;
                return quantity <= 10;
            });
        }

        // 2. Filter by Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.sku.toLowerCase().includes(lowerTerm)
            );
        }
        return data;
    }, [displayedProducts, searchTerm, activeTab, promotionItems]);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);


    // --- Handlers ---
    const handleStatusChange = async (newStatus: 'ACTIVE' | 'PAUSED' | 'FINISHED') => {
        try {
            setIsLoadingData(true);
            const res = await fetch(`/api/promotions/${promotionId}/change-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                showToast({ message: "Cập nhật trạng thái thành công", type: "success" });
                setRefreshTrigger(prev => prev + 1);
                if (onUpdate) onUpdate();
            } else {
                const data = await res.json();
                showToast({ message: data.error || "Cập nhật thất bại", type: "error" });
            }
        } catch (error) {
            showToast({ message: "Lỗi kết nối", type: "error" });
        } finally {
            setIsLoadingData(false);
        }
    };

    // --- Helper Components ---
    const StatusBadge = ({ status }: { status: 'running' | 'upcoming' | 'ended' | 'paused' | 'draft' }) => {
        const styles = {
            running: "bg-green-100 text-green-700 border-green-200",
            upcoming: "bg-blue-100 text-blue-700 border-blue-200",
            ended: "bg-gray-100 text-gray-600 border-gray-200",
            paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
            draft: "bg-gray-100 text-gray-500 border-gray-200",
        };
        const labels = {
            running: "Đang diễn ra",
            upcoming: "Sắp diễn ra",
            ended: "Đã kết thúc",
            paused: "Tạm dừng",
            draft: "Chưa bắt đầu"
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit ${styles[status]}`}>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'running' ? 'bg-green-500' : status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                {labels[status]}
            </span>
        );
    };

    // --- Custom Header Render ---
    const renderCustomHeader = () => {
        const getStatus = (): 'running' | 'upcoming' | 'ended' | 'paused' | 'draft' => {
            if (!formData.status) return 'upcoming';
            if (formData.status === 'FINISHED') return 'ended';
            if (formData.status === 'DRAFT') return 'draft';
            if (formData.status === 'PAUSED') return 'paused';

            const now = new Date();
            const start = formData.start_at ? new Date(formData.start_at) : null;
            const end = formData.end_at ? new Date(formData.end_at) : null;

            if (start && now < start) return 'upcoming';
            // if (end && now > end) return 'ended'; // Removed client-side expiry (trust backend status)
            return 'running';
        };

        const status = getStatus();

        // Button Styles Helper
        const btnBase = "px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed";

        return (
            <div className="bg-white border-b border-gray-200 flex-shrink-0 z-10 w-full rounded-t-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-6 sm:py-4 gap-3 sm:gap-4">
                    {/* Left Section: Title & Badge */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="flex items-start justify-between sm:justify-start gap-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-1">
                                    {formData.name || 'THỐNG KÊ CHIẾN DỊCH'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {formData.description || 'Chi tiết hiệu quả'}
                                </p>
                            </div>
                            {/* Mobile Close Button */}
                            <button
                                onClick={onClose}
                                className="sm:hidden -mr-2 p-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <StatusBadge status={status} />
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 hide-scrollbar">
                        {/* Edit Button */}
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className={`${btnBase} bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap`}
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Chỉnh sửa
                        </button>

                        {/* Pause/Resume Button */}
                        {['ACTIVE', 'PAUSED'].includes(formData.status) && (
                            <button
                                onClick={() => handleStatusChange(formData.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
                                className={`${btnBase} ${formData.status === 'ACTIVE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'} whitespace-nowrap`}
                            >
                                {formData.status === 'ACTIVE' ? (
                                    <>
                                        <Pause className="w-3.5 h-3.5" />
                                        Tạm dừng
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5" />
                                        Tiếp tục
                                    </>
                                )}
                            </button>
                        )}

                        {/* Stop Button */}
                        {['ACTIVE', 'PAUSED'].includes(formData.status) && (
                            <button
                                onClick={() => setIsConfirmStopOpen(true)}
                                className={`${btnBase} bg-red-50 text-red-700 border-red-200 whitespace-nowrap`}
                            >
                                <Square className="w-3.5 h-3.5 fill-red-700" />
                                Kết thúc
                            </button>
                        )}

                        {/* Desktop Separator & Close */}
                        <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

                        <button onClick={onClose} className="hidden sm:block p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Render Modal Body ---
    const renderModalBody = useCallback(() => {
        if (isLoadingData) {
            return (
                <div className="flex flex-col items-center justify-center h-[300px]">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500">Đang tải dữ liệu chiến dịch...</p>
                </div>
            )
        }

        const allCount = displayedProducts.length;
        const expiringCount = displayedProducts.filter(p => (promotionItems[p.id]?.discountQuantity || 0) <= 10).length;

        return (
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-3 rounded-xl text-white shadow-sm`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                                <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
                                {stat.meta && <p className="text-xs text-gray-400 mt-1">{stat.meta}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Products Table */}
                <TableWithFilters
                    title="Chi tiết sản phẩm"
                    description="Danh sách các sản phẩm đang được áp dụng trong chiến dịch này."
                    data={paginatedProducts}
                    tabs={[
                        { value: 'all', label: 'Tất cả', count: allCount },
                        { value: 'expiring', label: 'Sắp hết hạn', count: expiringCount }
                    ]}
                    activeTab={activeTab}
                    onTabChange={(val) => {
                        setActiveTab(val);
                        setCurrentPage(1);
                    }}
                    onSearch={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    onAdd={() => setIsEditOpen(true)}
                    addText="Thêm sản phẩm"
                    columns={[
                        {
                            header: 'Sản phẩm',
                            render: (p: Product) => (
                                <div className="flex items-center gap-3">
                                    <img src={p.image || 'https://placehold.co/40'} className="w-10 h-10 rounded-lg border object-cover bg-gray-100" alt={p.name} />
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
                            className: 'text-center font-bold text-blue-600',
                            render: (p: Product) => `${promotionItems[p.id]?.discountPercent || 0}%`
                        },
                        {
                            header: 'Sau giảm',
                            className: 'text-right font-mono text-red-600 font-bold',
                            render: (p: Product) => {
                                const discountPercent = promotionItems[p.id]?.discountPercent || 0;
                                const discountedPrice = p.price * (1 - discountPercent / 100);
                                return `${discountedPrice.toLocaleString()}₫`;
                            }
                        },
                        {
                            header: 'SL',
                            className: 'text-center',
                            render: (p: Product) => {
                                const qty = promotionItems[p.id]?.discountQuantity ?? p.stock;
                                const isLow = qty <= 10;
                                return (
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${isLow ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {qty}
                                    </span>
                                )
                            }
                        }
                    ]}
                    pagination={{
                        currentPage: currentPage,
                        totalPages: Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
                        totalItems: filteredProducts.length,
                        itemsPerPage: ITEMS_PER_PAGE,
                        onPageChange: setCurrentPage
                    }}
                    isLoading={isLoadingData}
                />
            </div>
        );
    }, [stats, isLoadingData, paginatedProducts, filteredProducts.length, currentPage, promotionItems, displayedProducts, activeTab]);

    const renderModalFooter = () => (
        <div className="flex gap-2 w-full justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition-colors">
                Đóng
            </button>
        </div>
    );

    return (
        <>
            <ModalCustom
                isOpen={isOpen}
                onClose={onClose}
                modalSize="6xl" // Wider to fit table better
                titleModal=""
                customHeader={renderCustomHeader()}
                bodyModal={renderModalBody()}
                footerModal={renderModalFooter()}
                className="!p-0"
            />

            {/* Nested Edit Promotion Modal (Stacks on top) */}
            <EditPromotion
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleUpdatePromotion}
                promotionId={promotionId}
            />

            <ModalConfirmCustom
                isOpen={isConfirmStopOpen}
                onClose={() => setIsConfirmStopOpen(false)}
                titleModal="Xác nhận kết thúc"
                typeIcon="error"
                content={
                    <span>
                        Bạn có chắc chắn muốn <strong>kết thúc</strong> và lưu trữ chiến dịch này không? Hoạt động này không thể hoàn tác.
                    </span>
                }
                onConfirm={async () => {
                    setIsLoadingData(true);
                    try {
                        const res = await fetch(`/api/promotions/${promotionId}/change-status`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'FINISHED' })
                        });
                        if (res.ok) {
                            showToast({ message: "Đã kết thúc chiến dịch", type: "success" });
                            setIsConfirmStopOpen(false);
                            onClose(); // Close View Modal
                            if (onUpdate) onUpdate(); // Refresh parent list
                            router.push('/admin/promotions'); // Navigate as requested
                        } else {
                            showToast({ message: "Không thể kết thúc", type: "error" });
                        }
                    } catch (e) {
                        showToast({ message: "Lỗi kết nối", type: "error" });
                    } finally {
                        setIsLoadingData(false);
                    }
                }}
            />
        </>
    );
};

export default ViewPromotion;
