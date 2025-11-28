import React from 'react'
import { convertToInputDate } from './utils/date-utils'
import { DateType } from './useDateInput'

interface YearPickerProps {
    currentDate: Date
    selectedDate: Date | null
    type: DateType
    minDate?: string
    maxDate?: string
    disabled?: boolean
    onSelect: (year: number) => void
}

const YearPicker: React.FC<YearPickerProps> = ({
    currentDate,
    selectedDate,
    type,
    minDate,
    maxDate,
    disabled = false,
    onSelect,
}) => {
    const decadeStart = Math.floor(currentDate.getFullYear() / 10) * 10
    const years = Array.from({ length: 10 }, (_, i) => decadeStart + i)

    return (
        <div className="grid [grid-template-columns:repeat(3,auto)]">
            {years.map((year) => {
                const tempDate = new Date(year, 0, 1).setHours(0, 0, 0, 0)
                const isSelected = selectedDate?.getFullYear() === year
                const isDisabled =
                    (minDate && tempDate < new Date(convertToInputDate(minDate, type)).setHours(0, 0, 0, 0)) ||
                    (maxDate && tempDate > new Date(convertToInputDate(maxDate, type)).setHours(0, 0, 0, 0))

                return (
                    <button
                        key={year}
                        type="button"
                        onClick={() => !isDisabled && onSelect(year)}
                        disabled={isDisabled || disabled}
                        className={`rounded-md h-8 ${isDisabled
                            ? 'text-[#868e96]/50 cursor-not-allowed'
                            : isSelected
                                ? 'bg-[#228be6] text-white'
                                : 'hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]'
                            }`}
                    >
                        {year}
                    </button>
                )
            })}
        </div>
    )
}

export default YearPicker
