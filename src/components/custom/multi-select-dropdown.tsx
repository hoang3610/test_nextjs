import React, { useEffect, useState } from "react";
import Select, { components, OptionProps } from "react-select";

interface MultiSelectDropdownProps<T> {
  placeholder?: string; // Placeholder
  onChange: (selecteds: T[]) => void; // Function to handle selection changes
  disabled?: boolean; // Disable the dropdown if true
  dataOptions: T[]; // Data options
  getOptionKey: (option: T) => number | string; // Function to get option key
  getOptionLabel: (option: T) => string; // Function to get option label
  getOptionIcon?: (option: T) => React.ReactNode; // Function to get option icon
  className?: string; // Custom class name
  optionSelected?: T[]; // Pre-selected options
}

// Define CustomOption outside MultiSelectDropdown
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

export const MultiSelectDropdown = <T,>({
  placeholder = "Vui lòng chọn",
  onChange,
  disabled = false,
  dataOptions,
  getOptionLabel,
  getOptionIcon,
  className,
  optionSelected,
  getOptionKey,
}: MultiSelectDropdownProps<T>) => {
  // Tạo danh sách options cho react-select với tất cả các tùy chọn
  const options = dataOptions.map((option) => ({
    value: getOptionKey(option),
    label: getOptionLabel(option),
    icon: getOptionIcon ? getOptionIcon(option) : null,
  }));

  const selectedIds = optionSelected?.map(getOptionKey) || [];
  const initialSelectedOptions = options.filter((option) => selectedIds.includes(option.value));

  // Lọc các tùy chọn còn lại (chưa được chọn)
  const remainingOptions = options.filter((option) => !selectedIds.includes(option.value));

  const [selectedOptions, setSelectedOptions] = useState<CustomOptionData[]>(initialSelectedOptions);
  
  useEffect(() => {
    setSelectedOptions(initialSelectedOptions);
  }, [optionSelected]);

  const handleChange = (selected: CustomOptionData[]) => {
    setSelectedOptions(selected);
    const selectedData = selected
      .map((s) => dataOptions.find((data) => getOptionKey(data) === s.value))
      .filter(Boolean) as T[];
    onChange(selectedData);
  };
  return (
    <Select
      data-testid="branch-select"
      className={`custom-scroll form-select-custom ${className ?? "min-w-[180px]"}`}
      placeholder={placeholder}
      options={[...initialSelectedOptions, ...remainingOptions]} // Kết hợp danh sách đã chọn và tùy chọn còn lại
      isMulti
      defaultValue={selectedOptions}
      value={selectedOptions}
      onChange={handleChange as any}
      isDisabled={disabled}
      components={{ Option: CustomOption }}
      noOptionsMessage={() => "Không có kết quả phù hợp"}
      menuPortalTarget={document.body} // Đặt menu ngoài modal
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Tăng z-index để hiển thị trên modal
        menu: (provided) => ({
          ...provided,
          zIndex: 9999, // Điều chỉnh z-index cho menu
        }),
      }}
      menuPlacement="auto" // Tự động chọn hướng hiển thị của menu
      menuPosition="fixed" // Đặt vị trí cố định cho menu
    />
  );
};
