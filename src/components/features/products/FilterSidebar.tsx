import React from 'react';

export interface Filters {
  searchTerm: string;
  category: string;
}

interface FilterSidebarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters }) => {
  const [categories, setCategories] = React.useState<string[]>(['Tất cả']);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories?is_active=true&limit=100');
        if (res.ok) {
          const data = await res.json();
          const categoryNames = data.data.map((cat: any) => cat.name);
          setCategories(['Tất cả', ...categoryNames]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

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
            {categories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full text-left px-3 py-1 rounded-md transition-colors text-gray-700 dark:text-gray-300 ${(filters.category === category || (filters.category === '' && category === 'Tất cả'))
                    ? 'bg-blue-100 dark:bg-blue-900 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {category}
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