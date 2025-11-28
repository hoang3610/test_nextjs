import { useCallback, useEffect, useRef, useState } from "react";
import { GroupBase } from "react-select";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";
import { useFetchData } from "../../hooks/useFetch";

import { ApiConfig } from "../../services/api-config";
import CookieUtils from "../../utils/cookie-utils";
import { BasePaginateResponse } from "../../models/response/base-response";

// Định nghĩa interface cho các option trong dropdown
interface OptionType {
  id: string | number; // ID duy nhất của option
  name?: string; // Tên (tuỳ chọn)
  username?: string; // Tên người dùng (tuỳ chọn)
  labelOption?: string; // Nhãn hiển thị trong dropdown
  [key: string]: any; // Cho phép thêm các thuộc tính khác linh hoạt
}

// Định nghĩa interface cho props của component
interface BaseSelectDropdownAsyncPaginateProps<T extends OptionType> {
  url: string; // URL API để lấy dữ liệu
  limit?: number; // Giới hạn số lượng item mỗi trang
  placeholder?: string; // Văn bản hiển thị khi chưa chọn
  classNames?: string; // Class CSS để tùy chỉnh giao diện
  allOptions?: T; // Option "Tất cả" (nếu có)
  labelOption?: string; // Trường dùng làm nhãn hiển thị
  idOption?: string; // Trường dùng làm ID (mới thêm)
  params?: Record<string, any>; // Tham số bổ sung cho API
  disabled?: boolean; // Trạng thái vô hiệu hóa dropdown
  projectId?: string; // Project ID (tuỳ chọn)
  excludeCurrentUser?: boolean; // Thêm option để loại trừ người dùng hiện tại
  shouldLoadData?: boolean; // Có nên tải dữ liệu không
  isResetSelected?: boolean;
  isClearable?: boolean;
  excludeOptions?: T[]; // Thêm prop mới: mảng các option cần loại trừ
  callSuccess?: (response: any[]) => void
}

// Interface cho chế độ single select
interface SingleSelectAsyncPaginateProps<T extends OptionType> extends BaseSelectDropdownAsyncPaginateProps<T> {
  isMulti?: false;
  onChange: (selected: T) => void;
  defaultOptions?: T;
}

// Interface cho chế độ multi select
interface MultiSelectAsyncPaginateProps<T extends OptionType> extends BaseSelectDropdownAsyncPaginateProps<T> {
  isMulti: true;
  onChange: (selected: T[]) => void;
  defaultOptions?: T[];
}

// Union type để kết hợp cả hai interface
type SelectDropdownAsyncPaginateProps<T extends OptionType> = SingleSelectAsyncPaginateProps<T> | MultiSelectAsyncPaginateProps<T>;

