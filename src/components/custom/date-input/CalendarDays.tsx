import React from 'react'
import { startOfWeek, endOfWeek, isSameDay, subMonths } from 'date-fns'
import { getWeekNumber, convertToInputDate } from './utils/date-utils'
import TimePicker from './TimePicker'
import TimePickerPopup from './TimePickerPopup'
import { DateType } from './useDateInput'

interface CalendarDaysProps {
    currentDate: Date
    selectedDate: Date | null
    typeDisplay: DateType
    type: DateType
    minDate?: string
    maxDate?: string
    hoveredWeek: number | null
    onDayClick: (offset: number | null, day: number) => void
    handleClickHour: (hour: number) => void
    handleClickMinute: (minute: number) => void
    onWeekClick: (date: Date) => void
    onWeekHover: (week: number | null) => void
    isTimePickerVisible: boolean
    setIsTimePickerVisible: (visible: boolean) => void
    hourInputRef: React.RefObject<HTMLInputElement>
    minuteInputRef: React.RefObject<HTMLInputElement>
    setDate: (date: Date) => void
    timePickerRef: React.RefObject<HTMLDivElement>
    timePickerStyle: React.CSSProperties
}

const CalendarDays: React.FC<CalendarDaysProps> = ({
    currentDate,
    selectedDate,
    typeDisplay,
    type,
    minDate,
    maxDate,
    hoveredWeek,
    onDayClick,
    handleClickHour,
    handleClickMinute,
    onWeekClick,
    onWeekHover,
    isTimePickerVisible,
    setIsTimePickerVisible,
    hourInputRef,
    minuteInputRef,
    setDate,
    timePickerRef,
    timePickerStyle,
}) => {

    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
    const getFirstWeekday = (month: number, year: number) => new Date(year, month, 1).getDay()
    const getLastWeekday = (month: number, year: number) => new Date(year, month + 1, 0).getDay()

    const renderDay = (day: number, offset: number | null, isGrayed = false) => {
        const base = offset === -1 ? subMonths(currentDate, 1)
            : offset === 1 ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                : currentDate

        const thisDate = new Date(base.getFullYear(), base.getMonth(), day)
        const isToday = isSameDay(thisDate, new Date())
        const isSelected = typeDisplay === 'week'
            ? selectedDate && thisDate >= startOfWeek(selectedDate, { weekStartsOn: 1 }) && thisDate <= endOfWeek(selectedDate, { weekStartsOn: 1 })
            : selectedDate && isSameDay(thisDate, selectedDate)

        const weekNum = getWeekNumber(thisDate)
        const isHovered = hoveredWeek === weekNum
        const isWeekend = thisDate.getDay() === 0 || thisDate.getDay() === 6;

        const isDisabled = (minDate && thisDate.setHours(0, 0, 0, 0) < new Date(convertToInputDate(minDate, type)).setHours(0, 0, 0, 0)) ||
            (maxDate && thisDate.setHours(0, 0, 0, 0) > new Date(convertToInputDate(maxDate, type)).setHours(0, 0, 0, 0))

        const textColor = isSelected
            ? 'text-white'
            : isGrayed || isDisabled
                ? 'text-[#868e96]/50'
                : isWeekend
                    ? 'text-[#e03131]'
                    : 'text-black dark:text-white'
        const isDisabledClass = isDisabled
            ? 'disabled:cursor-not-allowed'
            : isSelected
                ? 'bg-[#228be6]'
                : isHovered
                    ? 'bg-[#f1f3f5] dark:bg-[#3b3b3b]'
                    : 'hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]'

        return (
            <button
                key={`${offset}-${day}`}
                type="button"
                onClick={() => !isDisabled && onDayClick(offset, day)}
                onMouseEnter={() => typeDisplay === 'week' && onWeekHover(weekNum)}
                onMouseLeave={() => typeDisplay === 'week' && onWeekHover(null)}
                disabled={Boolean(isDisabled)}
                className={`flex flex-col justify-center items-center w-9 h-9 rounded-md ${isDisabledClass} ${textColor}`}
            >
                <div className="relative">
                    <p className="text-[calc(2.25rem/2.8)]">{day}</p>
                    {isToday && (
                        <div className="absolute -top-[0.125rem] -right-[0.375rem] w-1.5 h-1.5 rounded-full bg-[#fa5252]" />
                    )}
                </div>
            </button>
        )
    }

    const days = []
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const prevMonth = subMonths(currentDate, 1)

    const daysInMonth = getDaysInMonth(month, year)
    const firstDay = getFirstWeekday(month, year) || 7
    const lastDay = getLastWeekday(month, year)

    const totalFirst = firstDay - 1
    const totalLast = lastDay === 0 ? 0 : 7 - lastDay

    // previous
    for (let i = totalFirst; i > 0; i--) {
        const d = getDaysInMonth(prevMonth.getMonth(), prevMonth.getFullYear()) - i + 1
        days.push(renderDay(d, -1, true))
    }
    // current
    for (let d = 1; d <= daysInMonth; d++) days.push(renderDay(d, null))
    // next
    for (let d = 1; d <= totalLast; d++) days.push(renderDay(d, 1, true))

    return (
        <>
            {typeDisplay === 'week' ? (
                <>
                    <div className="flex gap-1 pb-2 text-[#868e96] text-sm dark:text-white text-center font-bold">
                        <p className="pr-1 w-9">Tuần</p>
                        <div className="grid [grid-template-columns:repeat(7,auto)]">
                            {weekDays.map((day) => (
                                <p key={day} className="w-9">{day}</p>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="border-r text-[calc(2.25rem/2.8)] pr-1">
                            {Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => {
                                const startIndex = i * 7
                                const weekDate = new Date(year, month, startIndex + 1)
                                const week = getWeekNumber(weekDate)
                                const isSelected = selectedDate && getWeekNumber(selectedDate) === week
                                const classNameAction = isSelected
                                    ? 'bg-[#228be6] text-white'
                                    : hoveredWeek === week
                                        ? 'bg-[#f1f3f5] dark:bg-[#3b3b3b]'
                                        : 'hover:bg-[#f1f3f5] dark:hover:bg-[#3b3b3b]'
                                return (
                                    <button
                                        key={`weekday-${i}`}
                                        className={`flex justify-center items-center w-9 h-9 ${classNameAction}`}
                                        onClick={() => onWeekClick(weekDate)}
                                        onMouseEnter={() => onWeekHover(week)}
                                        onMouseLeave={() => onWeekHover(null)}
                                    >{week}</button>
                                )
                            })}
                        </div>
                        <div className="grid [grid-template-columns:repeat(7,auto)]">{days}</div>
                    </div>
                </>
            ) : typeDisplay === 'time' ? (
                <>
                    <TimePicker
                        currentDate={currentDate}
                        setIsTimePickerVisible={setIsTimePickerVisible}
                        hourInputRef={hourInputRef}
                        minuteInputRef={minuteInputRef}
                        setDate={setDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        handleChangeHour={handleClickHour}
                        handleChangeMinute={handleClickMinute}
                    />
                    <TimePickerPopup
                        type={type}
                        isVisible={isTimePickerVisible}
                        currentDate={currentDate}
                        handleClickHour={handleClickHour}
                        handleClickMinute={handleClickMinute}
                        timePickerRef={timePickerRef}
                        timePickerStyle={timePickerStyle}
                        minDate={minDate}
                        maxDate={maxDate}
                    />
                </>
            ) : (
                <>
                    <div className="grid [grid-template-columns:repeat(7,auto)] pb-2 text-sm font-bold text-center text-[#868e96] dark:text-white">
                        {weekDays.map((day) => (
                            <p key={day} className="w-9">{day}</p>
                        ))}
                    </div>
                    <div className="grid [grid-template-columns:repeat(7,auto)]">{days}</div>
                    {typeDisplay === 'date-time' && (
                        <>
                            <TimePicker
                                type={type}
                                currentDate={currentDate}
                                setIsTimePickerVisible={setIsTimePickerVisible}
                                hourInputRef={hourInputRef}
                                minuteInputRef={minuteInputRef}
                                setDate={setDate}
                                minDate={minDate}
                                maxDate={maxDate}
                                handleChangeHour={handleClickHour}
                                handleChangeMinute={handleClickMinute}
                            />
                            <TimePickerPopup
                                type={type}
                                isVisible={isTimePickerVisible}
                                currentDate={currentDate}
                                handleClickHour={handleClickHour}
                                handleClickMinute={handleClickMinute}
                                timePickerRef={timePickerRef}
                                timePickerStyle={timePickerStyle}
                                minDate={minDate}
                                maxDate={maxDate}
                            />
                        </>
                    )}
                </>
            )}
        </>
    )
}

export default CalendarDays
