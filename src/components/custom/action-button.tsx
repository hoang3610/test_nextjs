import React from "react";
import { Plus, Eye, Pencil, Trash2, Power } from "lucide-react";

interface ActionButtonsProps {
  onCreate?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeStatus?: () => void;
  className?: string;
}

export const ActionButtons = ({
  onCreate,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
  className = ""
}: ActionButtonsProps) => {
  // Cấu hình chung cho icon size
  const iconSize = 18;

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>

      {/* 1. CREATE (Thêm) - Màu Xanh Lá */}
      {onCreate && (
        <button
          onClick={(e) => { e.stopPropagation(); onCreate(); }}
          title="Thêm mới"
          className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-all hover:scale-110"
        >
          <Plus size={iconSize} />
        </button>
      )}

      {/* 2. VIEW (Xem) - Màu Xám/Xanh */}
      {onView && (
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          title="Xem chi tiết"
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all hover:scale-110"
        >
          <Eye size={iconSize} />
        </button>
      )}

      {/* 3. UPDATE (Sửa) - Màu Cam/Vàng */}
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Chỉnh sửa"
          className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-all hover:scale-110"
        >
          <Pencil size={iconSize} />
        </button>
      )}

      {/* 4. DELETE (Xóa) - Màu Đỏ */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Xóa"
          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-all hover:scale-110"
        >
          <Trash2 size={iconSize} />
        </button>
      )}

      {/* 5. CHANGE STATUS (Thay đổi trạng thái) - Màu Đỏ */}
      {onChangeStatus && (
        <button
          onClick={(e) => { e.stopPropagation(); onChangeStatus(); }}
          className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-all hover:scale-110"
        >
          <Power size={iconSize} />
        </button>
      )}
    </div>
  );
};