// Component generic nhận type T extends OptionType
const SelectDropdownAsyncPaginate = <T extends OptionType>({
  url,
  limit = 100, // Mặc định 100 item mỗi trang
  placeholder = "Chọn các tùy chọn", // Placeholder mặc định
  onChange,
  defaultOptions, // Mặc định là mảng rỗng
  classNames = "",
  isMulti = false, // Mặc định không cho chọn nhiều
  allOptions,
  labelOption = "name", // Trường mặc định để hiển thị là "name"
  idOption = "id", // Trường mặc định làm ID là "id" (mới thêm)
  params = {}, // Tham số API mặc định là object rỗng
  disabled = false, // Mặc định không vô hiệu hóa
  projectId = ApiConfig.PROJECT_ID.USER_SERVICE, // Project ID mặc định
  excludeCurrentUser = false,
  shouldLoadData = true,
  isResetSelected = false,
  isClearable = false,
  excludeOptions = [], // Thêm giá trị mặc định là mảng rỗng
  callSuccess
}: SelectDropdownAsyncPaginateProps<T>) => {
  const currentUserId = useRef<number | string>(CookieUtils.getCurrentUser()?.id ?? 0);
  // Hook để gọi API, trả về request function, response và trạng thái loading
  const { request: fetchData, baseResponse, loading: apiLoading } = useFetchData.Get<BasePaginateResponse<T[]>>({ projectId: projectId });

  // Hàm lọc các option cần loại trừ
  const filterExcludedOptions = (items: T[]): T[] => {
    if (!excludeOptions || excludeOptions.length === 0) return items;

    // Tạo một mảng các ID cần loại trừ để tìm kiếm hiệu quả hơn
    const excludeIds = excludeOptions.map((item) => item[idOption]);
    return items.filter((item) => !excludeIds.includes(item.id));
  };

  // Hàm ánh xạ dữ liệu thô thành định dạng option với labelOption
  const processOptions = (items: T[]): T[] => {
    if (!items || !Array.isArray(items) || items.length === 0) return [];

    const filteredItems = filterExcludedOptions(items);
    return filteredItems.map((item) => ({
      ...item,
      labelOption: String(item[labelOption as keyof T] || item.name || item.username || "Không có nhãn"), // Ưu tiên labelOption, sau đó là name, username
    }));
  };

  // Xử lý allOptions nếu có
  const processedAllOptions = allOptions
    ? ([
      {
        ...allOptions,
        labelOption: String(allOptions[labelOption as keyof T] || allOptions.name || allOptions.username || "Tất cả"),
      },
    ] as T[])
    : [];

  // Khởi tạo danh sách option ban đầu (bao gồm allOptions nếu có)
  const initialOptions = isMulti ? (defaultOptions as T[]) || [] : defaultOptions ? [defaultOptions as T] : [];

  // Tạo danh sách ban đầu bao gồm cả allOptions nếu có
  const initialSelectedOptions = initialOptions.length > 0 ? processOptions(initialOptions) : allOptions ? processedAllOptions : [];

  const [options, setOptions] = useState<T[]>([]); // State lưu danh sách option hiển thị
  const [selectedOptions, setSelectedOptions] = useState<T[]>(initialSelectedOptions); // Khởi tạo với defaultOptions nếu có

  // Refs để quản lý cache và request
  const cache = useRef<Map<string, { data: T[]; hasMore: boolean }>>(new Map()); // Cache dữ liệu đã fetch
  const currentRequestId = useRef<string | null>(null); // ID của request hiện tại
  const abortController = useRef<AbortController | null>(null); // Controller để hủy request
  const lastSearch = useRef<string>(""); // Giá trị tìm kiếm trước đó
  const prevDefaultOptionsRef = useRef(defaultOptions);

  // Đảm bảo allOptions luôn có mặt trong options
  useEffect(() => {
    if (allOptions) {
      setOptions((prev) => {
        // Kiểm tra xem allOptions đã tồn tại trong mảng options chưa
        const allOptionExists = prev.some((option) => option.id === allOptions.id);
        if (!allOptionExists) {
          return [...processedAllOptions, ...prev];
        }
        return prev;
      });
    }
  }, [allOptions]);

  // Reset state và cache khi component mount lần đầu
  useEffect(() => {
    cache.current.clear(); // Xóa cache cũ

    // Thêm allOptions vào options ban đầu nếu có
    const initialOptionsList = allOptions ? processedAllOptions : [];
    setOptions(initialOptionsList);

    // Nếu có defaultOptions thì ưu tiên, nếu không có thì dùng allOptions nếu có
    if (initialOptions.length > 0) {
      setSelectedOptions(processOptions(initialOptions));
    } else if (allOptions) {
      setSelectedOptions(processedAllOptions);
    } else {
      setSelectedOptions([]);
    }
  }, []); // Chỉ chạy 1 lần khi mount

  useEffect(() => {
    const isDefaultOptionsChanged = JSON.stringify(prevDefaultOptionsRef.current) !== JSON.stringify(initialOptions);
    if (isDefaultOptionsChanged) {
      // Kiểm tra defaultOptions có dữ liệu thực sự (trong cả trường hợp single hoặc multi)
      const hasValue = Array.isArray(initialOptions) && initialOptions.length > 0;
      if (hasValue) {
        setSelectedOptions(processOptions(initialOptions));
      } else if (allOptions) {
        // Nếu không có defaultOptions nhưng có allOptions, chọn allOptions
        setSelectedOptions(processedAllOptions);
      } else {
        setSelectedOptions([]); // Xóa selectedOptions nếu không có giá trị
      }
      // Cập nhật giá trị ref
      prevDefaultOptionsRef.current = initialOptions;
    }
  }, [defaultOptions]);

  useEffect(() => {
    if (isResetSelected) {
      // Nếu có allOptions thì vẫn giữ lại nó
      setSelectedOptions(allOptions ? processedAllOptions : []);
      setOptions(allOptions ? processedAllOptions : []);
      cache.current.clear();
    }
  }, [isResetSelected]);

  // Xử lý response từ API fetchData
  useEffect(() => {
    if (!baseResponse?.data || !currentRequestId.current) return;
    const { list = [], total_record = 0 } = baseResponse.data;
    const [search, pageStr] = currentRequestId.current.split("-").slice(0, 2);
    const page = parseInt(pageStr, 10);
    const hasMore = total_record > page * limit;

    // Lọc theo excludeCurrentUser
    let filteredList = excludeCurrentUser ? list.filter((item: T) => item[idOption] !== currentUserId.current) : list;

    // Áp dụng processOptions để lọc và map dữ liệu
    const mappedList = processOptions(filteredList);
    const cacheKey = `${search}-${page}-${JSON.stringify(params)}`;

    cache.current.set(cacheKey, { data: mappedList, hasMore });

    setOptions((prev) => {
      // Chỉ thêm allOptions khi không có search text
      const baseOptions = allOptions && !search ? processedAllOptions : [];

      // Trang đầu tiên: thay thế danh sách hiện tại
      if (page === 1) {
        return [...baseOptions, ...mappedList];
      }

      // Các trang tiếp theo: thêm các option mới và unique
      // Lọc ra các option không phải là allOptions
      const currentOptionsWithoutAll = prev.filter((opt) => !allOptions || opt.id !== allOptions.id);

      const uniqueNewOptions = mappedList.filter((newOpt) => !currentOptionsWithoutAll.some((opt) => opt.id === newOpt.id));

      return [...baseOptions, ...currentOptionsWithoutAll, ...uniqueNewOptions];
    });

    currentRequestId.current = null;
  }, [baseResponse, limit, allOptions, params, idOption, excludeCurrentUser, excludeOptions]);
  // Hàm tải options bất đồng bộ (core của AsyncPaginate)
  const loadOptions: LoadOptions<T, GroupBase<T>, { page: number }> = useCallback(
    async (search, _, additional) => {
      // Chỉ thêm baseOptions khi không có search text
      const baseOptions = allOptions && !search ? processedAllOptions : [];

      if (!shouldLoadData) {
        return Promise.resolve({
          options: baseOptions,
          hasMore: false,
          additional: { page: 1 },
        });
      }

      const page = search !== lastSearch.current ? 1 : additional?.page || 1;
      lastSearch.current = search;

      const cacheKey = `${search}-${page}-${JSON.stringify(params)}`;
      if (cache.current.has(cacheKey)) {
        const cachedData = cache.current.get(cacheKey)!;
        return Promise.resolve({
          options: [...baseOptions, ...cachedData.data],
          hasMore: cachedData.hasMore,
          additional: { page: page + 1 },
        });
      }

      if (abortController.current) abortController.current.abort();
      abortController.current = new AbortController();
      currentRequestId.current = cacheKey;

      return fetchData({
        endPoint: url,
        data: { key_search: search, page, limit, ...params },
      }).then((response) => {
        if (!response)
          return {
            options: baseOptions,
            hasMore: false,
            additional: { page: page + 1 },
          };

        const { list = [], total_record = 0 } = response.data;
        const hasMore = total_record > page * limit;
        const mappedList = processOptions(list);
        cache.current.set(cacheKey, { data: mappedList, hasMore });
        callSuccess && callSuccess(list)
        return {
          options: [...baseOptions, ...mappedList],
          hasMore,
          additional: { page: page + 1 },
        };
      });
    },
    [url, limit, params, allOptions, excludeOptions]
  );

  // Style tùy chỉnh cho giao diện dropdown
  const customStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }), // Đảm bảo menu hiển thị trên cùng
    menu: (provided: any) => ({ ...provided, zIndex: 9999, color: "#7D7E81", fontSize: "14px", fontWeight: 600 }),
    placeholder: (base: any) => ({ ...base, color: "#7D7E81", fontSize: "14px", fontWeight: 600 }),
    singleValue: (base: any) => ({ ...base, color: "#7D7E81", fontSize: "14px", fontWeight: 600 }),
    multiValue: (base: any) => ({ ...base, backgroundColor: "#e2e8f0", borderRadius: "4px" }), // Style cho option đã chọn
    multiValueLabel: (base: any) => ({ ...base, color: "#7D7E81", fontWeight: "bold" }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#64748b",
      ":hover": { backgroundColor: "#cbd5e1", color: "#7D7E81" }, // Hover effect cho nút xóa
    }),
  };

  // Hàm helper để lấy nhãn và giá trị cho react-select
  const getOptionLabel = (option: T) => option.labelOption || option.username || option.name || "Không có nhãn";
  const getOptionValue = (option: T) => option[idOption]?.toString() ?? ""; // Sử dụng idOption thay vì id cứng

  // Xử lý sự kiện thay đổi giá trị
  const handleChange = (newValue: any) => {
    if (isMulti) {
      const selectedValues = (newValue as T[]) ?? [];
      setSelectedOptions(selectedValues);
      (onChange as (selected: T[]) => void)(selectedValues);
    } else {
      const selectedValue = newValue as T;
      setSelectedOptions(selectedValue ? [selectedValue] : []);
      (onChange as (selected: T) => void)(selectedValue);
    }

    const cacheKey = `${lastSearch.current}-1-${JSON.stringify(params)}`;
    const cachedData = cache.current.get(cacheKey);

    if (cachedData) {
      setOptions((prev) => {
        // Chỉ thêm allOptions khi không có search text
        const baseOptions = allOptions && !lastSearch.current ? processedAllOptions : [];

        // Kết hợp baseOptions với dữ liệu cache, loại bỏ các option trùng lặp
        const cachedOptions = cachedData.data.filter((opt) => !baseOptions.some((baseOpt) => baseOpt.id === opt.id));

        return [...baseOptions, ...cachedOptions];
      });
    }
  };

  // Render component AsyncPaginate
  return (
    <AsyncPaginate
      key={JSON.stringify(params)} // Reset component khi params thay đổi
      loadOptions={loadOptions} // Hàm tải dữ liệu
      getOptionLabel={getOptionLabel} // Hàm lấy nhãn
      getOptionValue={getOptionValue} // Hàm lấy giá trị
      placeholder={placeholder} // Văn bản placeholder
      className={classNames} // Class CSS
      isSearchable // Cho phép tìm kiếm
      isMulti={isMulti} // Chọn nhiều
      isLoading={apiLoading} // Hiển thị loading khi fetch dữ liệu
      noOptionsMessage={() => (apiLoading ? "Đang tải dữ liệu..." : "Không có kết quả")} // Thông báo khi không có dữ liệu
      menuPortalTarget={document.body} // Hiển thị menu ở body để tránh overflow
      value={isMulti ? selectedOptions : selectedOptions[0] || null} // Giá trị hiện tại
      onChange={handleChange} // Xử lý thay đổi
      styles={customStyles} // Style tùy chỉnh
      menuPlacement="auto" // Tự động đặt vị trí menu
      menuPosition="fixed" // Vị trí cố định
      additional={{ page: 1 }} // Thông tin bổ sung cho pagination
      debounceTimeout={300} // Delay khi nhập tìm kiếm
      closeMenuOnSelect={!isMulti} // Đóng menu khi chọn (nếu không phải multi)
      options={options} // Danh sách option hiện tại
      isDisabled={disabled} // Trạng thái vô hiệu hóa
      defaultOptions={true} // Hiển thị option mặc định
      isClearable={isClearable}
    />
  );
};

export default SelectDropdownAsyncPaginate;
