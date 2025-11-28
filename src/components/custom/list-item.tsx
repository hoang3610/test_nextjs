import React from "react";

interface ListItemProps<T> {
  item: T;
  hasDivider?: boolean;
  handleSelectedItem: (item: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionKey: (option: T) => string | number;
  getOptionAvatar?: (option: T) => string;
}

const ListItem = <T,>(props: ListItemProps<T>) => {
  const { 
    item, 
    hasDivider, 
    handleSelectedItem, 
    getOptionLabel, 
    getOptionAvatar 
  } = props;

  return (
    <div
      id="member-item"
      // Chuyển d-flex sang flex, thêm hover effect
      className={`flex items-center p-3 gap-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
        hasDivider ? "border-b border-gray-100" : ""
      }`}
      onClick={() => {
        handleSelectedItem(item);
      }}
    >
      {/* Hiển thị Avatar nếu có hàm getOptionAvatar */}
      {getOptionAvatar && (
        <img
          src={getOptionAvatar(item)}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
      )}
      
      <div 
        className="font-medium text-sm truncate" 
        style={{ color: "#001416", maxWidth: "270px" }}
      >
        {getOptionLabel(item)}
      </div>
    </div>
  );
};

export default ListItem;