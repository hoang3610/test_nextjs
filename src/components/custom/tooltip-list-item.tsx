import Tip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";
import { useEffect, useState } from "react";
import ListItem from "./list-item";
import "./style.css";

interface TooltipListProps<T> {
  text?: number;
  items: T[];
  isTop?: boolean;
  hasDivider?: boolean;
  handleSelectedItem: (item: T) => void;
  getOptionLabel: (option: T) => string;
  getOptionKey: (option: T) => string | number;
  getOptionAvatar?: (option: T) => string;
  isUserManager?: boolean;
}

export const TooltipList = <T,>({
  text,
  items,
  hasDivider = false,
  handleSelectedItem,
  getOptionKey,
  getOptionAvatar,
  getOptionLabel,
  isUserManager = false,
}: TooltipListProps<T>) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 480);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div id="member-custom-quantity-list">
    {items && items.length > 0 ? (
      <Tip
        placement={`${isMobile ? "top" : "right"}`}
        align={{ overflow: { adjustX: true, adjustY: true } }}
        overlay={
          <div
            className="relative custom-scroll"
            style={{
              overflow: "auto",
              maxHeight: "18.75rem",
              maxWidth: "12.5rem",
              minWidth: "12.5rem",
              backgroundColor: "white",
            }}
          >
            {items.map((member, index) => {
              return (
                <ListItem
                  key={index}
                  item={member}
                  hasDivider={index === items.length - 1 ? false : hasDivider}
                  handleSelectedItem={handleSelectedItem}
                  getOptionKey={getOptionKey}
                  getOptionLabel={getOptionLabel}
                  getOptionAvatar={getOptionAvatar}
                />
              )
            })}
          </div>
        }
      >
        {isUserManager ? (
          <div className="flex justify-center items-center">
            {getOptionAvatar &&
              items.slice(0, 4).map((item, index) => (
                <div key={index} className="circle">
                  {/* <ImageDefault
                    url={getOptionAvatar(item) ?? ""}
                    className="rounded-circle"
                  /> */}
                </div>
              ))}
            {items.length > 4 && (
              <div className="circle more">{`${items.length - 4}+`}</div>
            )}
          </div>
        ) : (
          <span className="relative member-group">
            <span className="member rounded">{text}</span>
          </span>
        )}
      </Tip>
    ) : (
      <span className="relative member-group">
        <span className="member rounded">{text}</span>
      </span>
    )}
  </div>
  );
};
