import React, { useCallback, useState } from "react";
import useDebounce from "../../hooks/useDebounce";

// Define the props interface
interface SearchCustomProps {
  value: string;
  className?: string;
  onChange: (value: string) => void;
  timeDelay?: number;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
}

// Define the SearchCustom component
const SearchCustom: React.FC<SearchCustomProps> = ({
  value,
  className,
  onChange,
  timeDelay = 500,
  placeholder = "Tìm kiếm...",
  disabled = false,
  autoFocus = false,
  autoComplete = "off",
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Callback for input change that updates local state
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Debounced callback to call onChange with the latest input value
  const debouncedOnChange = useCallback(() => {
    onChange(inputValue);
  }, [inputValue, onChange]);

  // Use the useDebounce hook to debounce the onChange callback
  useDebounce(debouncedOnChange, timeDelay, [inputValue]); // 500ms debounce delay

  return (
    <div className="relative">
      <input
        autoComplete={autoComplete}
        disabled={disabled}
        autoFocus={autoFocus}
        data-testid="search-custom-input"
        id="search-custom-input"
        value={inputValue}
        type="search"
        placeholder={placeholder}
        className={`form-input ${className} disabled:bg-[#F2F2F2]`}
        required
        onChange={handleInputChange}
        title=""
      />
    </div>
  );
};

export default SearchCustom;
