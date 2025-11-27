export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}