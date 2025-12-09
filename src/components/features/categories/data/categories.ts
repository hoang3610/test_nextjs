export interface Category {
  id: string; // Changed to string to match Mongo ID
  name: string;
  slug: string; // Renamed from code
  description?: string;
  image?: string;
  is_active: boolean; // Renamed from is_app_visible
}

// Định nghĩa thêm Interface cho Payload gửi đi
export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  is_active: boolean;
  id?: string;
}

const categoryNames = [
  'Áo Thun Cotton Basic', 'Quần Jeans Slim-fit', 'Giày Sneaker Da', 'Mũ Lưỡi Trai Thêu Logo',
  'Balo Laptop Chống Nước', 'Đồng Hồ Thể Thao', 'Áo Sơ Mi Dài Tay', 'Kính Mát Polarized',
  'Áo Khoác Bomber', 'Quần Kaki Chinos', 'Giày Lười Da Lộn', 'Túi Đeo Chéo Vải Canvas',
  'Ví Da Nam Nhỏ Gọn', 'Thắt Lưng Da Bò', 'Áo Hoodie Nỉ Bông', 'Quần Jogger Thể Thao'
];

const generateCategories = (count: number): Category[] => {
  const categories: Category[] = [];
  for (let i = 1; i <= count; i++) {
    const name = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    const slug = name.toLowerCase().replace(/ /g, '-') + `-${i}`;
    categories.push({
      id: i.toString(),
      name: `${name} #${i}`,
      slug: slug,
      is_active: Math.random() > 0.5,
    });
  }
  return categories;
};

export const mockProducts: Category[] = generateCategories(50);