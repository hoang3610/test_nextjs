import React from 'react';
import IconCalendar from '../../../assets/icons/ic_calendar.svg';
import { DateType } from './useDateInput';
import { getDefaultPlaceholder } from './utils/date-utils';

interface DateInputBaseProps {
    value?: string;
    type: DateType;
    placeholder?: string;
    isPickerVisible: boolean;
    disabled: boolean;
    inputRef: React.RefObject<HTMLButtonElement | null>; // Corrected type
    onTogglePicker: () => void;
    className?: string;
    displayString: string;
}

const DateInputBase: React.FC<DateInputBaseProps> = ({
    value,
    type,
    placeholder,
    isPickerVisible,
    disabled,
    inputRef,
    onTogglePicker,
    className,
    displayString,
}) => {
    return (
        <button
            type="button"
            ref={inputRef}
            disabled={disabled}
            className={`bg-white dark:bg-black w-full disabled:cursor-not-allowed disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] min-w-[9.375rem] flex items-center justify-between py-2 px-4 rounded-md border text-[#7D7E81] ${className}`}
            style={{ borderColor: isPickerVisible ? '#2684FF' : '#cccccc', boxShadow: isPickerVisible ? '0 0 0 1px #2684FF' : 'none' }}
            onClick={onTogglePicker}
        >
            <p className="font-semibold text-left my-0">{!value ? placeholder || getDefaultPlaceholder(type) : displayString}</p>
            {!disabled && <img src={IconCalendar} alt="calendar icon" />}
        </button>
    );
};

export default DateInputBase;