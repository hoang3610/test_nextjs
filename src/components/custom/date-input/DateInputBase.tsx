import React from 'react'
import IconCalendar from '../../icons/icon-calendar'
import IconClock from '../../icons/icon-clock'
import { DateType } from './useDateInput'
import { getDefaultPlaceholder } from './utils/date-utils'

interface DateInputBaseProps {
    value?: string
    type?: DateType
    placeholder?: string
    isPickerVisible: boolean
    disabled?: boolean
    inputRef: React.RefObject<HTMLButtonElement>
    onTogglePicker: () => void
    className?: string
    displayString: string
}

const DateInputBase: React.FC<DateInputBaseProps> = ({
    value,
    type = 'date',
    placeholder,
    isPickerVisible,
    disabled = false,
    inputRef,
    onTogglePicker,
    className = '',
    displayString,
}) => {
    return (
        <button
            type="button"
            ref={inputRef}
            disabled={disabled}
            className={`bg-white dark:bg-black w-full disabled:cursor-not-allowed disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] min-w-[9.375rem] flex items-center gap-2 justify-between py-2 px-4 rounded-md border text-[#7D7E81] ${className}`}
            style={{
                borderColor: isPickerVisible ? '#2684FF' : '#cccccc',
                boxShadow: isPickerVisible ? '0 0 0 1px #2684FF' : 'none',
            }}
            onClick={onTogglePicker}
        >
            <p className="font-semibold text-left">
                {!value ? (placeholder ?? getDefaultPlaceholder(type)) : displayString}
            </p>
            {!disabled && (type === 'time' ? <IconClock /> : <IconCalendar />)}
        </button>
    )
}

export default DateInputBase