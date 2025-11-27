import React from 'react';

// Lấy danh sách danh mục từ tên sản phẩm gốc để mock data
const categories = [
  'Tất cả', 'Áo Thun', 'Quần Jeans', 'Giày Sneaker', 'Mũ Lưỡi Trai',
  'Balo', 'Đồng Hồ', 'Áo Sơ Mi', 'Kính Mát',
  'Áo Khoác', 'Quần Kaki', 'Giày Lười', 'Túi Đeo Chéo',
  'Ví Da', 'Thắt Lưng', 'Áo Hoodie', 'Quần Jogger'
];

export interface Filters {
  searchTerm: string;
  category: string;
}

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleCategoryClick = (category: string) => {
    // Nếu chọn "Tất cả" thì reset category filter
    const newCategory = category === 'Tất cả' ? '' : category;
    setFilters(prev => ({ ...prev, category: newCategory }));
  };

  return (
    <aside className="w-full lg:w-64 lg:pr-8">
      <div className="space-y-8">
        {/* Search Filter */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tìm kiếm</h3>
          <input
            type="text"
            placeholder="Tên sản phẩm..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Danh mục</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full text-left px-3 py-1 rounded-md transition-colors text-gray-700 dark:text-gray-300 ${
                    (filters.category === cat || (filters.category === '' && cat === 'Tất cả'))
                      ? 'bg-blue-100 dark:bg-blue-900 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;