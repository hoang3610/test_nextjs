import React from "react";
import { formatDate } from "./utils/date-utils";
import { DateType } from "./useDateInput";

interface TimePickerProps {
  currentDate: Date;
  minDate?: string;
  maxDate?: string;
  type?: DateType;
  // onChange?: (newDate: string) => void
  hourInputRef: React.RefObject<HTMLInputElement>;
  minuteInputRef: React.RefObject<HTMLInputElement>;
  setIsTimePickerVisible: (isVisible: boolean) => void;
  setDate: (date: Date) => void;
  handleChangeHour: (hour: number) => void;
  handleChangeMinute: (minute: number) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  currentDate,
  minDate,
  maxDate,
  type = "time",
  // onChange,
  hourInputRef,
  minuteInputRef,
  setIsTimePickerVisible,
  setDate,
  handleChangeHour,
  handleChangeMinute,
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${
        type === "date-time" ? "border-t pt-3 mt-3" : "py-4"
      }`}
    >
      <input
        type="text"
        value={currentDate.getHours().toString().padStart(2, "0")}
        ref={hourInputRef}
        onClick={() => {
          setIsTimePickerVisible(true);
        }}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          if (!isNaN(value) && value >= 0 && value < 24) {
            const newDate = new Date(currentDate);
            newDate.setHours(value);
            setDate(newDate);
            handleChangeHour(value);
            // onChange?.(formatDate(newDate, type));
          }
        }}
        className="w-12 text-center p-1 border rounded focus:outline-none focus:border-[#228be6]"
      />
      <span className="text-lg">:</span>
      <input
        type="text"
        value={currentDate.getMinutes().toString().padStart(2, "0")}
        ref={minuteInputRef}
        onClick={() => {
          setIsTimePickerVisible(true);
        }}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          if (!isNaN(value) && value >= 0 && value < 60) {
            const newDate = new Date(currentDate);
            newDate.setMinutes(value);
            setDate(newDate);
            handleChangeMinute(value);
            // onChange?.(formatDate(newDate, type));
          }
        }}
        className="w-12 text-center p-1 border rounded focus:outline-none focus:border-[#228be6]"
      />
    </div>
  );
};

export default TimePicker;
