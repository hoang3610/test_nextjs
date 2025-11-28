import { createPortal } from "react-dom"
import { isTimeDisabled } from "./utils/date-utils";
import { DateType } from "./useDateInput";

interface TimePickerPopupProps {
    isVisible: boolean;
    currentDate: Date
    minDate?: string
    maxDate?: string
    type?: DateType
    handleClickHour: (hour: number) => void
    handleClickMinute: (minute: number) => void
    timePickerRef: React.RefObject<HTMLDivElement>
    timePickerStyle: React.CSSProperties
}

const TimePickerPopup = ({
    isVisible, currentDate,
    minDate, maxDate, type = 'time',
    handleClickHour, handleClickMinute, timePickerRef, timePickerStyle
}: TimePickerPopupProps) => {

    if (!isVisible) return null

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

    const handleTimeSelect = (unit: 'hour' | 'minute', value: number) => {
        if (unit === 'hour') handleClickHour(value)
        if (unit === 'minute') handleClickMinute(value)
    }

    const renderColumn = (unit: 'hour' | 'minute', values: number[]) => (
        values.map((val) => {
            const tempDate = new Date(currentDate)
            if (unit === 'hour') tempDate.setHours(val)
            if (unit === 'minute') tempDate.setMinutes(val)
            const disabled = isTimeDisabled(tempDate, minDate, maxDate, type)

            const isSelected = (unit === 'hour' ? currentDate.getHours() : currentDate.getMinutes()) === val
            const isSelectedClass = isSelected
                ? 'bg-[#228be6] text-white'
                : disabled
                    ? 'text-[#868e96]/50 cursor-not-allowed'
                    : 'hover:bg-[#f1f3f5] dark:hover:bg-[#3b3b3b]'
            return (
                <button
                    key={val}
                    {...(
                        unit === 'hour'
                            ? ({ 'data-hour': val })
                            : ({ 'data-minute': val })
                    )}
                    onClick={() => !disabled && handleTimeSelect(unit, val)}
                    disabled={disabled}
                    className={`w-12 h-8 flex items-center justify-center rounded-md text-sm ${isSelectedClass}`}
                >
                    {val.toString().padStart(2, '0')}
                </button>
            )
        })
    )

    return createPortal(
        <div data-portal="true">
            <div
                ref={timePickerRef}
                style={timePickerStyle}
                className="bg-white dark:bg-[#2e2e2e] border rounded shadow-lg z-[2000]"
            >
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                        <div className="w-full p-1">
                            <svg viewBox="0 0 15 15" className="w-4 h-4 mx-auto rotate-180" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                        </div>
                        <div className="p-1 h-[9.375rem] overflow-y-auto">
                            {renderColumn('hour', hours)}
                        </div>
                        <div className="w-full p-1">
                            <svg viewBox="0 0 15 15" className="w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                        </div>
                    </div>
                    <span className="text-lg">:</span>
                    <div className="flex flex-col items-center">
                        <div className="w-full p-1">
                            <svg viewBox="0 0 15 15" className="w-4 h-4 mx-auto rotate-180" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                        </div>
                        <div className="p-1 h-[9.375rem] overflow-y-auto">
                            {renderColumn('minute', minutes)}
                        </div>
                        <div className="w-full p-1">
                            <svg viewBox="0 0 15 15" className="w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default TimePickerPopup