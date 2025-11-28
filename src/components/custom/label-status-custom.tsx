interface LabelStatusCustomProps {
  backgroundColor?: string; // class background
  textColor?: string; // class text
  content?: string;
  border?: string;
  typeRadius?: "rounded-full" | "rounded" | "rounded-md" | "rounded-lg";
  className?: string;
  textSize?: 'text-xs' | 'text-sm' | 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl' | 'text-7xl' | 'text-8xl' | 'text-9xl';
}

export const LabelStatusCustom = ({
  backgroundColor = "bg-gray-200",
  textColor = "text-black",
  content,
  border = "rounded-full",
  typeRadius = "rounded-full",
  className = '',
  textSize = 'text-xs',
}: LabelStatusCustomProps) => {

  const isTextColorHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(textColor);
  const isBackgroundColorHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(backgroundColor);

  const inlineStyles: React.CSSProperties = {
    borderColor: isTextColorHex ? textColor : 'currentColor',
    ...(isBackgroundColorHex && { backgroundColor }),
    ...(isTextColorHex && { color: textColor }),
  };

  const tailwindClasses = [
    'border flex items-center justify-center gap-2 py-1 px-3',
    typeRadius,
    border,
    !isBackgroundColorHex && backgroundColor,
    !isTextColorHex && textColor,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={tailwindClasses}
      style={inlineStyles}
    >
      <span className={`${textSize} break-words text-balance whitespace-normal select-none`}>{content}</span>
    </div>
  );
};
