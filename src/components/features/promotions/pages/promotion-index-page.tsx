'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PromotionResponse } from '../models/response/promotion';
import { CreatePromotionRequest } from '../models/request/promotion';
import TablePromotion from '../components/TablePromotion';
import CreatePromotion from '../components/CreatePromotion';
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
                onEdit={(item) => console.log('Edit', item)}
                onDelete={(item) => console.log('Delete', item)}
            />

            <CreatePromotion
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSave={handleSaveNewPromotion}
            />
        </>
    );
};

export default PromotionIndexPage;
