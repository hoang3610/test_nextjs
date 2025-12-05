'use client';

import React, { useState, useMemo } from 'react';

// --- Imports ---
import TableProduct from '../components/TableProduct';
import CreateProduct from '../components/CreateProduct';
import EditProduct from '../components/EditProduct';

// --- Interface ---
interface Product {
  id: string;
  name: string;
  price_original: number;
  category_id: number;
  product_type: number;
  is_app_visible: boolean;
  skus: {
    sku: string;
    dimension_length: number;
    dimension_width: number;
    dimension_height: number;
    weight: number;
  };
  images: string;
  images_mobile: string;
  short_description: string;
  brand?: string;
  stock?: number;
  status?: string;
}

// --- Mock Data ---
const initialProducts: Product[] = [
  {
    id: 'PRD-001',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-002',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-003',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-004',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-005',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-006',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-007',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-008',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-001', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-009',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-009', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  {
    id: 'PRD-010',
    name: 'Áo Thun Basic',
    price_original: 250000,
    category_id: 1,
    product_type: 1,
    is_app_visible: true,
    skus: { sku: 'AT-010', dimension_length: 30, dimension_width: 20, dimension_height: 5, weight: 200 },
    images: 'https://placehold.co/40',
    images_mobile: '',
    short_description: 'Mô tả ngắn',
    stock: 100,
    status: 'active',
  },
  // ... more mock data if needed
];

const ProductIndexPage = () => {
  // --- State ---
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isViewMode, setViewMode] = useState(false);
  const itemsPerPage = 8;

  // --- Handlers ---
  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleSaveNewProduct = (newProduct: Partial<Product>) => {
    const fullProduct: Product = {
      id: `PRD-${Date.now()}`, // Simple ID generation
      ...newProduct,
    } as Product;
    setProducts([fullProduct, ...products]);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setViewMode(true);
    setEditModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setViewMode(false);
    setEditModalOpen(true);
  };

  const handleSaveEditedProduct = (editedProduct: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === editedProduct.id ? { ...p, ...editedProduct } : p)));
  };

  const handleCloseModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setSelectedProduct(null);
  };

  // --- Memoized Paginated Data ---
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage, itemsPerPage]);

  return (
    <>
      <TableProduct
        products={paginatedProducts}
        currentPage={currentPage}
        totalItems={products.length}
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
          productData={selectedProduct}
          isViewMode={isViewMode}
        />
      )}
    </>
  );
};

export default ProductIndexPage;