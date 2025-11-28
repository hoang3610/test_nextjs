import React from "react";
import Select, { components } from "react-select";

interface SelectOneDropdownProps<T> {
  placeholder?: string;
  onChange: (selected: T | null) => void;
  disabled?: boolean;
  dataOptions: T[];
  getOptionLabel: (option: T) => string;
  getOptionKey: (option: T) => number | string;
  getOptionIcon?: (option: T) => React.ReactNode;
  className?: string;
  selectedId?: number | string;
}

interface OptionType {
  value: number | string;
  label: string;
  icon?: React.ReactNode;
}

export const SelectOneDropdown = <T,>({
  placeholder = "Vui lòng chọn",
  onChange,
  disabled = false,
  dataOptions = [],
  getOptionLabel,
  getOptionKey,
  getOptionIcon,
  className,
  selectedId,
}: SelectOneDropdownProps<T>) => {
  const options: OptionType[] = dataOptions.map((option) => ({
    value: getOptionKey(option),
    label: getOptionLabel(option),
    icon: getOptionIcon ? getOptionIcon(option) : null,
  }));

  const defaultValue = options.find((option) => option.value === selectedId) ?? [];

  const CustomOption = (props: any) => (
    <components.Option {...props}>
      <div className="flex items-center overflow-x-hidden">
        {props.data.icon && <span className="mr-2">{props.data.icon}</span>}
        <span className="break-words">{props.data.label}</span>
      </div>
    </components.Option>
  );

  return (
    <Select
      className={`custom-scroll form-select-custom ${className ?? "min-w-[180px]"}`}
      placeholder={placeholder}
      options={options}
      value={defaultValue}
      isSearchable={true}
      onChange={(selectedOption: OptionType | null) => {
        const selectedData = selectedOption
          ? dataOptions.find((option) => getOptionKey(option) === selectedOption.value) ?? null
          : null;
        onChange(selectedData);
      }}
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
