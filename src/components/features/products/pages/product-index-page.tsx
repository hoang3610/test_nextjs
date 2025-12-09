'use client';

import React, { useState, useEffect, useCallback } from 'react';

// --- Imports ---
import TableProduct from '../components/TableProduct';
import { ProductResponse as Product } from '../models/response/product';
import CreateProduct from '../components/CreateProduct';
import EditProduct, { ProductFormState } from '../components/EditProduct';

import { showToast } from '@/components/custom/custom-toast';

const ProductIndexPage = () => {
  // --- State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isViewMode, setViewMode] = useState(false);

  // --- Handlers ---
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        // Map API data to Frontend Interface
        const mappedProducts: Product[] = data.data.map((item: any) => ({
          id: item._id,
          name: item.name,
          slug: item.slug,
          thumbnail_url: item.thumbnail_url,
          category_id: item.category_id,
          brand_id: item.brand_id,
          is_active: item.is_active,
          has_variants: item.has_variants,
          skus: item.skus,
          attributes_summary: item.attributes_summary,
          description: item.description,
        }));

        setProducts(mappedProducts);
        setTotalItems(data.pagination.total);
      } else {
        console.error("Failed to fetch products:", data.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Helper: Fetch Detail ---
  const fetchProductDetail = async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`/api/products/${id}/detail`);
      const data = await response.json();

      if (response.ok) {
        // Map API response to Frontend Interface
        return {
          id: data._id,
          name: data.name,
          slug: data.slug,
          thumbnail_url: data.thumbnail_url,
          category_id: data.category_id,
          brand_id: data.brand_id,
          is_active: data.is_active,
          has_variants: data.has_variants,
          skus: data.skus,
          attributes_summary: data.attributes_summary,
          description: data.description,
          price: data.skus?.[0]?.price || 0,
          original_price: data.skus?.[0]?.original_price || 0,
          stock: data.skus?.[0]?.stock || 0,
        };
      } else {
        console.error("Failed to fetch product detail:", data.error);
        alert("Không thể lấy thông tin chi tiết sản phẩm.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      alert("Lỗi kết nối khi lấy chi tiết sản phẩm.");
      return null;
    }
  };

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveNewProduct = async (newData: any) => {
    // Transform data for API
    try {
      const payload: any = {
        name: newData.name,
        slug: newData.slug,
        category_id: newData.category_id,
        product_type: newData.product_type,
        is_active: newData.is_app_visible, // Map UI field to API
        thumbnail_url: newData.images, // Use main image for thumbnail
        description: newData.description,
        has_variants: newData.has_variants,
        skus: [],
        attributes_summary: []
      };

      console.log("payload", payload)
      console.log("newData", newData)

      if (newData.has_variants) {
        // Map Variants
        // 1. Build attributes_summary
        payload.attributes_summary = newData.product_attributes.map((attr: any) => ({
          name: attr.name,
          code: attr.name.toLowerCase(), // Simple Code generation
          values: attr.values
        }));

        // 2. Build SKUs
        payload.skus = newData.variants.map((v: any) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          original_price: v.original_price || newData.original_price,
          is_active: true,
          attributes: Object.entries(v.attributes).map(([key, value]) => ({
            name: key,
            code: key.toLowerCase(),
            value: value
          }))
        }));
      } else {
        // Single SKU
        payload.skus.push({
          sku: 'defaut', // Hardcoded as per user request
          price: newData.price || 0, // Should use price
          stock: newData.stock,
          original_price: newData.original_price,
          is_default: true,
          is_active: true,
          attributes: []
        });
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setCreateModalOpen(false);
        fetchProducts();
        showToast({ message: "Tạo sản phẩm thành công!", type: "success" })
      } else {
        console.error("Create failed", data);
        showToast({ message: `Lỗi: ${data.error}`, type: "error" })
      }

    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra khi tạo sản phẩm");
    }
  };

  const handleView = async (product: Product) => {
    // Optimistic
    setSelectedProduct(product);
    setViewMode(true);
    setEditModalOpen(true);

    // Fetch fresh data
    const detailedProduct = await fetchProductDetail(product.id);
    if (detailedProduct) {
      setSelectedProduct(detailedProduct);
    }
  };

  const handleEdit = async (product: Product) => {
    // Optimistic
    setSelectedProduct(product);
    setViewMode(false);
    setEditModalOpen(true);

    // Fetch fresh data
    const detailedProduct = await fetchProductDetail(product.id);
    if (detailedProduct) {
      setSelectedProduct(detailedProduct);
    }
  };

  const handleSaveEditedProduct = async (editedData: Partial<ProductFormState>) => {
    // Logic similar to handleSaveNewProduct but for update
    try {
      if (!selectedProduct?.id) return;

      const payload: any = {
        name: editedData.name,
        slug: editedData.slug,
        description: editedData.description,
        thumbnail_url: editedData.thumbnail_url || editedData.images, // Fallback if images used or thumbnail_url
        category_id: typeof editedData.category_id === 'string' ? editedData.category_id : editedData.category_id?._id,
        brand_id: typeof editedData.brand_id === 'string' ? editedData.brand_id : editedData.brand_id?._id,
        is_active: editedData.is_active,
        has_variants: editedData.has_variants,
        skus: [],
        attributes_summary: []
      };

      if (editedData.has_variants) {
        // 1. Build attributes_summary
        payload.attributes_summary = editedData.product_attributes?.map((attr: any) => ({
          name: attr.name,
          code: attr.name.toLowerCase(),
          values: attr.values
        })) || [];

        // 2. Build SKUs
        payload.skus = editedData.variants?.map((v: any) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          original_price: v.original_price || editedData.original_price,
          is_active: true,
          attributes: v.attributes ? Object.entries(v.attributes).map(([key, value]) => ({
            name: key,
            code: key.toLowerCase(),
            value: String(value),
            // meta_value: ... if available
          })) : []
        })) || [];
      } else {
        // Single SKU
        payload.skus.push({
          sku: 'defaut', // Hardcoded as per user request
          price: editedData.price || 0,
          stock: editedData.stock || 0,
          original_price: editedData.original_price || 0,
          is_default: true,
          is_active: true,
          attributes: []
        });
      }

      const response = await fetch(`/api/products/${selectedProduct.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      await response.json();
      setEditModalOpen(false);
      fetchProducts();
      showToast({ message: "Cập nhật sản phẩm thành công!", type: "success" })

    } catch (error) {
      console.error("Error updating product:", error);
      showToast({ message: "Lỗi cập nhật sản phẩm", type: "error" })
    }
  };

  const handleCloseModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <TableProduct
        products={products}
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
      />
      <CreateProduct
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveNewProduct}
      />
      {selectedProduct && (
        <EditProduct
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveEditedProduct}
          productData={selectedProduct as any}
          isViewMode={isViewMode}
        />
      )}
    </>
  );
};

export default ProductIndexPage;