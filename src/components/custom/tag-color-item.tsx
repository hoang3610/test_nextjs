interface ItemTagColorProps {
  handleSelectedColor: (color: string) => void;
  selectedColor?: string;
  color: string;
  width?: string;
  height?: string;
  borderRadius?: number;
  label?: string;
}
export const ItemTagColor = (props: ItemTagColorProps) => {
  const {
    color,
    width,
    height,
    borderRadius,
    selectedColor,
    handleSelectedColor,
  } = props;
  return (
    <button
      onClick={() => {
        handleSelectedColor(color);
      }}
      style={{
        backgroundColor: color ?? "#fff",
        height: height ?? "auto",
        width: width ?? "auto",
        borderRadius: borderRadius ?? "6px",
        padding: "6px 12px 6px 12px",
        display: "inline-block",
        border: `${selectedColor === color && selectedColor ? "2px solid #E96012" : "none"
          }`,
        cursor: "pointer",
      }}
    >
      {props.label ?? ""}
    </button>
  );
};
