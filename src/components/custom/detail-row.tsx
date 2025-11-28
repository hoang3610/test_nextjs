interface DetailRowProps {
  label: string;
  value?: string | number;
  className?: string;
}

export const DetailRow = ({ label, value, className }: DetailRowProps) => (
  <div className="flex">
    <label className={`${className ?? "w-1/3 text-sm font-bold text-gray-600"}  `}>{label}</label>
    <span className={`${className ?? "w-2/3 text-sm font-medium text-gray-600"}`}>{value}</span>
  </div>
);
