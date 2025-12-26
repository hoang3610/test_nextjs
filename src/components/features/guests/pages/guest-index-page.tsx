'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TableGuest from '../components/TableGuest';
import ViewGuest from '../components/ViewGuest';
import { GuestResponse } from '../models/response';
import { showToast } from '@/components/custom/custom-toast';

const GuestIndexPage = () => {
    // --- State ---
    const [guests, setGuests] = useState<GuestResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

    const itemsPerPage = 10;

    // --- Data Fetching ---
    const fetchGuests = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            const response = await fetch(`/api/guests?${params.toString()}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setGuests(data.data);
                setTotalItems(data.pagination?.total || 0);
            } else {
                console.error("Failed to fetch guests:", data.message);
                showToast({ message: "Không tải được danh sách khách hàng", type: "error" });
            }
        } catch (error) {
            console.error("Error fetching guests:", error);
            showToast({ message: "Lỗi kết nối", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        fetchGuests();
    }, [fetchGuests]);

    // --- Handlers ---
    const handleView = (guest: GuestResponse) => {
        setSelectedGuestId(guest._id);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsViewModalOpen(false);
        setSelectedGuestId(null);
    };

    return (
        <>
            <TableGuest
                data={guests}
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onView={handleView}
            />

            <ViewGuest
                isOpen={isViewModalOpen}
                onClose={handleCloseModals}
                guestId={selectedGuestId}
            />
        </>
    );
};

export default GuestIndexPage;
