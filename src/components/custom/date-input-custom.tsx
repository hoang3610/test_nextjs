import {
  addMonths,
  addYears,
  endOfWeek,
  getWeek,
  isSameDay,
  startOfWeek,
  subMonths,
  subYears,
} from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ReactComponent as IconCalendar } from "../../assets/icons/ic_calendar.svg";

type DateType = "date" | "date-time" | "time" | "week" | "month" | "year";

interface DateInputProps {
  placeholder?: string;
  value?: string;
  minDate?: string; // Minimum selectable date
  maxDate?: string; // Maximum selectable date
  onChange?: (dateString: string) => void;
  className?: string;
  disabled?: boolean;
  type?: DateType;
}

const convertToInputDate = (dateString: string, type: string): string => {
  switch (type) {
    case "date-time": {
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      const [hour, minute] = timePart.split(":");
      return `${year}-${month}-${day}T${hour.padStart(
        2,
        "0"
      )}:${minute.padStart(2, "0")}`;
    }
    case "week": {
      const [_, weekPart] = dateString.split("Tuần ");
      const [weekNumber, year] = weekPart.split("/");
      const firstDayOfYear = new Date(parseInt(year), 0, 1);
      const daysToAdd = (parseInt(weekNumber) - 1) * 7;
      firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd);
      const month = (firstDayOfYear.getMonth() + 1).toString().padStart(2, "0");
      const day = firstDayOfYear.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    case "month": {
      const [month, year] = dateString.split("/");
      return `${year}-${month}`;
    }
    case "time": {
      const [hour, minute] = dateString.split(":");
      return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    }
    default: {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    }
  }
};

const getDefaultPlaceholder = (type: string): string => {
  const placeholders = {
    date: "dd/mm/yyyy",
    "date-time": "dd/mm/yyyy, --:--",
    month: "mm/yyyy",
    year: "yyyy",
    week: "Tuần --, ----",
    time: "--:--",
  };
  return placeholders[type as keyof typeof placeholders] ?? "dd/mm/yyyy";
};

