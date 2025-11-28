import React, { useRef, useState, MouseEvent, ReactNode, useEffect } from "react";
import ArrowDown from "../../../assets/icons/ic_arrow_down.svg";

interface CollapsibleProps {
  title: string;
  children: ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [height, setHeight] = useState<number | undefined>(0);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight);
    }
  }, [children, isExpanded]);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setHeight(ref.current.scrollHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = (e: MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <button onClick={handleToggle} className="w-full">
        <div className="flex justify-start items-center gap-2 dark:text-white bg-[#eff2f6] dark:!bg-[#1a2941] px-4 py-2  rounded">
          <ArrowDown className={`transition-all duration-500 ease-in-out transform ${isExpanded ? "rotate-180" : ""}`} />
          <h2 className="text-xl">{title}</h2>
        </div>
      </button>
      <div
        className='overflow-hidden transition-all duration-500 ease-in-out dark:text-white'
        style={{
          maxHeight: isExpanded ? `${height}px` : "0px",
        }}
      >
        <div ref={ref}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Collapsible;
