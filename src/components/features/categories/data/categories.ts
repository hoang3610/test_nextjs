export interface Category {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_app_visible: boolean;
}

// Định nghĩa thêm Interface cho Payload gửi đi
export interface CategoryPayload {
  name?: string;
  code?: string;
  description?: string;
  is_app_visible: number;
  id?: number;
}

const categoryNames = [
  'Áo Thun Cotton Basic', 'Quần Jeans Slim-fit', 'Giày Sneaker Da', 'Mũ Lưỡi Trai Thêu Logo',
  'Balo Laptop Chống Nước', 'Đồng Hồ Thể Thao', 'Áo Sơ Mi Dài Tay', 'Kính Mát Polarized',
  'Áo Khoác Bomber', 'Quần Kaki Chinos', 'Giày Lười Da Lộn', 'Túi Đeo Chéo Vải Canvas',
  'Ví Da Nam Nhỏ Gọn', 'Thắt Lưng Da Bò', 'Áo Hoodie Nỉ Bông', 'Quần Jogger Thể Thao'
];

const generateProducts = (count: number): Category[] => {
  const categories: Category[] = [];
  for (let i = 1; i <= count; i++) {
    const name = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const code = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    categories.push({
      id: i,
      name: `${name} #${i}`,
      code: code,
      is_app_visible: false,
    });
  }
  return categories;
};

export const mockProducts: Category[] = generateProducts(50);