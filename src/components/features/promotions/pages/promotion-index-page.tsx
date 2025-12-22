'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PromotionResponse } from '../models/response/promotion';
import { CreatePromotionRequest } from '../models/request/promotion';
import TablePromotion from '../components/TablePromotion';
import CreatePromotion from '../components/CreatePromotion';
import EditPromotion from '../components/EditPromotion';

import ModalConfirmCustom from '@/components/custom/modal-confirm-custom';
import { showToast } from '@/components/custom/custom-toast';
import { uploadImageClient } from '@/lib/cloudinary-client';

const PromotionIndexPage = () => {
    // --- State ---
    const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [promotionToDelete, setPromotionToDelete] = useState<PromotionResponse | null>(null);

    const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
    const [promotionToChangeStatus, setPromotionToChangeStatus] = useState<PromotionResponse | null>(null);
    const [targetStatus, setTargetStatus] = useState<'ACTIVE' | 'PAUSED' | 'DRAFT'>('ACTIVE');

    // --- Data Fetching ---
    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            const res = await fetch(`/api/promotions?${params.toString()}`);
            const data = await res.json();
            if (data.data) {
                setPromotions(data.data);
                setTotalItems(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch promotions', error);
            showToast({ message: "Lỗi tải dữ liệu chiến dịch", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    // --- Handlers ---
    const handleCreate = () => {
        setCreateModalOpen(true);
    };

    const handleSaveNewPromotion = async (newPromotion: CreatePromotionRequest) => {
        try {
            setIsLoading(true);
            // 1. Upload Banner Image if exists
            if (newPromotion.thumbnail_url) {
                // Check if it's base64/blob
                if (newPromotion.thumbnail_url.startsWith('data:')) {
                    const uploadedUrl = await uploadImageClient(newPromotion.thumbnail_url, 'ecommerce_promotions');
                    newPromotion.thumbnail_url = uploadedUrl;
                }
            }

            // 2. Call API
            const response = await fetch('/api/promotions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPromotion),
            });

            const data = await response.json();

            if (response.ok) {
                showToast({ message: "Tạo chiến dịch thành công!", type: "success" });
                setCreateModalOpen(false);
                fetchPromotions(); // Refresh list
            } else {
                showToast({ message: `Lỗi: ${data.error}`, type: "error" });
            }

        } catch (error) {
            console.error("Error creating promotion:", error);
            showToast({ message: "Có lỗi xảy ra khi tạo chiến dịch.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TablePromotion
                promotions={promotions}
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onCreate={handleCreate}
                // Actions (Temporarily disabled/placeholder as requested)
                onView={(item) => console.log('View', item)}
                onEdit={(item) => {
                    setSelectedPromotionId(item._id);
                    setIsEditModalOpen(true);
                }}
                onDelete={(item) => {
                    setPromotionToDelete(item);
                    setIsDeleteModalOpen(true);
                }}
                onChangeStatus={(item) => {
                    if (item.status === 'FINISHED') {
                        showToast({ message: "Không thể thay đổi trạng thái chiến dịch đã kết thúc", type: "warning" });
                        return;
                    }
                    const newStatus = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
                    setTargetStatus(newStatus);
                    setPromotionToChangeStatus(item);
                    setIsChangeStatusModalOpen(true);
                }}
            />

            <CreatePromotion
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSave={handleSaveNewPromotion}
            />

            <EditPromotion
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={async (data) => {
                    try {
                        setIsLoading(true);
                        // 1. Upload Banner Image if changed (starts with data:)
                        if (data.thumbnail_url && data.thumbnail_url.startsWith('data:')) {
                            const uploadedUrl = await uploadImageClient(data.thumbnail_url, 'ecommerce_promotions');
                            data.thumbnail_url = uploadedUrl;
                        }

                        // 2. Call API
                        const response = await fetch(`/api/promotions/${selectedPromotionId}/update`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        });

                        const resData = await response.json();

                        if (response.ok) {
                            showToast({ message: "Cập nhật chiến dịch thành công!", type: "success" });
                            setIsEditModalOpen(false);
                            fetchPromotions();
                        } else {
                            showToast({ message: `Lỗi: ${resData.error}`, type: "error" });
                        }

                    } catch (error) {
                        console.error("Error updating promotion:", error);
                        showToast({ message: "Có lỗi xảy ra khi cập nhật chiến dịch.", type: "error" });
                    } finally {
                        setIsLoading(false);
                    }
                }}
                promotionId={selectedPromotionId}
            />

            <ModalConfirmCustom
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                titleModal="Xác nhận xóa"
                typeIcon="warning"
                content={`Bạn có chắc chắn muốn xóa chiến dịch "${promotionToDelete?.name}" không? Hành động này không thể hoàn tác.`}
                onConfirm={async () => {
                    if (!promotionToDelete) return;
                    setIsLoading(true);
                    try {
                        const res = await fetch(`/api/promotions/${promotionToDelete._id}/delete`, { // User's custom route
                            method: 'DELETE'
                        });
                        if (res.ok) {
                            showToast({ message: "Xóa chiến dịch thành công", type: "success" });
                            fetchPromotions();
                            setIsDeleteModalOpen(false);
                        } else {
                            const data = await res.json();
                            showToast({ message: data.error || "Xóa thất bại", type: "error" });
                        }
                    } catch (error) {
                        showToast({ message: "Lỗi kết nối", type: "error" });
                    } finally {
                        setIsLoading(false);
                    }
                }}
            />

            <ModalConfirmCustom
                isOpen={isChangeStatusModalOpen}
                onClose={() => setIsChangeStatusModalOpen(false)}
                titleModal="Xác nhận thay đổi trạng thái"
                typeIcon="warning"
                content={
                    <span>
                        Bạn có chắc chắn muốn chuyển trạng thái chiến dịch "<strong>{promotionToChangeStatus?.name}</strong>" sang{' '}
                        <span className={`font-bold ${targetStatus === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {targetStatus === 'ACTIVE' ? 'ĐANG CHẠY' : 'TẠM DỪNG'}
                        </span> không?
                    </span>
                }
                onConfirm={async () => {
                    if (!promotionToChangeStatus) return;
                    setIsLoading(true);
                    try {
                        const res = await fetch(`/api/promotions/${promotionToChangeStatus._id}/change-status`, { // User's custom route
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: targetStatus })
                        });
                        if (res.ok) {
                            showToast({ message: "Cập nhật trạng thái thành công", type: "success" });
                            fetchPromotions();
                            setIsChangeStatusModalOpen(false);
                        } else {
                            const data = await res.json();
                            showToast({ message: data.error || "Cập nhật thất bại", type: "error" });
                        }
                    } catch (error) {
                        showToast({ message: "Lỗi kết nối", type: "error" });
                    } finally {
                        setIsLoading(false);
                    }
                }}
            />
        </>
    );
};

export default PromotionIndexPage;
