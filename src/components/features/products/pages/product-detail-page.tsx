'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import { showToast } from '@/components/custom/custom-toast';
import Lightbox from '@/components/common/Lightbox';

// Re-using types or defining pertinent ones
interface ProductAttribute {
    code: string;
    name: string;
    value: string;
}

interface ProductSku {
    sku: string;
    price: number;
    original_price?: number;
    stock: number;
    image_url?: string;
    is_active: boolean;
    attributes?: ProductAttribute[];
}

interface ProductDetailProps {
    product: any; // Using any for flexibility with Mongoose document
}

const ProductDetailPage: React.FC<ProductDetailProps> = ({ product }) => {
    const { addToCart } = useCart();

    // -- State --
    const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [mainImage, setMainImage] = useState<string>(product.thumbnail_url || '');
    const [quantity, setQuantity] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // -- Initialize --
    useEffect(() => {
        setIsMounted(true);
        // Select default SKU or first SKU
        if (product.skus && product.skus.length > 0) {
            // Logic: Find default, or first active
            const defaultSku = product.skus.find((s: any) => s.is_default) || product.skus[0];
            setSelectedSku(defaultSku);

            // Set initial attributes
            if (defaultSku.attributes) {
                const initialAttrs: Record<string, string> = {};
                defaultSku.attributes.forEach((attr: any) => {
                    initialAttrs[attr.code] = attr.value;
                });
                setSelectedAttributes(initialAttrs);
            }

            // Set initial image
            if (defaultSku.image_url) {
                setMainImage(defaultSku.image_url);
            } else if (product.thumbnail_url) {
                setMainImage(product.thumbnail_url);
            }
        }
    }, [product]);

    // -- Helpers --
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Get all unique attributes for UI
    const productAttributes = useMemo(() => {
        if (!product.attributes_summary) return [];
        return product.attributes_summary;
    }, [product]);

    // Handle Attribute Click
    const handleAttributeSelect = (code: string, value: string) => {
        const newAttributes = { ...selectedAttributes, [code]: value };
        setSelectedAttributes(newAttributes);

        // Find matching SKU
        if (product.skus) {
            const match = product.skus.find((sku: any) => {
                if (!sku.attributes) return false;
                return sku.attributes.every((attr: any) => newAttributes[attr.code] === attr.value);
            });

            if (match) {
                setSelectedSku(match);
                if (match.image_url) {
                    setMainImage(match.image_url);
                }
            } else {
                setSelectedSku(null);
            }
        }
    };

    // Handle Image Click (Gallery)
    const handleImageClick = (url: string) => {
        setMainImage(url);
    };

    // Combine product images + variant images for gallery
    const allImages = useMemo(() => {
        let images: string[] = [];
        if (product.thumbnail_url) images.push(product.thumbnail_url);
        if (product.image_urls) images.push(...product.image_urls);
        // Add variant images
        if (product.skus) {
            product.skus.forEach((sku: any) => {
                if (sku.image_url && !images.includes(sku.image_url)) {
                    images.push(sku.image_url);
                }
            });
        }
        return [...new Set(images)]; // Unique
    }, [product]);

    // Check Global Stock
    const isGlobalOutOfStock = useMemo(() => {
        if (!product.skus || product.skus.length === 0) return true;
        return product.skus.every((sku: ProductSku) => sku.stock <= 0);
    }, [product.skus]);

    // Check availability of an option (globally for that attribute value)
    const isOptionAvailable = (code: string, value: string) => {
        if (!product.skus) return false;
        // Check if ANY SKU with this attribute value has stock > 0
        return product.skus.some((sku: any) =>
            sku.stock > 0 &&
            sku.attributes?.some((attr: any) => attr.code === code && attr.value === value)
        );
    };

    const handleAddToCart = () => {
        if (product.has_variants && !selectedSku) {
            showToast({ message: "Vui lòng chọn đầy đủ thuộc tính", type: "warning" });
            return;
        }

        const skuToAdd = selectedSku || product.skus?.[0]; // Fallback for no variants
        if (!skuToAdd) return;

        addToCart({
            id: product._id, // String ID
            name: `${product.name} ${product.has_variants ? `(${Object.values(selectedAttributes).join(' - ')})` : ''}`,
            price: skuToAdd.price,
            imageUrl: mainImage,
            slug: product.slug,
        }, quantity);
        showToast({ message: "Đã thêm vào giỏ hàng!", type: "success" });
    };

    if (!product) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Images */}
                <div className="w-full md:w-1/2 flex flex-col gap-4 border border-gray-200 rounded-lg p-4">
                    <div
                        className="relative w-full aspect-square rounded-lg overflow-hidden bg-white cursor-pointer group"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        <Image
                            src={mainImage || 'https://placehold.co/600'}
                            alt={product.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                    {/* Thumbnails */}
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleImageClick(img)}
                                className={`relative w-20 h-20 flex-shrink-0 border rounded-md overflow-hidden ${mainImage === img ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Extra Detail Image (Requested to be here) */}
                    <div
                        className="relative w-[90%] mx-auto aspect-square md:aspect-[4/3] rounded-lg overflow-hidden mt-4 cursor-pointer group"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        <Image
                            src={mainImage || 'https://placehold.co/600'}
                            alt={`${product.name} - Detail`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                {/* Right: Info */}
                <div className="w-full md:w-1/2 flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {isGlobalOutOfStock ? (
                                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    Hết hàng
                                </span>
                            ) : (
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    Còn hàng
                                </span>
                            )}
                            <span>SKU: {selectedSku?.sku || 'N/A'}</span>

                        </div>
                    </div>

                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-blue-600">
                            {isMounted && selectedSku ? formatPrice(selectedSku.price) : '...'}
                        </span>
                        {isMounted && selectedSku?.original_price && selectedSku.original_price > selectedSku.price && (
                            <span className="text-lg text-gray-400 line-through mb-1">
                                {formatPrice(selectedSku.original_price)}
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        {product.short_description || "Chưa có mô tả ngắn."}
                    </p>

                    <div className="h-px bg-gray-200" />

                    {/* Variants */}
                    {product.has_variants && productAttributes.map((attr: any) => (
                        <div key={attr.code}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">{attr.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                {attr.values.map((val: string) => {
                                    const isSelected = selectedAttributes[attr.code] === val;
                                    // Disable if globally out of stock OR this specific option is never in stock
                                    const isDisabled = isGlobalOutOfStock || !isOptionAvailable(attr.code, val);

                                    return (
                                        <button
                                            key={val}
                                            disabled={isDisabled}
                                            onClick={() => handleAttributeSelect(attr.code, val)}
                                            className={`px-4 py-2 text-sm border rounded-md transition-all ${isDisabled
                                                ? 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : isSelected
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                                                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Quantity & Add to Cart */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="px-4 py-2 hover:bg-gray-100 text-gray-600"
                            >
                                -
                            </button>
                            <span className="px-4 py-2 font-medium w-12 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="px-4 py-2 hover:bg-gray-100 text-gray-600"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={
                                (product.has_variants && !selectedSku) ||
                                (selectedSku && selectedSku.stock <= 0) ||
                                (!product.has_variants && product.skus?.[0]?.stock <= 0)
                            }
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-8 rounded-full font-bold shadow-lg transition-all ${((product.has_variants && !selectedSku) || (selectedSku && selectedSku.stock <= 0) || (!product.has_variants && product.skus?.[0]?.stock <= 0))
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95'
                                }`}
                        >
                            <ShoppingCart size={20} />
                            {(selectedSku && selectedSku.stock <= 0) || (!product.has_variants && product.skus?.[0]?.stock <= 0)
                                ? "Hết hàng"
                                : "Thêm vào giỏ"}
                        </button>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                            <Heart size={16} /> Thêm vào yêu thích
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                            <Share2 size={16} /> Chia sẻ
                        </button>
                    </div>

                </div>
            </div>

            {/* Description Tab */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Mô tả chi tiết</h2>
                <div className="prose max-w-none text-gray-700">
                    {product.description ? (
                        <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
                    ) : (
                        <p>Đang cập nhật...</p>
                    )}
                </div>
            </div>
            {/* Lightbox Overlay */}
            <Lightbox
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={allImages}
                currentImage={mainImage || ''}
            />
        </div>
    );
};

export default ProductDetailPage;
