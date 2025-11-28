import { CSSProperties, useEffect, useRef, useState } from "react";
import iCUserDefault from "../../assets/icons/ic_user_default.svg";
import ArrowDown from "../../assets/icons/ic_arrow_down.svg";
import SearchCustom from "./search-custom";
import InfiniteScroll from "./infinite-scroll/infinite-scroll";
import ImageCustom from "./image-custom";
import BeatLoader from "./infinite-scroll/loader/beat-loader";
import "../../index.css";
import { createPortal } from "react-dom";
import { normalizedString } from "../../utils/helpers";

interface DropdownProps<T> {
  defaultOption?: T;
  options: T[];
  placeholder?: string;
  fontSize?: string;
  selectedId?: string | number;
  onChange: (selectedOption: T) => void;
  disabled?: boolean;
  error?: boolean;
  getOptionLabel: (option: T) => string;
  getOptionKey: (option: T) => string | number;
  getOptionAvatar?: (option: T) => string;
  getOptionBoxColor?: (option: T) => string;
  currentPage?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  keySearch?: string;
  handleFilterChange?: (value: string) => void;
  timeDelay?: number;
  className?: string;
  isSearchLocal?: boolean;
}

const DropdownSelectOne = <T,>({
  defaultOption,
  options,
  placeholder = "",
  selectedId,
  fontSize = "",
  onChange,
  disabled = false,
  error = false,
  getOptionLabel,
  getOptionKey,
  getOptionAvatar,
  getOptionBoxColor,
  currentPage,
  hasMore,
  onPageChange,
  handleFilterChange,
  timeDelay,
  className,
  isSearchLocal = false
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<T | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">("down");
  const [isForcedDownward, setIsForcedDownward] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [localKeySearch, setLocalKeySearch] = useState<string>("");



  useEffect(() => {
    if (selectedId !== undefined) {
      const option = options.find(opt => getOptionKey(opt) === selectedId) ?? defaultOption;
      setSelectedOption(option);
    }
  }, [selectedId, options, getOptionKey, defaultOption]);

  const shouldIncludeDefaultOption = !!defaultOption;

  const filteredOptions = [
    ...(shouldIncludeDefaultOption ? [defaultOption] : []),
    ...options
  ];

  const searchResults = filteredOptions.filter((item) => {
    const label = normalizedString(getOptionLabel(item));
    const valueNormalizedString = normalizedString(localKeySearch);
    return label.includes(valueNormalizedString);
  });

  const data = localKeySearch && isSearchLocal ? searchResults : filteredOptions;
  const uniqueData = !defaultOption
    ? data
    : Object.values(
      data.reduce((acc: Record<string | number, T>, item) => {
        acc[getOptionKey(item)] = item;
        return acc;
      }, {})
    )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) return
    setLocalKeySearch("")
    handleFilterChange && handleFilterChange("");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRect) {
      const modalHeader = document.getElementById("modal-header");
      const modalHeaderHeight = modalHeader ? modalHeader.offsetHeight : 60;
      const modalFooter = document.getElementById("modal-footer");
      const modalFooterHeight = modalFooter ? modalFooter.offsetHeight : 64;

      const dropdownHeight = dropdownRef.current?.offsetHeight ?? 0;
      const windowHeight = window.innerHeight + modalHeaderHeight + modalFooterHeight;
      const totalBottomSpace = windowHeight - buttonRect.bottom - modalFooterHeight;

      if (totalBottomSpace < dropdownHeight) {
        const totalTopSpace = buttonRect.top - modalHeaderHeight;
        if (totalTopSpace >= dropdownHeight) {
          setDropdownDirection("up");
          setIsForcedDownward(false);
        } else {
          setDropdownDirection("down");
          setIsForcedDownward(false);
        }
      } else {
        setDropdownDirection("down");
        setIsForcedDownward(true);
      }
    }
  }, [isOpen, buttonRect]);

  const handleOptionClick = (option: T) => {
    setSelectedOption(option);
    onChange(option);
    setIsOpen(false);
  };

  const dropdownStyleForcedDownward: CSSProperties = {
    position: 'absolute',
    top: buttonRect ? `${buttonRect.bottom}px` : '0',
    left: buttonRect ? `${buttonRect.left}px` : '0',
    width: buttonRect ? `${buttonRect.width}px` : 'auto',
    zIndex: 9999,
  };

  const dropdownStyleDefault: CSSProperties = {
    position: 'absolute',
    zIndex: 9999,
    top: dropdownDirection === "down" ? "100%" : "auto",
    bottom: dropdownDirection === "up" ? "100%" : "auto",
    marginTop: dropdownDirection === "down" ? "0.25rem" : "0",
    marginBottom: dropdownDirection === "up" ? "0.25rem" : "0",
  };

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      className="absolute w-full mt-2 bg-white border border-gray-300 rounded shadow-lg"
      style={isForcedDownward ? dropdownStyleForcedDownward : dropdownStyleDefault}
    >
      <div className="dropdown-menu show">
        {handleFilterChange && (
          <div className="px-2 border-b border-gray-200 dark:bg-[#121e32] dark:text-white-dark">
            <SearchCustom
              autoFocus
              className="px-1 py-2 border-0 reset-focus focus:border-transparent focus:shadow-none placeholder:text-gray-400"
              value={localKeySearch}
              onChange={(value) => {
                setLocalKeySearch(value);
                handleFilterChange(value);
              }}
              timeDelay={timeDelay}
            />
          </div>
        )}

        {options.length > 0 ? (
          <div>
            <InfiniteScroll
              height={"auto"}
              className={`max-h-[16.5rem] ${className} !overflow-x-hidden break-all`}
              hasMore={hasMore ?? false}
              dataLength={options.length}
              next={() => {
                if (hasMore && onPageChange && currentPage) onPageChange(currentPage + 1);
              }}
              loader={
                <div className="flex justify-center h-4">
                  <BeatLoader />
                </div>
              }
              endMessage={<></>}
            >
              <div>
                {uniqueData.map((option) => {

                  return (
                    <button
                      key={getOptionKey(option)}
                      className={
                        `dropdown-item w-full p-2 text-sm hover:font-medium hover:bg-blue-100 hover:text-gray-900 text-[#808080]
                        ${selectedOption && getOptionKey(selectedOption) === getOptionKey(option) ? "bg-blue-500 text-white" : ""}
                        `}
                      onClick={() => {
                        handleOptionClick(option);
                        // setLocalKeySearch("");
                        // handleFilterChange && handleFilterChange("");
                      }}
                    >
                      <div className="flex items-center px-1">
                        {getOptionAvatar && (
                          <ImageCustom
                            isLocal={false}
                            className="border rounded-full img-fluid me-3"
                            url={getOptionAvatar(option) || iCUserDefault}
                            style={{ width: "2.5rem", height: "2.5rem" }}
                          />
                        )}
                        {getOptionBoxColor && (
                          <div
                            style={{
                              minWidth: "20px",
                              height: "20px",
                              backgroundColor: getOptionBoxColor(option),
                              marginRight: "4px",
                            }}
                            className="rounded"
                          ></div>
                        )}

                        <span className="text-start">{getOptionLabel(option)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </InfiniteScroll>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-2">
            <p className="text-[#808080]">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  )

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        const rect = buttonRef.current?.getBoundingClientRect() ?? null;
        setButtonRect(rect);
      }
      setIsOpen(prev => !prev);
    }
  };

  const contentDropdown = isForcedDownward ? createPortal(dropdownMenu, document.body) : dropdownMenu

  return (
    <div id="dropdown-select" className="relative">
      <button
        type="button"
        className={`w-full flex justify-between items-center bg-white dark:bg-[#121e32] dark:text-white-dark h-[2.375rem] min-w-[180px] border rounded-md disabled:bg-[#F2F2F2] ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "cursor-not-allowed" : ""}`}
        onClick={toggleDropdown}
        disabled={disabled}
        ref={buttonRef}
      >
        <p
          className={`${fontSize !== "" ? fontSize : "text-sm"} overflow-hidden text-ellipsis whitespace-nowrap text-[#808080] font-semibold px-2 border-r border-gray-300 w-full text-left`}
        >
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </p>

        <span className="p-2">
          <img src={ArrowDown} alt="arrow down" className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>
      {isOpen && contentDropdown}
    </div>
  );
};

export default DropdownSelectOne;
