import React from 'react';
import { createPortal } from 'react-dom';
import { isSameDay, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { DateType } from './useDateInput';
import { getWeekNumber, isTimeDisabled, convertToInputDate } from './utils/date-utils';

interface CalendarDaysProps {
    currentDate: Date;
    selectedDate: Date | null;
    type: DateType;
    typeDisplay: DateType;
    minDate?: string;
    maxDate?: string;
    hoveredWeek: number | null;
    onDayClick: (monthOffset: number | null, day: number) => void;
    handleClickHour: (hour: number) => void;
    handleClickMinute: (minute: number) => void;
    onWeekClick: (weekDate: Date) => void;
    onWeekHover: (weekNumber: number | null) => void;
    setIsTimePickerVisible: (isVisible: boolean) => void;
    isTimePickerVisible: boolean;
    hourInputRef: React.RefObject<HTMLInputElement | null>;
    minuteInputRef: React.RefObject<HTMLInputElement | null>;
    setDate: (date: Date) => void;
    timePickerRef: React.RefObject<HTMLDivElement | null>;
    timePickerStyle: React.CSSProperties;
}

const CalendarDays: React.FC<CalendarDaysProps> = ({
    currentDate,
    selectedDate,
    type,
    typeDisplay,
    minDate,
    maxDate,
    hoveredWeek,
    onDayClick,
    handleClickHour,
    handleClickMinute,
    onWeekClick,
    onWeekHover,
    setIsTimePickerVisible,
    isTimePickerVisible,
    hourInputRef,
    minuteInputRef,
    setDate,
    timePickerRef,
    timePickerStyle,
}) => {
    const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const renderDay = (day: number, monthOffset: number | null, isGrayedOut = false) => {
        const dateOptional = currentDate;
        const prevMonthDate = subMonths(dateOptional, 1);
        const monthDate =
            monthOffset === -1
                ? prevMonthDate
                : monthOffset === 1
                    ? new Date(dateOptional.getFullYear(), dateOptional.getMonth() + 1)
                    : dateOptional;
        const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day, monthDate.getHours(), monthDate.getMinutes());
        const currentWeekStart = new Date(dayDate);
        currentWeekStart.setDate(dayDate.getDate() - (dayDate.getDay() || 7) + 1);
        const weekNum = getWeekNumber(currentWeekStart);

        const isSelected =
            typeDisplay === "week"
                ? selectedDate && dayDate >= startOfWeek(selectedDate, { weekStartsOn: 1 }) && dayDate <= endOfWeek(selectedDate, { weekStartsOn: 1 })
                : selectedDate && monthOffset === null && dateOptional.getDate() === day;

        const isHovered = hoveredWeek === weekNum;
        const isToday = monthOffset === null && isSameDay(dayDate, new Date());
        const dayOfWeek = dayDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const isDisabled =
            (minDate && dayDate.setHours(0, 0, 0, 0) < new Date(convertToInputDate(minDate, type)).setHours(0, 0, 0, 0)) ||
            (maxDate && dayDate.setHours(0, 0, 0, 0) > new Date(convertToInputDate(maxDate, type)).setHours(0, 0, 0, 0));

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
                onMouseEnter={() => typeDisplay === "week" && onWeekHover(weekNum)}
                onMouseLeave={() => typeDisplay === "week" && onWeekHover(null)}
                onClick={() => !isDisabled && onDayClick(monthOffset, day)}
                disabled={Boolean(isDisabled)}
                className={`flex flex-col justify-center items-center w-9 h-9 rounded-md ${textColor} 
                    ${isSelected
                        ? "bg-[#228be6]"
                        : `${isHovered ? "bg-[#f1f3f5] dark:bg-[#3b3b3b]" : ""} ${!isDisabled ? "hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]" : "disabled:cursor-not-allowed"}`
                    }`}
            >
                <div className="relative">
                    <p className="text-[calc(2.25rem/2.8)]">{day}</p>
                    {isToday && <div className="absolute -top-[0.125rem] -right-[0.375rem] w-1.5 h-1.5 rounded-full bg-[#fa5252]" />}
                </div>
            </button>
        );
    };

    const renderTimes = () => {
        const dateOptional = selectedDate ?? new Date();
        return (
            <>
                <div className="pt-3 mt-3 border-t">
                    <div className="flex items-center justify-center gap-2">
                        <input
                            type="text"
                            value={dateOptional.getHours().toString().padStart(2, "0")}
                            ref={hourInputRef}
                            onClick={() => setIsTimePickerVisible(true)}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 0 && value < 24) handleClickHour(value);
                            }}
                            className="w-12 text-center p-1 border rounded focus:outline-none focus:border-[#228be6]"
                        />
                        <span className="text-lg">:</span>
                        <input
                            type="text"
                            value={dateOptional.getMinutes().toString().padStart(2, "0")}
                            ref={minuteInputRef}
                            onClick={() => setIsTimePickerVisible(true)}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 0 && value < 60) handleClickMinute(value);
                            }}
                            className="w-12 text-center p-1 border rounded focus:outline-none focus:border-[#228be6]"
                        />
                    </div>
                </div>
                {createPortal(
                    isTimePickerVisible && (
                        <div ref={timePickerRef} style={timePickerStyle} className="bg-white dark:bg-[#2e2e2e] border rounded shadow-lg z-[2000]">
                            <div className="flex items-center gap-2">
                                <div className="p-1 h-[9.375rem] overflow-y-auto">
                                    {Array.from({ length: 24 }, (_, i) => {
                                        const tempDate = new Date(dateOptional);
                                        tempDate.setHours(i);
                                        const isDisabled = isTimeDisabled(tempDate, minDate, maxDate, type);
                                        return (
                                            <button
                                                key={i}
                                                data-hour={i}
                                                disabled={isDisabled}
                                                onClick={() => !isDisabled && handleClickHour(i)}
                                                className={`w-12 h-8 flex items-center justify-center ${dateOptional.getHours() === i ? "bg-[#228be6] text-white" : isDisabled ? "text-[#868e96]/50 cursor-not-allowed" : "hover:bg-[#f1f3f5] dark:hover:bg-[#3b3b3b]"}`}
                                            >
                                                {i.toString().padStart(2, "0")}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="p-1 h-[9.375rem] overflow-y-auto">
                                    {Array.from({ length: 60 }, (_, i) => {
                                        const tempDate = new Date(dateOptional);
                                        tempDate.setMinutes(i);
                                        const isDisabled = isTimeDisabled(tempDate, minDate, maxDate, type);
                                        return (
                                            <button
                                                key={i}
                                                data-minute={i}
                                                onClick={() => !isDisabled && handleClickMinute(i)}
                                                disabled={isDisabled}
                                                className={`w-12 h-8 flex items-center justify-center ${dateOptional.getMinutes() === i ? "bg-[#228be6] text-white" : isDisabled ? "text-[#868e96]/50 cursor-not-allowed" : "hover:bg-[#f1f3f5] dark:hover:bg-[#3b3b3b]"}`}
                                            >
                                                {i.toString().padStart(2, "0")}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ),
                    document.body
                )}
            </>
        );
    };

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstWeekdayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
    const getLastWeekdayOfMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDay();

    const daysArray = [];
    const dateOptional = currentDate;
    const prevMonthDate = subMonths(dateOptional, 1);
    const daysInMonth = getDaysInMonth(dateOptional.getMonth(), dateOptional.getFullYear());
    const firstWeekday = getFirstWeekdayOfMonth(dateOptional.getMonth(), dateOptional.getFullYear());
    const lastWeekday = getLastWeekdayOfMonth(dateOptional.getMonth(), dateOptional.getFullYear());
    const totalInFirstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;
    const totalInLastWeekday = lastWeekday === 0 ? 0 : 7 - lastWeekday;

    for (let i = totalInFirstWeekday; i > 0; i--) {
        const day = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate() - i + 1;
        daysArray.push(renderDay(day, -1, true));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        daysArray.push(renderDay(day, null));
    }

    for (let day = 1; day <= totalInLastWeekday; day++) {
        daysArray.push(renderDay(day, 1, true));
    }

    if (typeDisplay === 'time') {
        return renderTimes();
    }

    return (
        <>
            {typeDisplay === "week" ? (
                <>
                    <div className="flex gap-1 mb-2 text-[#868e96] text-sm dark:text-white text-center font-bold">
                        <p className="pr-1 w-9">Tuần</p>
                        <div className="grid [grid-template-columns:repeat(7,auto)]">
                            {weekDays.map((day) => <p key={day} className="w-9">{day}</p>)}
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="border-r text-[calc(2.25rem/2.8)] pr-1">
                            {Array.from({ length: Math.ceil(daysArray.length / 7) }, (_, weekIndex) => {
                                const startDayOfWeek = weekIndex * 7;
                                const weekDate = new Date(dateOptional);
                                weekDate.setDate(1);
                                weekDate.setDate(weekDate.getDate() + startDayOfWeek);
                                const weekNumber = getWeekNumber(weekDate);
                                const weekNumberSelected = selectedDate ? getWeekNumber(selectedDate) : -1;
                                const isSelected = weekNumber === weekNumberSelected;
                                return (
                                    <button
                                        type="button"
                                        key={`week-${weekIndex}`}
                                        onClick={() => onWeekClick(weekDate)}
                                        onMouseEnter={() => onWeekHover(weekNumber)}
                                        onMouseLeave={() => onWeekHover(null)}
                                        className={`flex justify-center items-center w-9 h-9 ${isSelected ? "bg-[#228be6] text-white" : `${hoveredWeek === weekNumber ? "bg-[#f1f3f5] dark:bg-[#3b3b3b]" : ""} hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]`}`}
                                    >
                                        {weekNumber}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="grid [grid-template-columns:repeat(7,auto)]">{daysArray}</div>
                    </div>
                </>
            ) : (
                <>
                    <div className="grid [grid-template-columns:repeat(7,auto)] mb-2 text-sm font-bold text-center text-[#868e96] dark:text-white ">
                        {weekDays.map((day) => <p key={day} className="w-9">{day}</p>)}
                    </div>
                    <div className="grid [grid-template-columns:repeat(7,auto)]">{daysArray}</div>
                </>
            )}
            {typeDisplay === "date-time" && renderTimes()}
        </>
    );
};

export default CalendarDays;