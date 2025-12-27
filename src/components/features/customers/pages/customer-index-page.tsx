'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TableCustomer from '../components/TableCustomer';
import ViewCustomer from '../components/ViewCustomer';
import { CustomerResponse } from '../components/TableCustomer'; // Import type from Table
import { showToast } from '@/components/custom/custom-toast';

const CustomerIndexPage = () => {
    // --- State ---
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const itemsPerPage = 10;

    // --- Data Fetching ---
    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            // Note: Currently api/users returns all users. 
            // We might need to handle Filtering by Role='CUSTOMER' here or in API.
            // Assuming API structure: { success: true, count: number, data: User[] }
            const response = await fetch('/api/users');
            const data = await response.json();

            if (response.ok && data.success) {
                // Filter only customers
                const allUsers = data.data as CustomerResponse[];
                const customerUsers = allUsers.filter(u => u.role === 'CUSTOMER');

                // Client-side pagination (since API returns all)
                const start = (currentPage - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                setCustomers(customerUsers.slice(start, end));
                setTotalItems(customerUsers.length);
            } else {
                console.error("Failed to fetch customers:", data.message);
                showToast({ message: "Không tải được danh sách khách hàng", type: "error" });
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            showToast({ message: "Lỗi kết nối", type: "error" });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // --- Handlers ---
    const handleView = (customer: CustomerResponse) => {
        setSelectedCustomerId(customer._id);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsViewModalOpen(false);
        setSelectedCustomerId(null);
    };

    return (
        <>
            <TableCustomer
                data={customers}
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onView={handleView}
            />

            <ViewCustomer
                isOpen={isViewModalOpen}
                onClose={handleCloseModals}
                customerId={selectedCustomerId}
            />
        </>
    );
};

export default CustomerIndexPage;
