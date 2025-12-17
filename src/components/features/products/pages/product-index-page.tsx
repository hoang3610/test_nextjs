'use client';

import React, { useState, useEffect, useCallback } from 'react';

// --- Imports ---
import TableProduct from '../components/TableProduct';
import { ProductResponse as Product } from '../models/response/product';
import CreateProduct from '../components/CreateProduct';
import EditProduct, { ProductFormState } from '../components/EditProduct';

import { showToast } from '@/components/custom/custom-toast';
import ModalConfirmCustom from '@/components/custom/modal-confirm-custom';
import { uploadImageClient } from '@/lib/cloudinary-client';

const ProductIndexPage = () => {
  // --- State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Add categories state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isViewMode, setViewMode] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'DELETE' | 'CHANGE_STATUS' | null;
    product: Product | null;
    title: string;
    content: string;
  }>({
    isOpen: false,
    type: null,
    product: null,
    title: '',
    content: '',
  });

  // --- Handlers ---
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        t: new Date().getTime().toString(), // Cache busting
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
          is_featured: item.is_featured,
          has_variants: item.has_variants,
          skus: item.skus,
          attributes_summary: item.attributes_summary,
          description: item.description,
          min_price: item.min_price,
          max_price: item.max_price,
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
    // Fetch categories once on mount
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?limit=100&is_active=true');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
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
          image_urls: data.image_urls,
          image_mobile_urls: data.image_mobile_urls,
          has_variants: data.has_variants,
          skus: data.skus,
          attributes_summary: data.attributes_summary,
          short_description: data.short_description,
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
      setIsLoading(true); // Add loading state if not already handled nicely globally or add local loading

      // Upload images first
      let finalImageUrls: string[] = [];
      if (newData.image_urls && newData.image_urls.length > 0) {
        finalImageUrls = await Promise.all(
          newData.image_urls.map((url: string) => uploadImageClient(url))
        );
      }

      let finalMobileImageUrls: string[] = [];
      if (newData.image_mobile_urls && newData.image_mobile_urls.length > 0) {
        finalMobileImageUrls = await Promise.all(
          newData.image_mobile_urls.map((url: string) => uploadImageClient(url))
        );
      }

      const payload: any = {
        name: newData.name,
        slug: newData.slug,
        category_id: newData.category_id,
        product_type: newData.product_type,
        is_active: newData.is_active,
        is_featured: newData.is_featured || false,
        thumbnail_url: finalImageUrls?.[0] || '',
        image_urls: finalImageUrls,
        image_mobile_urls: finalMobileImageUrls,
        short_description: newData.short_description,
        description: newData.description,
        has_variants: newData.has_variants,
        skus: [],
        attributes_summary: []
      };

      if (newData.has_variants) {
        // Map Variants
        // 1. Build attributes_summary
        payload.attributes_summary = newData.product_attributes.map((attr: any) => ({
          name: attr.name,
          code: attr.name.toLowerCase(), // Simple Code generation
          values: attr.values
        }));

        // Upload variant images
        let finalVariants = await Promise.all(
          newData.variants.map(async (v: any) => {
            let finalVariantImageUrl = v.image_url;
            if (v.image_url && v.image_url.startsWith('data:')) {  // Basic check for new upload
              finalVariantImageUrl = await uploadImageClient(v.image_url);
            }
            return { ...v, image_url: finalVariantImageUrl };
          })
        );


        // 2. Build SKUs
        payload.skus = finalVariants.map((v: any) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          original_price: v.original_price || newData.original_price,
          image_url: v.image_url, // Map image_url to image_url field in API
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
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);

      // Upload images first
      let finalImageUrls: string[] = [];
      if (editedData.image_urls && editedData.image_urls.length > 0) {
        finalImageUrls = await Promise.all(
          editedData.image_urls.map((url: string) => uploadImageClient(url))
        );
      }

      let finalMobileImageUrls: string[] = [];
      if (editedData.image_mobile_urls && editedData.image_mobile_urls.length > 0) {
        finalMobileImageUrls = await Promise.all(
          editedData.image_mobile_urls.map((url: string) => uploadImageClient(url))
        );
      }

      const payload: any = {
        name: editedData.name,
        slug: editedData.slug,
        short_description: editedData.short_description,
        description: editedData.description,
        thumbnail_url: finalImageUrls?.[0] || editedData.thumbnail_url || '',
        category_id: typeof editedData.category_id === 'string' ? editedData.category_id : editedData.category_id?._id,
        brand_id: typeof editedData.brand_id === 'string' ? editedData.brand_id : editedData.brand_id?._id,
        is_active: editedData.is_active,
        is_featured: editedData.is_featured,
        image_urls: finalImageUrls,
        image_mobile_urls: finalMobileImageUrls,
        has_variants: editedData.has_variants,
        skus: [],
        attributes_summary: []
      };

      if (editedData.has_variants) {
        // 1. Build attributes_summary
        payload.attributes_summary = editedData.product_attributes?.map((attr: any) => ({
          name: attr.name,
          code: attr.name.toLowerCase(), // Simple Code generation
          values: attr.values
        })) || [];

        // Upload variant images
        let finalVariants = [];
        if (editedData.variants) {
          finalVariants = await Promise.all(
            editedData.variants.map(async (v: any) => {
              let finalVariantImageUrl = v.image_url;
              if (v.image_url && v.image_url.startsWith('data:')) {
                finalVariantImageUrl = await uploadImageClient(v.image_url);
              }
              return { ...v, image_url: finalVariantImageUrl };
            })
          );
        }

        // 2. Build SKUs
        payload.skus = finalVariants.map((v: any) => ({
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          original_price: v.original_price || editedData.original_price,
          image_url: v.image_url, // Map image_url to image_url field
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      type: 'DELETE',
      product: product,
      title: 'Xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không?`,
    });
  };

  const handleChangeStatus = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      type: 'CHANGE_STATUS',
      product: product,
      title: 'Thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn thay đổi trạng thái sản phẩm "${product.name}" không?`,
    });
  };

  const handleToggleFeatured = async (product: any) => {
    try {
      const response = await fetch(`/api/products/${product.id}/change-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !product.is_featured })
      });

      if (response.ok) {
        showToast({ message: "Cập nhật trạng thái nổi bật thành công!", type: "success" });
        fetchProducts();
      } else {
        const data = await response.json();
        showToast({ message: `Lỗi: ${data.error}`, type: "error" });
      }
    } catch (e) {
      console.error(e);
      showToast({ message: "Lỗi kết nối", type: "error" });
    }
  };

  const handleCloseModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.product || !confirmModal.type) return;

    const { type, product } = confirmModal;

    try {
      if (type === 'DELETE') {
        const response = await fetch(`/api/products/${product.id}/delete`);
        if (response.ok) {
          showToast({ message: "Xóa sản phẩm thành công!", type: "success" });
          fetchProducts();
        } else {
          const data = await response.json();
          showToast({ message: `Xóa sản phẩm thất bại: ${data.error}`, type: "error" });
        }
      } else if (type === 'CHANGE_STATUS') {
        const response = await fetch(`/api/products/${product.id}/change-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: !product.is_active })
        });
        if (response.ok) {
          showToast({ message: "Thay đổi trạng thái sản phẩm thành công!", type: "success" });
          fetchProducts();
        } else {
          const data = await response.json();
          showToast({ message: `Thay đổi trạng thái sản phẩm thất bại: ${data.error}`, type: "error" });
        }
      }
    } catch (error) {
      console.error(`Error ${type === 'DELETE' ? 'deleting' : 'changing status'} product:`, error);
      showToast({ message: `Có lỗi xảy ra khi ${type === 'DELETE' ? 'xóa' : 'thay đổi trạng thái'} sản phẩm.`, type: "error" });
    } finally {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <>
      {/* Debug Products State */}
      <TableProduct
        products={products}
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onCreate={handleCreate}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
        onToggleFeatured={handleToggleFeatured}
      />
      <CreateProduct
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveNewProduct}
        categories={categories} // Pass categories
      />
      {selectedProduct && (
        <EditProduct
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveEditedProduct}
          productData={selectedProduct as any}
          isViewMode={isViewMode}
          categories={categories} // Pass categories
        />
      )}
      <ModalConfirmCustom
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        titleModal={confirmModal.title}
        content={confirmModal.content}
        typeIcon="warning"
      />
    </>
  );
};

export default ProductIndexPage;