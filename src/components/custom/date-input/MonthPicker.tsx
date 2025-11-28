import React from 'react'
import { convertToInputDate } from './utils/date-utils'
import { DateType } from './useDateInput'

interface MonthPickerProps {
    currentDate: Date
    selectedDate: Date | null
    type: DateType
    minDate?: string
    maxDate?: string
    disabled?: boolean
    onSelect: (month: number) => void
}

const MonthPicker: React.FC<MonthPickerProps> = ({
    currentDate,
    selectedDate,
    type,
    minDate,
    maxDate,
    disabled = false,
    onSelect,
}) => {
    const months = Array.from({ length: 12 }, (_, i) => i)

    return (
        <div className="grid [grid-template-columns:repeat(3,auto)]">
            {months.map((month) => {
                const tempDate = new Date(currentDate.getFullYear(), month, 1).setHours(0, 0, 0, 0)
                const isSelected = selectedDate?.getMonth() === month && selectedDate?.getFullYear() === currentDate.getFullYear()
                const isDisabled =
                    (minDate && tempDate < new Date(convertToInputDate(minDate, type)).setHours(0, 0, 0, 0)) ||
                    (maxDate && tempDate > new Date(convertToInputDate(maxDate, type)).setHours(0, 0, 0, 0))

                return (
                    <button
                        key={'month-' + month}
                        type="button"
                        onClick={() => !isDisabled && onSelect(month)}
                        disabled={isDisabled || disabled}
                        className={`rounded-md h-8 ${isDisabled
                            ? 'text-[#868e96]/50 cursor-not-allowed'
                            : isSelected
                                ? 'bg-[#228be6] text-white'
                                : 'hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]'
                            }`}
                    >
                        Tháng {month + 1}
                    </button>
                )
            })}
        </div>
    )
}

export default MonthPicker
