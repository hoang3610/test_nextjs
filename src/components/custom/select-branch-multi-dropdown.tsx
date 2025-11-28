"use client";
import { useEffect, useRef, useState } from "react";
import { useStoreOptions } from "../../hooks/use-store-options";

interface Option {
  value: number;
  label: string;
}

interface Props {
  selected: number[];
  onChange: (values: number[]) => void;
  label?: string;
  error?: string;
}

export default function SelectBranchMultiDropdown({
  selected,
  onChange,
  label = "Chi nhánh áp dụng",
  error,
}: Props) {
  const { options: storeOptions, loading } = useStoreOptions();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Danh sách hiển thị bao gồm "Tất cả đại lý"
  const combinedOptions: Option[] = [
    { value: -1, label: "Tất cả đại lý" },
    ...storeOptions,
  ];

  // Click ngoài thì đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle chọn option
  const toggleSelect = (value: number) => {
    if (value === -1) {
      // chọn tất cả
      onChange([-1]);
    } else {
      let next: number[] = [];
      if (selected.includes(-1)) {
        // bỏ chọn "tất cả"
        next = [value];
      } else {
        next = selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value];
      }
      onChange(next);
    }
  };

  // Text hiển thị trên input
  const displayText =
    selected.includes(-1) || selected.length === storeOptions.length
      ? "Tất cả đại lý"
      : selected
          .map((id) => combinedOptions.find((o) => o.value === id)?.label)
          .filter(Boolean)
          .join(", ") || "Chọn chi nhánh";

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Dropdown input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border px-3 py-2 text-left flex justify-between items-center"
      >
        <span className="truncate">{loading ? "Đang tải..." : displayText}</span>
        <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {combinedOptions.map((op) => (
            <label
              key={op.value}
              className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={
                  selected.includes(-1)
                    ? op.value === -1
                    : selected.includes(op.value)
                }
                onChange={() => toggleSelect(op.value)}
                className="w-4 h-4 accent-blue-600"
              />
              <span>{op.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
