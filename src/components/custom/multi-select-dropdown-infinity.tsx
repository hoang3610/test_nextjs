import React, { useState, useEffect } from "react";
import Select, { components, OptionProps } from "react-select";

interface MultiSelectDropdownInfinityProps<T> {
  reloadData?: boolean;
  placeholder?: string;
  onChange: (selects: T[]) => void;
  disabled?: boolean;
  pageCurrent: number;
  dataOptions: T[];
  getOptionKey: (option: T) => number | string;
  getOptionLabel: (option: T) => string;
  getOptionIcon?: (option: T) => React.ReactNode;
  className?: string;
  optionSelected?: T[];
  loadMoreOptions: (page: number) => Promise<T[]>; // Hàm tải thêm dữ liệu từ API với trang
  limit: number; // Số lượng mục mỗi lần gọi API
  totalRecord: number; // Tổng số bản ghi có sẵn trong dữ liệu
}

// Định nghĩa CustomOption ngoài MultiSelectDropdown
interface CustomOptionData {
  value: string | number;
  icon?: React.ReactNode;
  label: string;
}

const CustomOption: React.FC<OptionProps<CustomOptionData, true>> = (props) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        {data.icon && <span className="mr-2">{data.icon}</span>}
        <span>{data.label}</span>
      </div>
    </components.Option>
  );
};

export const MultiSelectDropdownInfinity = <T,>({
  placeholder = "Vui lòng chọn",
  onChange,
  disabled = false,
  dataOptions,
  getOptionLabel,
  getOptionIcon,
  className,
  optionSelected,
  getOptionKey,
  loadMoreOptions,
  limit,
  totalRecord,
  pageCurrent,
  reloadData = false,
}: MultiSelectDropdownInfinityProps<T>) => {
  const [options, setOptions] = useState<CustomOptionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // Khởi tạo trang bắt đầu

  // Load dữ liệu ban đầu
  useEffect(() => {
    const initialOptions = dataOptions.map((option) => ({
      value: getOptionKey(option),
      label: getOptionLabel(option),
      icon: getOptionIcon ? getOptionIcon(option) : null,
    }));
    setOptions(initialOptions);
    setSelectedOptions(initialSelectedOptions);
  }, [dataOptions, getOptionKey, getOptionLabel, getOptionIcon]);

  const selectedIds = optionSelected?.map(getOptionKey) || [];
  const initialSelectedOptions = options.filter((option) => selectedIds.includes(option.value));
  const [selectedOptions, setSelectedOptions] = useState<CustomOptionData[]>(initialSelectedOptions);

  useEffect(() => {
    setSelectedOptions(initialSelectedOptions);
  }, [optionSelected, reloadData]);

  // useEffect(() => {
  //   setPage(pageCurrent);
  // }, [pageCurrent]);
  const handleChange = (selected: CustomOptionData[]) => {
    setSelectedOptions(selected);
    const selectedData = selected
      .map((s) => dataOptions.find((data) => getOptionKey(data) === s.value))
      .filter(Boolean) as T[];
    onChange(selectedData);
  };

  const handleMenuScrollToBottom = async () => {
    // Kiểm tra nếu đã tải đủ dữ liệu
    if (options.length >= totalRecord) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const moreOptions = await loadMoreOptions(nextPage); // Gọi API với trang kế tiếp
      // const newOptions = moreOptions.map((option) => ({
      //   value: getOptionKey(option),
      //   label: getOptionLabel(option),
      //   icon: getOptionIcon ? getOptionIcon(option) : null,
      // }));
      // setOptions((prevOptions) => [...prevOptions, ...newOptions]);
      setPage(nextPage); // Cập nhật trang hiện tại
    } catch (error) {
      console.error("Error loading more options:", error);
    }
    setIsLoading(false);
  };

  return (
    <Select
      data-testid="branch-select"
      className={`custom-scroll form-select-custom ${className ?? "min-w-[180px]"}`}
      placeholder={placeholder}
      options={options}
      isMulti
      defaultValue={selectedOptions}
      value={selectedOptions}
      onChange={handleChange as any}
      isDisabled={disabled}
      components={{ Option: CustomOption }}
      noOptionsMessage={() => (isLoading ? "Đang tải thêm dữ liệu..." : "Không có kết quả phù hợp")}
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (provided) => ({
          ...provided,
          zIndex: 9999,
        }),
      }}
      menuPlacement="auto"
      menuPosition="fixed"
      onMenuScrollToBottom={handleMenuScrollToBottom} // Gọi API khi cuộn tới cuối
    />
  );
};