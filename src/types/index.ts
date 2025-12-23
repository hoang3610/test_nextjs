export interface Product {
  id: string | number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  originalPrice?: number;
  regularPrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
}