const DateCustomInput: React.FC<DateInputProps> = ({
  placeholder,
  value,
  minDate,
  maxDate,
  onChange,
  className = "min-w-[180px]",
  disabled = false,
  type = "date",
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [typeDisplay, setTypeDisplay] = useState<DateType>("date");
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerVisibleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);
  const [pickerStyle, setPickerStyle] = useState<React.CSSProperties>({});
  // Add these new refs
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  // Add new state for time picker visibility
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [timePickerStyle, setTimePickerStyle] = useState<React.CSSProperties>(
    {}
  );
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  useEffect(() => {
    if (value === "") {
      setDate(null);
      setIsPickerVisible(false);
    } else if (value) {
      try {
        if (type === "time" && value.match(/^\d{1,2}:\d{1,2}$/)) {
          const [hours, minutes] = value.split(":").map(Number);
          const newDate = new Date();
          newDate.setHours(hours, minutes, 0, 0);
          setDate(newDate);
        } else {
          const convertedDate = new Date(convertToInputDate(value, type));
          if (
            convertedDate.toString() === "Invalid Date" ||
            isNaN(convertedDate.getTime())
          ) {
            handleClear();
          } else {
            setDate(convertedDate);
          }
        }
      } catch (error) {
        setDate(new Date());
      }
    }
  }, [value]);

  useEffect(() => {
    setTypeDisplay(type ?? "date");
  }, [type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (type === "date-time" || type === "time") {
        if (
          inputRef.current &&
          pickerVisibleRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          !pickerVisibleRef.current.contains(event.target as Node)
        ) {
          if (
            hourInputRef.current &&
            minuteInputRef.current &&
            timePickerRef.current
          ) {
            if (
              !timePickerRef.current.contains(event.target as Node) &&
              !hourInputRef.current.contains(event.target as Node) &&
              !minuteInputRef.current.contains(event.target as Node)
            ) {
              setIsPickerVisible(false);
            }
          } else {
            setIsPickerVisible(false);
          }
        }
        if (
          hourInputRef.current &&
          minuteInputRef.current &&
          timePickerRef.current &&
          !timePickerRef.current.contains(event.target as Node) &&
          !hourInputRef.current.contains(event.target as Node) &&
          !minuteInputRef.current.contains(event.target as Node)
        ) {
          setIsTimePickerVisible(false);
        }
      } else {
        if (
          inputRef.current &&
          pickerVisibleRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          !pickerVisibleRef.current.contains(event.target as Node)
        ) {
          setIsPickerVisible(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updatePickerPosition = () => {
    if (inputRef.current && pickerVisibleRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const pickerHeight =
        pickerVisibleRef.current.getBoundingClientRect().height;
      const pickerWidth =
        pickerVisibleRef.current.getBoundingClientRect().width;
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const spaceRight = window.innerWidth - inputRect.left;
      const spaceLeft = inputRect.right;
      const newPosition: React.CSSProperties = {
        position: "fixed",
      };

      if (spaceBelow >= pickerHeight || spaceBelow >= spaceAbove) {
        newPosition.top = `${inputRect.bottom + 8}px`;
      } else {
        newPosition.bottom = `${window.innerHeight - inputRect.top + 8}px`;
      }
      if (spaceRight >= pickerWidth) {
        newPosition.left = `${inputRect.left}px`;
      } else if (spaceLeft >= pickerWidth) {
        newPosition.right = `${window.innerWidth - inputRect.right}px`;
      } else {
        const inputCenter = inputRect.left + inputRect.width / 2;
        const pickerHalfWidth = pickerWidth / 2;
        if (inputCenter - pickerHalfWidth < 0) {
          newPosition.left = `8px`; // Add small padding from left edge
        } else if (inputCenter + pickerHalfWidth > window.innerWidth) {
          newPosition.right = `8px`; // Add small padding from right edge
        } else {
          newPosition.left = `${inputCenter - pickerHalfWidth}px`;
        }
      }
      setPickerStyle(newPosition);
    }
  };

  const updateTimePickerPosition = (
    inputRef: React.RefObject<HTMLInputElement>,
    pickerRef: React.RefObject<HTMLDivElement>
  ) => {
    if (inputRef.current && pickerRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const pickerHeight = pickerRef.current.getBoundingClientRect().height;
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const newPosition: React.CSSProperties = {
        position: "fixed",
      };
      if (spaceBelow >= pickerHeight || spaceBelow >= spaceAbove) {
        newPosition.top = `${inputRect.bottom + 8}px`;
      } else {
        newPosition.bottom = `${window.innerHeight - inputRect.top + 8}px`;
      }
      newPosition.left = `${inputRect.left - 8}px`;
      setTimePickerStyle(newPosition);
    }
  };

  useEffect(() => {
    if (isTimePickerVisible) {
      const initialPosition: React.CSSProperties = {
        position: "fixed",
        top: `${
          hourInputRef.current?.getBoundingClientRect().bottom ?? 0 + 8
        }px`,
        left: `${hourInputRef.current?.getBoundingClientRect().left}px`,
        visibility: "hidden",
      };
      setTimePickerStyle(initialPosition);
      requestAnimationFrame(() => {
        updateTimePickerPosition(hourInputRef, timePickerRef);
      });
      if (timePickerRef.current) {
        const observer = new MutationObserver(() => {
          if (timePickerRef.current) {
            timePickerRef.current.style.visibility = "visible";
            updateTimePickerPosition(hourInputRef, timePickerRef);
            observer.disconnect();
          }
        });
        observer.observe(timePickerRef.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
      const handleResize = () => {
        requestAnimationFrame(() => {
          updateTimePickerPosition(hourInputRef, timePickerRef);
        });
      };
      const handleScroll = () =>
        updateTimePickerPosition(hourInputRef, timePickerRef);
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isTimePickerVisible]);

  useEffect(() => {
    if (isPickerVisible) {
      const initialPosition: React.CSSProperties = {
        position: "fixed",
        top: `${inputRef.current?.getBoundingClientRect().bottom ?? 0 + 8}px`,
        left: `${inputRef.current?.getBoundingClientRect().left}px`,
        visibility: "hidden",
      };
      setPickerStyle(initialPosition);
      if (pickerVisibleRef.current) {
        const observer = new MutationObserver(() => {
          if (pickerVisibleRef.current) {
            pickerVisibleRef.current.style.visibility = "visible";
            updatePickerPosition();
            observer.disconnect();
          }
        });
        observer.observe(pickerVisibleRef.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
      const handleResize = () => {
        requestAnimationFrame(() => {
          updatePickerPosition();
        });
      };
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", updatePickerPosition, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", updatePickerPosition, true);
      };
    }
  }, [isPickerVisible]);

  useEffect(() => {
    if (isTimePickerVisible) {
      const dateOptional = date ?? new Date();
      const hourElement = document.querySelector(
        `[data-hour="${dateOptional.getHours()}"]`
      );
      const minuteElement = document.querySelector(
        `[data-minute="${dateOptional.getMinutes()}"]`
      );

      hourElement?.scrollIntoView({ block: "center", behavior: "auto" });
      minuteElement?.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, [isTimePickerVisible]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const year = date.getFullYear();
    const formats = {
      "date-time": `${day}/${month}/${year} ${hour}:${minutes}`,
      time: `${hour}:${minutes}`,
      date: `${day}/${month}/${year}`,
      month: `${month}/${year}`,
      year: `${year}`,
      week: `Tuần ${getWeekNumber(date)}/${year}`,
    };
    return formats[type as keyof typeof formats] ?? "";
  };

  const handleDayClick = (monthOffset: number | null, day: number) => {
    let newDate;
    const dateOptional = date ?? new Date();
    if (monthOffset === -1) {
      // Select a day from the previous month
      newDate = new Date(
        dateOptional.getFullYear(),
        dateOptional.getMonth() - 1,
        day,
        dateOptional.getHours(),
        dateOptional.getMinutes()
      );
    } else if (monthOffset === 1) {
      // Select a day from the next month
      newDate = new Date(
        dateOptional.getFullYear(),
        dateOptional.getMonth() + 1,
        day,
        dateOptional.getHours(),
        dateOptional.getMinutes()
      );
    } else {
      // Select a day from the current month
      newDate = new Date(
        dateOptional.getFullYear(),
        dateOptional.getMonth(),
        day,
        dateOptional.getHours(),
        dateOptional.getMinutes()
      );
    }
    setDate(newDate);
    onChange?.(formatDate(newDate));
  };

  const handleMonthClick = (month: number) => {
    const dateOptional = date ?? new Date();
    const newDate = new Date(
      dateOptional.getFullYear(),
      month,
      dateOptional.getDate(),
      dateOptional.getHours(),
      dateOptional.getMinutes()
    );
    setDate(newDate); // Update the state to the new date
    onChange?.(formatDate(newDate));
    if (type !== "month") {
      setTypeDisplay(type ?? "date");
    }
  };

  const handleYearClick = (year: number) => {
    const dateOptional = date ?? new Date();
    const newDate = new Date(
      year,
      dateOptional.getMonth(),
      dateOptional.getDate(),
      dateOptional.getHours(),
      dateOptional.getMinutes()
    );
    setDate(newDate); // Update the state to the new date
    onChange?.(formatDate(newDate));
    if (type !== "year") {
      setTypeDisplay("month");
    }
  };

  const handleWeekClick = (weekDate: Date) => {
    if (type === "week") {
      setDate(weekDate);
      onChange?.(formatDate(weekDate));
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange("");
      setIsPickerVisible(false);
    }
  };

  const handleChangeDate = (next: boolean) => {
    let newDate;
    const dateOptional = date ?? new Date();
    switch (typeDisplay) {
      case "date":
      case "date-time":
      case "week": {
        newDate = next
          ? addMonths(dateOptional, 1)
          : subMonths(dateOptional, 1);
        setDate(newDate);
        onChange?.(formatDate(newDate));
        break;
      }
      case "month": {
        newDate = next ? addYears(dateOptional, 1) : subYears(dateOptional, 1);
        setDate(newDate);
        onChange?.(formatDate(newDate));
        break;
      }
      case "year": {
        newDate = next
          ? addYears(dateOptional, 10)
          : subYears(dateOptional, 10);
        setDate(newDate);
        onChange?.(formatDate(newDate));
        break;
      }
      default:
        break;
    }
  };

  const renderTimes = () => {
    const dateOptional = date ?? new Date();
    return (
      <>
        <div className="pt-3 mt-3 border-t">
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={dateOptional.getHours().toString().padStart(2, "0")}
                ref={hourInputRef}
                onClick={() => {
                  setIsTimePickerVisible(true);
                }}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0 && value < 24) {
                    const newDate = new Date(dateOptional);
                    newDate.setHours(value);
                    setDate(newDate);
                    onChange?.(formatDate(newDate));
                  }
                }}
                className="w-12 text-center p-1 border rounded focus:outline-none focus:border-[#228be6]"
              />
            </div>
            <span className="text-lg">:</span>
            <div className="relative">
              <input
                type="text"
                value={dateOptional.getMinutes().toString().padStart(2, "0")}
                ref={minuteInputRef}
                onClick={() => {
                  setIsTimePickerVisible(true);
                }}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0 && value < 60) {
                    const newDate = new Date(dateOptional);
                    newDate.setMinutes(value);
                    setDate(newDate);
                    onChange?.(formatDate(newDate));
                  }
                }}
                className="w-12 text-center p-1 border rounded focus:outline-none focus:border-[#228be6]"
              />
            </div>
          </div>
        </div>
        {createPortal(
          <div data-portal="true">
            {isTimePickerVisible && (
              <div
                ref={timePickerRef}
                style={timePickerStyle}
                className="bg-white dark:bg-[#2e2e2e] border rounded shadow-lg z-[2000]"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-full p-1">
                      <svg
                        viewBox="0 0 15 15"
                        className="w-4 h-4 mx-auto rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div className="p-1 h-[9.375rem] overflow-y-auto">
                      {Array.from({ length: 24 }, (_, i) => {
                        const tempDate = new Date(dateOptional);
                        tempDate.setHours(i);
                        const isDisabled = isTimeDisabled(tempDate);
                        return (
                          <button
                            key={i}
                            data-hour={i}
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) {
                                const newDate = new Date(dateOptional);
                                newDate.setHours(i);
                                setDate(newDate);
                                onChange?.(formatDate(newDate));
                              }
                            }}
                            className={`w-12 h-8 flex items-center justify-center ${
                              dateOptional.getHours() === i
                                ? "bg-[#228be6] text-white"
                                : isDisabled
                                ? "text-[#868e96]/50 cursor-not-allowed"
                                : "hover:bg-[#f1f3f5] dark:hover:bg-[#3b3b3b]"
                            }`}
                          >
                            {i.toString().padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-full p-1">
                      <svg
                        viewBox="0 0 15 15"
                        className="w-4 h-4 mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <span className="text-lg">:</span>
                  <div className="flex flex-col items-center">
                    <div className="w-full p-1">
                      <svg
                        viewBox="0 0 15 15"
                        className="w-4 h-4 mx-auto rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div className="p-1 h-[9.375rem] overflow-y-auto">
                      {Array.from({ length: 60 }, (_, i) => {
                        const tempDate = new Date(dateOptional);
                        tempDate.setMinutes(i);
                        const isDisabled = isTimeDisabled(tempDate);
                        return (
                          <button
                            key={i}
                            data-minute={i}
                            onClick={() => {
                              if (!isDisabled) {
                                const newDate = new Date(dateOptional);
                                newDate.setMinutes(i);
                                setDate(newDate);
                                onChange?.(formatDate(newDate));
                              }
                            }}
                            disabled={isDisabled}
                            className={`w-12 h-8 flex items-center justify-center ${
                              dateOptional.getMinutes() === i
                                ? "bg-[#228be6] text-white"
                                : isDisabled
                                ? "text-[#868e96]/50 cursor-not-allowed"
                                : "hover:bg-[#f1f3f5] dark:hover:bg-[#3b3b3b]"
                            }`}
                          >
                            {i.toString().padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-full p-1">
                      <svg
                        viewBox="0 0 15 15"
                        className="w-4 h-4 mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
      </>
    );
  };

  const renderDays = (daysArray: any[]) => {
    const dateOptional = date ?? new Date();
    return (
      <>
        {typeDisplay === "week" ? (
          <>
            <div className="flex gap-1 mb-2 text-[#868e96] text-sm dark:text-white text-center font-bold">
              <p className="pr-1 w-9">Tuần</p>
              <div className="grid [grid-template-columns:repeat(7,auto)]">
                {weekDays.map((day) => (
                  <p key={day} className="w-9">
                    {day}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex gap-1">
              <div className="border-r text-[calc(2.25rem/2.8)] pr-1">
                {Array.from(
                  { length: Math.ceil(daysArray.length / 7) },
                  (_, weekIndex) => {
                    const startDayOfWeek = weekIndex * 7;
                    const weekDate = new Date(dateOptional);
                    weekDate.setDate(1);
                    weekDate.setDate(weekDate.getDate() + startDayOfWeek);
                    const weekNumber = getWeekNumber(weekDate);
                    const currentDate = new Date(
                      dateOptional.getFullYear(),
                      dateOptional.getMonth(),
                      dateOptional.getDate()
                    );
                    const weekNumberSelected = getWeekNumber(currentDate);
                    const isSelected = weekNumber === weekNumberSelected;
                    return (
                      <button
                        type="button"
                        key={`week-${weekIndex}`}
                        onClick={() => handleWeekClick(weekDate)}
                        onMouseEnter={() => setHoveredWeek(weekNumber)}
                        onMouseLeave={() => setHoveredWeek(null)}
                        className={`flex justify-center items-center w-9 h-9 
                        ${
                          isSelected
                            ? "bg-[#228be6] text-white"
                            : `${
                                hoveredWeek === weekNumber
                                  ? "bg-[#f1f3f5] dark:bg-[#3b3b3b]"
                                  : ""
                              } hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]`
                        }`}
                      >
                        {weekNumber}
                      </button>
                    );
                  }
                )}
              </div>
              <div className="grid [grid-template-columns:repeat(7,auto)]">
                {daysArray}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid [grid-template-columns:repeat(7,auto)] mb-2 text-sm font-bold text-center text-[#868e96] dark:text-white ">
              {weekDays.map((day) => (
                <p key={day} className="w-9">
                  {day}
                </p>
              ))}
            </div>
            <div className="grid [grid-template-columns:repeat(7,auto)]">
              {daysArray}
            </div>
          </>
        )}
        {typeDisplay === "date-time" && renderTimes()}
      </>
    );
  };

  const renderMonths = () => {
    const dateOptional = date ?? new Date();
    return (
      <div className="grid [grid-template-columns:repeat(3,auto)]">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
          const currentDate = new Date(
            dateOptional.getFullYear(),
            month - 1,
            dateOptional.getDate(),
            dateOptional.getHours(),
            dateOptional.getMinutes()
          );
          const isDisabled =
            (minDate &&
              currentDate < new Date(convertToInputDate(minDate, type))) ||
            (maxDate &&
              currentDate > new Date(convertToInputDate(maxDate, type)));
          const isSelected = month - 1 === dateOptional.getMonth();
          return (
            <button
              key={`month-${month}`}
              type="button"
              className={`rounded-md h-8 ${
                isDisabled
                  ? "text-[#868e96]/50 cursor-not-allowed"
                  : isSelected
                  ? "bg-[#228be6] text-white"
                  : "hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
              }`}
              onClick={() => !isDisabled && handleMonthClick(month - 1)}
              disabled={Boolean(isDisabled)}
            >
              Tháng {month}
            </button>
          );
        })}
      </div>
    );
  };

  const renderYears = () => {
    const dateOptional = date ?? new Date();
    const currentYear = Math.floor(dateOptional.getFullYear() / 10) * 10;
    const startYear = currentYear;
    const endYear = currentYear + 10;
    const renderYear = (year: number) => {
      const currentDate = new Date(
        year,
        dateOptional.getMonth(),
        dateOptional.getDate(),
        dateOptional.getHours(),
        dateOptional.getMinutes()
      );
      const isDisabled =
        (minDate &&
          currentDate < new Date(convertToInputDate(minDate, type))) ||
        (maxDate && currentDate > new Date(convertToInputDate(maxDate, type)));
      const isSelected = year === dateOptional.getFullYear();
      return (
        <button
          key={`year-${year}`}
          type="button"
          className={`rounded-md h-8 ${
            isDisabled
              ? "text-[#868e96]/50 cursor-not-allowed"
              : isSelected
              ? "bg-[#228be6] text-white"
              : "hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
          }`}
          onClick={() => !isDisabled && handleYearClick(year)}
          disabled={Boolean(isDisabled) || disabled}
        >
          {year}
        </button>
      );
    };
    const arrayYear = Array.from({ length: endYear - startYear }, (_, index) =>
      renderYear(startYear + index)
    );
    return (
      <div className="grid [grid-template-columns:repeat(3,auto)]">
        {arrayYear}
      </div>
    );
  };

  const renderDay = (
    day: number,
    monthOffset: number | null,
    isGrayedOut = false
  ) => {
    const dateOptional = date ?? new Date();
    const prevMonthDate = subMonths(dateOptional, 1);
    const monthDate =
      monthOffset === -1
        ? prevMonthDate
        : monthOffset === 1
        ? new Date(dateOptional.getFullYear(), dateOptional.getMonth() + 1)
        : dateOptional;
    const currentDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      day,
      monthDate.getHours(),
      monthDate.getMinutes()
    );
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(
      currentDate.getDate() - (currentDate.getDay() || 7) + 1
    );
    const weekNum = getWeekNumber(currentWeekStart);
    const isSelected =
      typeDisplay === "week"
        ? date &&
          currentDate >= startOfWeek(dateOptional, { weekStartsOn: 1 }) &&
          currentDate <= endOfWeek(dateOptional, { weekStartsOn: 1 })
        : date && monthOffset === null && dateOptional.getDate() === day;
    const isHovered = hoveredWeek === weekNum;
    const isToday = monthOffset === null && isSameDay(currentDate, new Date());
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 là Chủ nhật, 6 là Thứ 7
    const isDisabled =
      (minDate &&
        currentDate.setHours(0, 0, 0, 0) <
          new Date(convertToInputDate(minDate, type)).setHours(0, 0, 0, 0)) ||
      (maxDate &&
        currentDate.setHours(0, 0, 0, 0) >
          new Date(convertToInputDate(maxDate, type)).setHours(0, 0, 0, 0));

    const textColor = isSelected
      ? "text-white dark:text-black"
      : isGrayedOut || isDisabled
      ? "text-[#868e96]/50"
      : isWeekend
      ? "text-[#e03131]"
      : "text-black dark:text-white";
    return (
      <button
        type="button"
        key={`${monthOffset}-${day}`}
        onMouseEnter={() => typeDisplay === "week" && setHoveredWeek(weekNum)}
        onMouseLeave={() => typeDisplay === "week" && setHoveredWeek(null)}
        onClick={() => !isDisabled && handleDayClick(monthOffset, day)}
        disabled={Boolean(isDisabled)}
        className={`flex flex-col justify-center items-center w-9 h-9 rounded-md ${textColor} 
      ${
        isSelected
          ? "bg-[#228be6]"
          : `${isHovered ? "bg-[#f1f3f5] dark:bg-[#3b3b3b]" : ""} ${
              !isDisabled
                ? "hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
                : "disabled:cursor-not-allowed"
            }`
      }`}
      >
        <div className="relative">
          <p className="text-[calc(2.25rem/2.8)]">{day}</p>
          {isToday && (
            <div className="absolute -top-[0.125rem] -right-[0.375rem] w-1.5 h-1.5 rounded-full bg-[#fa5252]" />
          )}
        </div>
      </button>
    );
  };

  const isDisabledPrevButton = (): boolean => {
    const dateOptional = date ?? new Date();
    switch (typeDisplay) {
      case "date":
      case "date-time": {
        const prevMonth = subMonths(dateOptional, 1);
        return Boolean(
          minDate && prevMonth < new Date(convertToInputDate(minDate, type))
        );
      }
      case "month": {
        const prevYear = subYears(dateOptional, 1);
        return Boolean(
          minDate && prevYear < new Date(convertToInputDate(minDate, type))
        );
      }
      case "year": {
        const prevDecade = subYears(dateOptional, 10);
        return Boolean(
          minDate && prevDecade < new Date(convertToInputDate(minDate, type))
        );
      }
      default:
        return false;
    }
  };

  const isDisabledNextButton = (): boolean => {
    const dateOptional = date ?? new Date();
    switch (typeDisplay) {
      case "date":
      case "date-time": {
        const nextMonth = addMonths(dateOptional, 1);
        return Boolean(
          maxDate && nextMonth > new Date(convertToInputDate(maxDate, type))
        );
      }
      case "month": {
        const nextYear = addYears(dateOptional, 1);
        return Boolean(
          maxDate && nextYear > new Date(convertToInputDate(maxDate, type))
        );
      }
      case "year": {
        const nextDecade = addYears(dateOptional, 10);
        return Boolean(
          maxDate && nextDecade > new Date(convertToInputDate(maxDate, type))
        );
      }
      default:
        return false;
    }
  };

  const isTimeDisabled = (currentDate: Date): boolean => {
    if (!minDate && !maxDate) return false;

    const minDateTime = minDate
      ? new Date(convertToInputDate(minDate, type))
      : null;
    const maxDateTime = maxDate
      ? new Date(convertToInputDate(maxDate, type))
      : null;

    if (minDateTime) {
      const isSameMinDate =
        currentDate.getFullYear() === minDateTime.getFullYear() &&
        currentDate.getMonth() === minDateTime.getMonth() &&
        currentDate.getDate() === minDateTime.getDate();

      if (isSameMinDate) {
        if (currentDate.getHours() < minDateTime.getHours()) return true;
        if (
          currentDate.getHours() === minDateTime.getHours() &&
          currentDate.getMinutes() < minDateTime.getMinutes()
        )
          return true;
      }
    }

    if (maxDateTime) {
      const isSameMaxDate =
        currentDate.getFullYear() === maxDateTime.getFullYear() &&
        currentDate.getMonth() === maxDateTime.getMonth() &&
        currentDate.getDate() === maxDateTime.getDate();

      if (isSameMaxDate) {
        if (currentDate.getHours() > maxDateTime.getHours()) return true;
        if (
          currentDate.getHours() === maxDateTime.getHours() &&
          currentDate.getMinutes() > maxDateTime.getMinutes()
        )
          return true;
      }
    }

    return false;
  };

  const getWeekNumber = (date: Date): number => {
    return getWeek(date, { weekStartsOn: 1 });
  };

  function renderPicker() {
    const getDaysInMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDate();
    };
    const getFirstWeekdayOfMonth = (month: number, year: number) => {
      return new Date(year, month, 1).getDay();
    };
    const getLastWeekdayOfMonth = (month: number, year: number) => {
      return new Date(year, month + 1, 0).getDay();
    };
    const daysArray = [];
    const dateOptional = date ?? new Date();
    const prevMonthDate = subMonths(dateOptional, 1);
    const daysInMonth = getDaysInMonth(
      dateOptional.getMonth(),
      dateOptional.getFullYear()
    );
    const firstWeekday = getFirstWeekdayOfMonth(
      dateOptional.getMonth(),
      dateOptional.getFullYear()
    );
    const lastWeekday = getLastWeekdayOfMonth(
      dateOptional.getMonth(),
      dateOptional.getFullYear()
    );
    const totalInFirstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;
    const totalInLastWeekday = lastWeekday === 0 ? 0 : 7 - lastWeekday;
    // Previous month days
    for (let i = totalInFirstWeekday; i > 0; i--) {
      const day =
        new Date(
          prevMonthDate.getFullYear(),
          prevMonthDate.getMonth() + 1,
          0
        ).getDate() -
        i +
        1;
      daysArray.push(renderDay(day, -1, true));
    }
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(renderDay(day, null));
    }
    // Next month days
    for (let day = 1; day <= totalInLastWeekday; day++) {
      daysArray.push(renderDay(day, 1, true));
    }
    const dateString = dateOptional.getDate().toString().padStart(2, "0");
    const monthString = (dateOptional.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const yearString = dateOptional.getFullYear();
    const minutes = dateOptional.getMinutes().toString().padStart(2, "0");
    const hour = dateOptional.getHours().toString().padStart(2, "0");

    const fullDateString = (() => {
      switch (type) {
        case "date":
          return `${dateString}/${monthString}/${yearString}`;
        case "date-time":
          return `${dateString}/${monthString}/${yearString}, ${hour}:${minutes}`;
        case "month":
          return `${monthString}/${yearString}`;
        case "time":
          return `${hour}:${minutes}`;
        case "week":
          return `Tuần ${getWeekNumber(dateOptional)}, ${yearString}`;
        default:
          return `${yearString}`;
      }
    })();

    const stringDateDisplay = (() => {
      switch (typeDisplay) {
        case "date":
        case "date-time":
        case "week":
          return `${monthString}/${yearString}`;
        case "month":
          return `${yearString}`;
        case "year": {
          const decadeStart = Math.floor(dateOptional.getFullYear() / 10) * 10;
          return `${decadeStart} - ${decadeStart + 9}`;
        }
        default:
          return `${yearString}`;
      }
    })();

    return (
      <div className={className} ref={pickerRef}>
        <button
          type="button"
          ref={inputRef}
          disabled={disabled}
          className="bg-white dark:bg-black w-full disabled:cursor-not-allowed disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] min-w-[9.375rem] flex items-center justify-between py-2 px-4 rounded-md border text-[#7D7E81]"
          style={{
            borderColor: isPickerVisible ? "#2684FF" : "#cccccc",
            boxShadow: isPickerVisible ? "0 0 0 1px #2684FF" : "none",
          }}
          onClick={() => {
            setIsPickerVisible(!isPickerVisible);
            setTypeDisplay(type ?? "date");
          }}
        >
          <p className="font-semibold text-left my-0">
            {!value
              ? placeholder || getDefaultPlaceholder(type)
              : fullDateString}
          </p>
          {!disabled && <IconCalendar />}
        </button>
        {createPortal(
          <div data-portal="true">
            {isPickerVisible && (
              <div
                ref={pickerVisibleRef}
                className="min-w-[18.313rem] px-4 py-3 bg-white rounded-md border shadow-lg dark:bg-[#2e2e2e] z-[1999]"
                style={pickerStyle}
              >
                {typeDisplay === "time" ? (
                  renderTimes()
                ) : (
                  <div className="flex flex-row items-center pb-[0.625rem]">
                    <button
                      type="button"
                      onClick={() => handleChangeDate(false)}
                      disabled={isDisabledPrevButton()}
                      className={`${
                        isDisabledPrevButton()
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
                      } w-9 h-9 rounded-md flex items-center justify-center`}
                    >
                      <svg
                        viewBox="0 0 15 15"
                        className="rotate-90 w-[45%] h-[45%]"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="h-9 text-sm font-semibold flex-1 hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b] rounded-md dark:text-white"
                      onClick={() => {
                        switch (typeDisplay) {
                          case "date":
                          case "date-time":
                          case "week":
                            setTypeDisplay("month");
                            break;
                          case "month":
                            setTypeDisplay("year");
                            break;
                          default:
                            break;
                        }
                      }}
                    >
                      {stringDateDisplay}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeDate(true)}
                      disabled={isDisabledNextButton()}
                      className={`${
                        isDisabledNextButton()
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
                      } w-9 h-9 rounded-md flex items-center justify-center`}
                    >
                      <svg
                        viewBox="0 0 15 15"
                        className="-rotate-90 w-[45%] h-[45%]"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>
                )}
                {(() => {
                  switch (typeDisplay) {
                    case "date":
                    case "date-time":
                      return (
                        <>
                          {renderDays(daysArray)}
                          <div className="flex justify-between pt-1">
                            <button
                              className="px-1 rounded-md text-primary hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
                              onClick={() => handleClear()}
                            >
                              Xóa
                            </button>
                            <button
                              className={`px-1 rounded-md text-primary ${
                                (minDate &&
                                  new Date().setHours(0, 0, 0, 0) <
                                    new Date(
                                      convertToInputDate(minDate, type)
                                    ).setHours(0, 0, 0, 0)) ||
                                (maxDate &&
                                  new Date().setHours(0, 0, 0, 0) >
                                    new Date(
                                      convertToInputDate(maxDate, type)
                                    ).setHours(0, 0, 0, 0))
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
                              }`}
                              onClick={() => {
                                const today = new Date();
                                if (
                                  (!minDate ||
                                    today.setHours(0, 0, 0, 0) >=
                                      new Date(
                                        convertToInputDate(minDate, type)
                                      ).setHours(0, 0, 0, 0)) &&
                                  (!maxDate ||
                                    today.setHours(0, 0, 0, 0) <=
                                      new Date(
                                        convertToInputDate(maxDate, type)
                                      ).setHours(0, 0, 0, 0))
                                ) {
                                  setDate(today);
                                  onChange?.(formatDate(today));
                                }
                              }}
                              disabled={
                                Boolean(
                                  minDate &&
                                    new Date().setHours(0, 0, 0, 0) <
                                      new Date(
                                        convertToInputDate(minDate, type)
                                      ).setHours(0, 0, 0, 0)
                                ) ||
                                Boolean(
                                  maxDate &&
                                    new Date().setHours(0, 0, 0, 0) >
                                      new Date(
                                        convertToInputDate(maxDate, type)
                                      ).setHours(0, 0, 0, 0)
                                )
                              }
                            >
                              Hôm nay
                            </button>
                          </div>
                        </>
                      );
                    case "week":
                      return (
                        <>
                          {renderDays(daysArray)}
                          <div className="flex justify-between pt-1">
                            <button
                              className="px-1 rounded-md text-primary hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
                              onClick={() => handleClear()}
                            >
                              Xóa
                            </button>
                            <button
                              className="px-1 rounded-md text-primary hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]"
                              onClick={() => {
                                const today = new Date();
                                setDate(today);
                                onChange?.(
                                  `Tuần ${getWeekNumber(
                                    new Date()
                                  )}/${today.getFullYear()}`
                                );
                              }}
                            >
                              Tuần này
                            </button>
                          </div>
                        </>
                      );
                    case "month":
                      return renderMonths();
                    case "year":
                      return renderYears();
                    default:
                      return <></>;
                  }
                })()}
              </div>
            )}
          </div>,
          document.body as Element
        )}
      </div>
    );
  }
  return renderPicker();
};

export default DateCustomInput;
