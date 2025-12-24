'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { OrderResponse } from '../models/response/order';
import TableOrder from '../components/TableOrder';
import ViewOrder from '../components/ViewOrder';
import { showToast } from '@/components/custom/custom-toast';

const OrderIndexPage = () => {
    // --- State ---
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            // Check api/orders/route.ts to see if it supports pagination
            // Currently it returns all. We can implement client-side slicing or update API later.
            // For now, let's fetch all and slice client-side or assume API handles it if updated.
            // Based on route.ts code: `const orders = await Order.find({}).sort({ createdAt: -1 }).populate('items');`
            // It does NOT support pagination yet. So we slice client-side for now or just display all.
            // Let's rely on standard fetch and display.

            const res = await fetch('/api/orders');
            const result = await res.json();

            if (result.success && result.data) {
                // Client-side pagination logic since API returns all
                const allOrders = result.data;
                setTotalItems(allOrders.length);

                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedOrders = allOrders.slice(startIndex, endIndex);

                setOrders(paginatedOrders);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
            showToast({ message: "Lỗi tải danh sách đơn hàng", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <>
            <TableOrder
                orders={orders}
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                // Actions
                onView={(item) => {
                    setSelectedOrderId(item._id);
                    setIsViewModalOpen(true);
                }}
            />

            <ViewOrder
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                orderId={selectedOrderId}
            />
        </>
    );
};

export default OrderIndexPage;
