import React from "react";
import Select, { ActionMeta, components, MultiValue, SingleValue } from "react-select";
import { STATUS } from "../../constants/status";

// Base interface với các thuộc tính chung
interface BaseSelectDropdownProps<T> {
  placeholder?: string;
  disabled?: boolean;
  dataOptions: T[];
  getOptionLabel: (option: T) => string;
  getOptionKey: (option: T) => number | string;
  getOptionIcon?: (option: T) => React.ReactNode;
  getTagColor?: (option: T) => string;
  className?: string;
  isLoading?: boolean;
  hasAllOption?: boolean;
  labelAllOption?: string;
  disabledIds?: (number | string)[];
  disabledOptions?: (number | string)[];
  isHiddenRemoveAll?: boolean;
}

// Interface cho chế độ single select
interface SingleSelectProps<T> extends BaseSelectDropdownProps<T> {
  isMulti?: false;
  onChange: (selected: T | null) => void;
  selectedId?: number | string;
}

// Interface cho chế độ multi select
interface MultiSelectProps<T> extends BaseSelectDropdownProps<T> {
  isMulti: true;
  onChange: (selected: T[] | null) => void;
  selectedId?: (number | string)[];
}

// Union type để kết hợp cả hai interface
type SelectDropdownProps<T> = SingleSelectProps<T> | MultiSelectProps<T>;

interface OptionType {
  value: number | string;
  label: string;
  icon?: React.ReactNode;
  color?: React.ReactNode;
}

export const SelectDropdown = <T,>({
  placeholder = "Vui lòng chọn",
  onChange,
  disabled = false,
  dataOptions = [],
  getOptionLabel,
  getOptionKey,
  getOptionIcon,
  getTagColor,
  className,
  selectedId,
  isLoading = false,
  hasAllOption = false,
  labelAllOption,
  isMulti = false,
  disabledIds = [],
  disabledOptions = [],
  isHiddenRemoveAll = false,
}: SelectDropdownProps<T>) => {

  const options: OptionType[] = [
    ...(hasAllOption ? [{ value: STATUS.ALL, label: labelAllOption ?? "Tất cả" }] : []),
    ...dataOptions.map((option) => ({
      value: getOptionKey(option),
      label: getOptionLabel(option),
      icon: getOptionIcon?.(option) ?? null,
      color: getTagColor ? getTagColor(option) : null,
    })),
  ];

  // Xử lý defaultValue cho cả trường hợp đơn và đa giá trị
  const getDefaultValue = () => {
    if (isMulti && Array.isArray(selectedId)) {
      return options.filter(option => selectedId.includes(option.value));
    } else if (!isMulti && !Array.isArray(selectedId)) {
      return options.find(option => option.value === selectedId) || null;
    }
    return isMulti ? [] : null;
  };

  const defaultValue = getDefaultValue();

  const CustomOption = (props: any) => (
    <components.Option {...props}>
      <div className="flex items-center overflow-x-hidden break-words">
        {props.data.icon && <span className="mr-2">{props.data.icon}</span>}
        {props.color && <div className="w-8 h-8 mr-2 rounded-full" style={{ backgroundColor: props.color }}></div>}
        <span className="w-full">{props.data.label}</span>
      </div>
    </components.Option>
  );

  const customStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (provided: any) => ({ ...provided, zIndex: 9999, color: "#7D7E81", fontSize: "14px", fontWeight: 600 }),
    placeholder: (base: any) => ({ ...base, color: "#7D7E81", fontSize: "14px", fontWeight: 600 }),
    singleValue: (base: any) => ({ ...base, color: "#7D7E81", fontSize: "14px", fontWeight: 600 }),
    option: (styles: any, { isDisabled }: any) => {
      return {
        ...styles,
        cursor: isDisabled ? 'not-allowed' : 'default',
      };
    },
  }

  const handleChange = (
    newValue: MultiValue<OptionType> | SingleValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    if (isMulti) {
      // Xử lý trường hợp multi select (newValue là MultiValue<OptionType>)
      const multiValue = newValue as MultiValue<OptionType>;
      const selectedData = multiValue.map(option => {
        if (option.value === -1) {
          return { id: -1, name: "Tất cả" } as T;
        }
        return dataOptions.find(item => getOptionKey(item) === option.value) as T;
      });
      (onChange as (selected: T[] | null) => void)(selectedData.length > 0 ? selectedData : null);
    } else {
      // Xử lý trường hợp single select (newValue là SingleValue<OptionType>)
      const singleValue = newValue as SingleValue<OptionType>;
      if (singleValue) {
        const selectedData = singleValue.value === -1
          ? { id: -1, name: "Tất cả" } as T
          : dataOptions.find(option => getOptionKey(option) === singleValue.value) as T;
        (onChange as (selected: T | null) => void)(selectedData);
      } else {
        (onChange as (selected: T | null) => void)(null);
      }
    }
  };

  const CustomMultiValueRemove = (props: any) => {
    // Ẩn nút "Remove item" theo id
    if (disabledIds.includes(props.data.value)) return null;
    return <components.MultiValueRemove {...props} />;
  };

  const CustomClearIndicator = (props: any) => {
    // Ẩn nút "Remove all"
    if (isHiddenRemoveAll) return null;
    return <components.ClearIndicator {...props} />;
  };

  return (
    <Select
      isMulti={isMulti}
      className={`custom-scroll form-select-custom ${className ?? "min-w-[180px]"}`}
      placeholder={placeholder}
      options={options}
      value={defaultValue}
      isSearchable={true}
      isLoading={isLoading}
      onChange={handleChange}
      isDisabled={disabled}
      components={{
        Option: CustomOption,
        MultiValueRemove: CustomMultiValueRemove,
        ClearIndicator: CustomClearIndicator,
      }}
      noOptionsMessage={() => "Không có kết quả phù hợp"}
      menuPortalTarget={document.body} // Đặt menu ngoài modal
      styles={customStyles}
      menuPlacement="auto" // Tự động chọn hướng hiển thị của menu
      menuPosition="fixed" // Đặt vị trí cố định cho menu
      closeMenuOnSelect={!isMulti}
      isOptionDisabled={(option) => disabledOptions.includes(option.value)}
    />
  );
};
