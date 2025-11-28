import React from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"; // Thêm icon Inbox

// --- Interfaces (Giữ nguyên) ---
export interface Column<T> {
  header: string;
  accessor?: keyof T;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  pagination?: PaginationProps;
}

export const Table = <T,>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  pagination,
}: TableProps<T>) => {
  
  // 1. Loading State: Vẫn có thể giữ return sớm hoặc dùng Skeleton loader
  if (isLoading) return <div className="h-full flex items-center justify-center bg-white border rounded-lg text-gray-500">Đang tải...</div>;

  // 2. XÓA ĐOẠN CHECK DATA RỖNG Ở ĐÂY (để không return sớm)
  // if (!data || data.length === 0) return ... 

  const renderPageNumbers = () => {
     if (!pagination) return null;
     const { currentPage, totalPages, onPageChange } = pagination;
     const pages = [];
     let startPage = Math.max(1, currentPage - 2);
     let endPage = Math.min(totalPages, startPage + 4);
     if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
     for (let i = startPage; i <= endPage; i++) {
       pages.push(
         <button key={i} onClick={() => onPageChange(i)} className={`w-8 h-8 rounded-md text-sm font-medium ${i === currentPage ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{i}</button>
       );
     }
     return pages;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      
      <div className="flex-1 overflow-auto min-h-0 custom-scroll relative w-full">
        <table className="w-full text-left border-collapse">
          
          {/* HEADER LUÔN LUÔN HIỂN THỊ */}
          <thead className="sticky top-0 z-30 bg-gray-50 shadow-sm">
            <tr className="border-b border-gray-200">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`p-4 text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-50 whitespace-nowrap ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {/* 3. LOGIC HIỂN THỊ DỮ LIỆU */}
            {data && data.length > 0 ? (
              // TRƯỜNG HỢP CÓ DATA: Render bình thường
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-blue-50 transition-colors duration-150 group ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`p-4 text-sm text-gray-700 whitespace-nowrap ${col.className || ""}`}>
                      {col.render ? col.render(item) : col.accessor ? String(item[col.accessor]) : ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // TRƯỜNG HỢP KHÔNG CÓ DATA (Rỗng):
              // Render 1 dòng duy nhất, gộp tất cả các cột (colSpan)
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <div className="bg-gray-100 p-3 rounded-full">
                        <Inbox size={32} className="text-gray-400" />
                    </div>
                    <span className="font-medium">Không có dữ liệu hiển thị</span>
                    <span className="text-xs text-gray-400">Vui lòng thêm mới hoặc thử lại sau</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - Chỉ hiện nếu có data và số trang > 1 */}
      {pagination && data.length > 0 && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col md:flex-row items-center justify-between gap-4 z-10 shrink-0">
          <div className="text-sm text-gray-500">
             Hiển thị <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> trên <span className="font-medium">{pagination.totalItems}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => pagination.onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1">{renderPageNumbers()}</div>
            <button onClick={() => pagination.onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
};