import React from 'react'
import { DateType, useDateInput } from './useDateInput'
import DateInputBase from './DateInputBase'
import DatePickerPopup from './DatePickerPopup'
import CalendarDays from './CalendarDays'
import MonthPicker from './MonthPicker'
import YearPicker from './YearPicker'
import { formatDate, getWeekNumber } from './utils/date-utils'

interface DateCustomInputProps {
    placeholder?: string
    value?: string
    minDate?: string
    maxDate?: string
    onChange?: (dateString: string) => void
    className?: string
    disabled?: boolean
    type?: DateType
    isShowClearDate?: boolean
}

const DateCustomInput: React.FC<DateCustomInputProps> = ({
    placeholder,
    value,
    minDate,
    maxDate,
    onChange,
    className,
    disabled = false,
    type = 'date',
    isShowClearDate = false
}) => {
    const {
        date,
        setDate,
        isPickerVisible,
        setIsPickerVisible,
        isTimePickerVisible,
        setIsTimePickerVisible,
        typeDisplay,
        setTypeDisplay,
        pickerStyle,
        timePickerStyle,
        timePickerRef,
        hourInputRef,
        minuteInputRef,
        inputRef,
        pickerRef,
        pickerVisibleRef,
        hoveredWeek,
        setHoveredWeek,
        handleDayClick,
        handleWeekClick,
        handleMonthClick,
        handleYearClick,
        handleClickHour,
        handleClickMinute,
        handleClear,
        handleChangeDate,
        isDisabledNextButton,
        isDisabledPrevButton,
    } = useDateInput({ value, minDate, maxDate, onChange, type })

    const fullDateString = date ? formatDate(date, type) : ''

    const stringDateDisplay = (() => {
        const month = (date?.getMonth() ?? new Date().getMonth()) + 1
        const year = date?.getFullYear() ?? new Date().getFullYear()
        switch (typeDisplay) {
            case 'date':
            case 'date-time':
            case 'week': return `${month.toString().padStart(2, '0')}/${year}`
            case 'month': return `${year}`
            case 'year': {
                const start = Math.floor(year / 10) * 10
                return `${start} - ${start + 9}`
            }
            default: return `${year}`
        }
    })()

    const handleTodayClick = () => {
        const today = new Date()
        if (type === 'week') {
            onChange?.(`Tuần ${getWeekNumber(today)}/${today.getFullYear()}`)
        } else {
            setDate(today)
            onChange?.(formatDate(today, type))
        }
    }

    return (
        <div className={className} ref={pickerRef}>
            <DateInputBase
                value={value}
                type={type}
                placeholder={placeholder}
                isPickerVisible={isPickerVisible}
                disabled={disabled}
                inputRef={inputRef}
                onTogglePicker={() => {
                    setIsPickerVisible(!isPickerVisible)
                    setTypeDisplay(type)
                }}
                className={className}
                displayString={fullDateString}
            />
            <DatePickerPopup
                isVisible={isPickerVisible}
                typeDisplay={typeDisplay}
                style={pickerStyle}
                pickerVisibleRef={pickerVisibleRef}
                onChangeDate={handleChangeDate}
                onClear={handleClear}
                onToday={handleTodayClick}
                onToggleTypeDisplay={() => {
                    if (typeDisplay === 'date' || typeDisplay === 'date-time' || typeDisplay === 'week') setTypeDisplay('month')
                    else if (typeDisplay === 'month') setTypeDisplay('year')
                }}
                stringDateDisplay={stringDateDisplay}
                isDisabledPrev={isDisabledPrevButton()}
                isDisabledNext={isDisabledNextButton()}
                isShowClearDate={isShowClearDate}
            >
                {(() => {
                    switch (typeDisplay) {
                        case 'year':
                            return <YearPicker
                                currentDate={date ?? new Date()}
                                selectedDate={date}
                                type={type}
                                minDate={minDate}
                                maxDate={maxDate}
                                onSelect={handleYearClick}
                            />
                        case 'month':
                            return <MonthPicker
                                currentDate={date ?? new Date()}
                                selectedDate={date}
                                type={type}
                                minDate={minDate}
                                maxDate={maxDate}
                                onSelect={handleMonthClick}
                            />
                        default:
                            return <CalendarDays
                                currentDate={date ?? new Date()}
                                selectedDate={date}
                                type={type}
                                typeDisplay={typeDisplay}
                                minDate={minDate}
                                maxDate={maxDate}
                                hoveredWeek={hoveredWeek}
                                onDayClick={handleDayClick}
                                handleClickHour={handleClickHour}
                                handleClickMinute={handleClickMinute}
                                onWeekClick={handleWeekClick}
                                onWeekHover={setHoveredWeek}
                                setIsTimePickerVisible={setIsTimePickerVisible}
                                isTimePickerVisible={isTimePickerVisible}
                                hourInputRef={hourInputRef}
                                minuteInputRef={minuteInputRef}
                                setDate={setDate}
                                timePickerRef={timePickerRef}
                                timePickerStyle={timePickerStyle}
                            />
                    }
                })()}
            </DatePickerPopup>
        </div>
    )
}

export default DateCustomInput
