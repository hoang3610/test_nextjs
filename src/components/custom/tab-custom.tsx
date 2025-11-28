import React, { useEffect, useRef, useState, useCallback } from "react";

interface TabsCustomProps {
  children: React.ReactElement<TabCustomProps>[];
  value: number;
  onChange: (newValue: number) => void;
  lineColor?: string;
  typeDisplay?: "line" | "fill";
  className?: string;
  id?: string;
  isTransition?: boolean;
}

export const TabsCustom: React.FC<TabsCustomProps> = ({
  children,
  value,
  onChange,
  lineColor,
  typeDisplay = "line", // Default to 'line'
  className = "",
  id,
  isTransition = true, // Default to true
}) => {
  const [indicatorStyles, setIndicatorStyles] = useState({
    left: 0,
    width: 0,
    height: 0,
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]); // To store refs for all tabs

  // Memoize the updateIndicatorStyles function
  const updateIndicatorStyles = useCallback(() => {
    if (tabRefs.current[value]) {
      const tabElement = tabRefs.current[value];
      const tabRect = tabElement?.getBoundingClientRect();
      const containerRect = tabElement?.parentElement?.getBoundingClientRect();
      if (tabRect && containerRect) {
        setIndicatorStyles({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
          height: tabRect.height,
        });
      }
    }
  }, [value]);

  useEffect(() => {
    updateIndicatorStyles(); // Initial update
    const resizeObserver = new ResizeObserver(() => {
      updateIndicatorStyles();
    });
    // Observe the parent element of the tabs for layout changes
    if (tabRefs.current[0]?.parentElement) {
      resizeObserver.observe(tabRefs.current[0]?.parentElement);
    }
    return () => {
      // Cleanup observer
      resizeObserver.disconnect();
    };
  }, [updateIndicatorStyles, children]);

  const renderTabs = () =>
    React.Children.map(children, (child, index) => {
      if (React.isValidElement<TabCustomProps>(child)) {
        return React.cloneElement(child, {
          ref: (el: HTMLButtonElement) => (tabRefs.current[index] = el),
          isActive: value === index,
          onClick: () => onChange(index),
          typeDisplay, // Pass typeDisplay to TabCustom
        });
      }
      return child;
    });

  const indicatorStyle = {
    height: typeDisplay === "line" ? "4px" : `100%`,
    backgroundColor: lineColor ?? "#635ee7",
    left: `${indicatorStyles.left}px`,
    width: `${indicatorStyles.width}px`,
    transition: isTransition ? "left 0.3s, width 0.3s" : "",
    ...(typeDisplay === "line" ? { bottom: "0" } : { top: "0" }),
  };

  return (
    <div className={`relative`} id={id}>
      <div className="absolute rounded-t-lg" style={indicatorStyle} />
      <div className={`flex ${className}`}>{renderTabs()}</div>
    </div>
  );
};

interface TabCustomProps {
  label: string;
  icon?: React.ReactNode;
  iconPosition?: "top" | "bottom" | "start" | "end";
  isActive?: boolean;
  onClick?: () => void;
  colorSelected?: string;
  colorUnSelected?: string;
  ref?: React.Ref<HTMLButtonElement>;
  typeDisplay?: "line" | "fill";
  style?: React.CSSProperties;
  className?: string;
}

export const TabCustom = React.forwardRef<HTMLButtonElement, TabCustomProps>(
  (
    {
      label,
      icon,
      iconPosition = "end",
      isActive,
      onClick,
      colorSelected = "#1462B0",
      colorUnSelected = "#7D7E81",
      typeDisplay,
      style,
      className = "",
    },
    ref
  ) => {
    const renderContent = () => {
      switch (iconPosition) {
        case "top":
          return (
            <div className="flex flex-col items-center">
              {icon}
              <div style={style} className="text-sm font-medium">
                {label}
              </div>
            </div>
          );
        case "bottom":
          return (
            <div className="flex flex-col-reverse items-center">
              {icon}
              <div style={style} className="text-sm font-medium">
                {label}
              </div>
            </div>
          );
        case "end":
          return (
            <>
              <div style={style} className="text-sm font-bold uppercase">
                {label}
              </div>
              {icon && <div className="ml-2">{icon}</div>}
            </>
          );
        case "start":
        default:
          return (
            <>
              {icon && <div className="mr-2">{icon}</div>}
              <div style={style} className="text-sm font-medium">
                {label}
              </div>
            </>
          );
      }
    };

    return (
      <button
        ref={ref}
        className={`mr-3 border-0 flex items-center justify-center ${typeDisplay === "line" ? "pb-3" : "py-2"
          } ${className}`}
        onClick={onClick}
        style={{ color: isActive ? colorSelected : colorUnSelected, ...style }}
      >
        {renderContent()}
      </button>
    );
  }
);

interface TabPanelCustomProps {
  children: React.ReactNode;
  value: number;
  index: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  isPaddingTop?: boolean;
}

export const TabPanelCustom = (props: TabPanelCustomProps) => {
  return (
    <div
      style={props.style}
      id={props.id}
      className={
        (props.className ?? "pt-3") +
        (props.value !== props.index ? " d-none" : "")
      }
    >
      {props.children}
    </div>
  );
};
