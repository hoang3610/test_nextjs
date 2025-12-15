export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
}

const productNames = [
  'Áo Thun Cotton Basic', 'Quần Jeans Slim-fit', 'Giày Sneaker Da', 'Mũ Lưỡi Trai Thêu Logo',
  'Balo Laptop Chống Nước', 'Đồng Hồ Thể Thao', 'Áo Sơ Mi Dài Tay', 'Kính Mát Polarized',
  'Áo Khoác Bomber', 'Quần Kaki Chinos', 'Giày Lười Da Lộn', 'Túi Đeo Chéo Vải Canvas',
  'Ví Da Nam Nhỏ Gọn', 'Thắt Lưng Da Bò', 'Áo Hoodie Nỉ Bông', 'Quần Jogger Thể Thao'
];

const generateProducts = (count: number): Product[] => {
  const products: Product[] = [];
  for (let i = 1; i <= count; i++) {
    const name = productNames[Math.floor(Math.random() * productNames.length)];
    const price = (Math.floor(Math.random() * (3000 - 150 + 1)) + 150) * 1000;
    const productName = `${name} #${i}`;

    // Simple slug generator: lowercase, replace spaces with hyphens, remove special chars
    const slug = productName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    products.push({
      id: i,
      slug,
      name: productName,
      price: price,
      imageUrl: `https://picsum.photos/id/${i + 10}/400/500`,
      isNew: Math.random() > 0.7, // ~30% sản phẩm là mới
      isFeatured: Math.random() > 0.8, // ~20% là nổi bật
      isFlashSale: Math.random() > 0.9, // ~10% là flash sale
    });
  }
  return products;
};

export const mockProducts: Product[] = generateProducts(50);