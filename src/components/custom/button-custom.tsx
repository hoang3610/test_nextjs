interface ButtonCustomProps {
  type?: "button" | "submit" | "reset";
  className?: string;
  text?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  isLoading?: boolean;
  style?: React.CSSProperties;
  component?: React.ReactNode;
  [key: string]: any;
}

export const ButtonCustom = ({
  type = "button",
  style,
  className = "bg-[#E3ECF5] text-[#1462B0] hover:bg-[#1462B0] hover:text-white btn uppercase font-bold",
  text,
  icon,
  iconPosition = "left",
  disabled = false,
  isLoading = false,
  onClick,
  component,
  ...rest
}: ButtonCustomProps) => {
  return (
    <button
      disabled={disabled || isLoading}
      type={type}
      className={`${className}`}
      onClick={onClick}
      style={style}
      {...rest}
    >
      <div
        className={`flex items-center gap-1 ${
          icon && iconPosition === "left" ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{text}</span>
      </div>
      {isLoading && (
        <span
          className="inline-block w-5 h-5 ml-2 border-2 border-white rounded-full animate-spin border-l-transparent"
          aria-label="Loading"
        ></span>
      )}
      {component}
    </button>
  );
};
