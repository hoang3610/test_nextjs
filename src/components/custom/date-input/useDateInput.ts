import { useState, useEffect, useRef } from 'react'
import { addMonths, subMonths, addYears, subYears } from 'date-fns'
import { convertToInputDate, formatDate } from './utils/date-utils'

export type DateType = 'date' | 'date-time' | 'time' | 'week' | 'month' | 'year'

interface useDateInputProps {
    value?: string
    minDate?: string
    maxDate?: string
    onChange?: (val: string) => void
    type?: DateType
}

export function useDateInput({
    value,
    minDate,
    maxDate,
    onChange,
    type = 'date',
}: useDateInputProps) {

    const [date, setDate] = useState<Date | null>(null)
    const [typeDisplay, setTypeDisplay] = useState<DateType>('date')
    const [isPickerVisible, setIsPickerVisible] = useState(false)
    const [isTimePickerVisible, setIsTimePickerVisible] = useState(false)
    const [pickerStyle, setPickerStyle] = useState<React.CSSProperties>({})
    const [timePickerStyle, setTimePickerStyle] = useState<React.CSSProperties>({})
    const [hoveredWeek, setHoveredWeek] = useState<number | null>(null)

    const inputRef = useRef<HTMLButtonElement>(null)
    const pickerRef = useRef<HTMLDivElement>(null)
    const pickerVisibleRef = useRef<HTMLDivElement>(null)
    const timePickerRef = useRef<HTMLDivElement>(null)
    const hourInputRef = useRef<HTMLInputElement>(null)
    const minuteInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (value === '') {
            setDate(null)
            setIsPickerVisible(false)
        } else if (value) {
            try {
                if (type === 'time' && value.match(/^\d{1,2}:\d{1,2}$/)) {
                    const [hours, minutes] = value.split(':').map(Number)
                    const newDate = new Date()
                    newDate.setHours(hours, minutes, 0, 0)
                    setDate(newDate)
                } else {
                    const convertedDate = new Date(convertToInputDate(value, type))
                    if (convertedDate.toString() === 'Invalid Date' || isNaN(convertedDate.getTime())) {
                        handleClear()
                    } else {
                        setDate(convertedDate)
                    }
                }
            } catch (error) {
                setDate(new Date())
            }
        }
    }, [value])

    useEffect(() => {
        setTypeDisplay(type)
    }, [type])

    const handleDayClick = (monthOffset: number | null, day: number) => {
        const base = date ?? new Date()
        const newDate = new Date(base)
        if (monthOffset === -1) newDate.setMonth(base.getMonth() - 1)
        if (monthOffset === 1) newDate.setMonth(base.getMonth() + 1)
        newDate.setDate(day)
        setDate(newDate)
        onChange?.(formatDate(newDate, type))
        setIsPickerVisible(false);
    }

    const handleWeekClick = (weekDate: Date) => {
        setDate(weekDate)
        onChange?.(formatDate(weekDate, type))
        if (type === 'week') setIsPickerVisible(false);
    }

    const handleMonthClick = (month: number) => {
        const base = date ?? new Date()
        const newDate = new Date(base)
        newDate.setMonth(month)
        setDate(newDate)
        onChange?.(formatDate(newDate, type))
        if (type !== 'month') setTypeDisplay(type)
        if (type === 'month') setIsPickerVisible(false);
    }

    const handleYearClick = (year: number) => {
        const base = date ?? new Date()
        const newDate = new Date(base)
        newDate.setFullYear(year)
        setDate(newDate)
        onChange?.(formatDate(newDate, type))
        if (type !== 'year') setTypeDisplay('month')
        if (type === 'year') setIsPickerVisible(false);
    }

    const handleClickHour = (hour: number) => {
        const base = date ?? new Date()
        const newDate = new Date(base)
        newDate.setHours(hour)
        setDate(newDate)
        onChange?.(formatDate(newDate, type))
    }

    const handleClickMinute = (minute: number) => {
        const base = date ?? new Date()
        const newDate = new Date(base)
        newDate.setMinutes(minute)
        setDate(newDate)
        onChange?.(formatDate(newDate, type))
    }

    const handleClear = () => {
        setDate(null)
        setIsPickerVisible(false)
        onChange?.('')
    }

    const handleChangeDate = (next: boolean) => {
        const base = date ?? new Date()
        let newDate = base
        switch (typeDisplay) {
            case 'date':
            case 'date-time':
            case 'week':
                newDate = next ? addMonths(base, 1) : subMonths(base, 1)
                break
            case 'month':
                newDate = next ? addYears(base, 1) : subYears(base, 1)
                break
            case 'year':
                newDate = next ? addYears(base, 10) : subYears(base, 10)
                break
        }
        setDate(newDate)
        onChange?.(formatDate(newDate, type))
    }

    const isDisabledPrevButton = (): boolean => {
        const base = date ?? new Date()
        switch (typeDisplay) {
            case 'date':
            case 'date-time': {
                const prevMonth = subMonths(base, 1);
                return Boolean(minDate && prevMonth < new Date(convertToInputDate(minDate, type)));
            }
            case 'month': {
                const prevYear = subYears(base, 1);
                return Boolean(minDate && prevYear < new Date(convertToInputDate(minDate, type)));
            }
            case 'year': {
                const prevDecade = subYears(base, 10);
                return Boolean(minDate && prevDecade < new Date(convertToInputDate(minDate, type)));
            }
            default:
                return false;
        }
    };

    const isDisabledNextButton = (): boolean => {
        const base = date ?? new Date()
        switch (typeDisplay) {
            case 'date':
            case 'date-time': {
                const nextMonth = addMonths(base, 1);
                return Boolean(maxDate && nextMonth > new Date(convertToInputDate(maxDate, type)));
            }
            case 'month': {
                const nextYear = addYears(base, 1);
                return Boolean(maxDate && nextYear > new Date(convertToInputDate(maxDate, type)));
            }
            case 'year': {
                const nextDecade = addYears(base, 10);
                return Boolean(maxDate && nextDecade > new Date(convertToInputDate(maxDate, type)));
            }
            default:
                return false;
        }
    };

    useEffect(() => {
        if (isPickerVisible) {

            updatePickerPosition()

            const initialPosition: React.CSSProperties = {
                position: 'fixed',
                top: `${inputRef.current?.getBoundingClientRect().bottom ?? 0 + 8}px`,
                left: `${inputRef.current?.getBoundingClientRect().left}px`,
                visibility: 'hidden'
            };
            setPickerStyle(initialPosition);
            if (pickerVisibleRef.current) {
                const observer = new MutationObserver(() => {
                    if (pickerVisibleRef.current) {
                        pickerVisibleRef.current.style.visibility = 'visible';
                        updatePickerPosition();
                        observer.disconnect();
                    }
                });
                observer.observe(pickerVisibleRef.current, {
                    attributes: true,
                    childList: true,
                    subtree: true
                });
            }
            const handleResize = () => {
                requestAnimationFrame(() => {
                    updatePickerPosition();
                });
            };
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', updatePickerPosition, true);
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', updatePickerPosition, true);
            };
        }
    }, [isPickerVisible])

    useEffect(() => {
        if (isTimePickerVisible) {
            const initialPosition: React.CSSProperties = {
                position: 'fixed',
                top: `${hourInputRef.current?.getBoundingClientRect().bottom ?? 0 + 8}px`,
                left: `${hourInputRef.current?.getBoundingClientRect().left}px`,
                visibility: 'hidden'
            };
            setTimePickerStyle(initialPosition);
            requestAnimationFrame(() => {
                updateTimePickerPosition(hourInputRef, timePickerRef);
            });
            if (timePickerRef.current) {
                const observer = new MutationObserver(() => {
                    if (timePickerRef.current) {
                        timePickerRef.current.style.visibility = 'visible';
                        updateTimePickerPosition(hourInputRef, timePickerRef);
                        observer.disconnect();
                    }
                });
                observer.observe(timePickerRef.current, {
                    attributes: true,
                    childList: true,
                    subtree: true
                });
            }
            const handleResize = () => {
                requestAnimationFrame(() => {
                    updateTimePickerPosition(hourInputRef, timePickerRef);
                });
            };
            const handleScroll = () => updateTimePickerPosition(hourInputRef, timePickerRef);
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleScroll, true);
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isTimePickerVisible]);

    useEffect(() => {
        if (isTimePickerVisible) {
            const dateOptional = date ?? new Date();
            setTimeout(() => {
                const hourElement = document.querySelector(`[data-hour="${dateOptional.getHours()}"]`);
                const minuteElement = document.querySelector(`[data-minute="${dateOptional.getMinutes()}"]`);
                const hourContainer = hourElement?.closest('.overflow-y-auto');
                const minuteContainer = minuteElement?.closest('.overflow-y-auto');
                if (hourElement && hourContainer) {
                    const containerRect = hourContainer.getBoundingClientRect();
                    const elementRect = hourElement.getBoundingClientRect();
                    const scrollTop = hourContainer.scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 2) + (elementRect.height / 2);
                    hourContainer.scrollTo({
                        top: scrollTop,
                        behavior: 'auto'
                    });
                }
                if (minuteElement && minuteContainer) {
                    const containerRect = minuteContainer.getBoundingClientRect();
                    const elementRect = minuteElement.getBoundingClientRect();
                    const scrollTop = minuteContainer.scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 2) + (elementRect.height / 2);
                    minuteContainer.scrollTo({
                        top: scrollTop,
                        behavior: 'auto'
                    });
                }
            }, 0);
        }
    }, [isTimePickerVisible]);

    const updateTimePickerPosition = (inputRef: React.RefObject<HTMLInputElement>, pickerRef: React.RefObject<HTMLDivElement>) => {
        if (inputRef.current && pickerRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const pickerHeight = pickerRef.current.getBoundingClientRect().height;
            const spaceBelow = window.innerHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const newPosition: React.CSSProperties = { position: 'fixed' };
            if (spaceBelow >= pickerHeight || spaceBelow >= spaceAbove) {
                newPosition.top = `${inputRect.bottom + 8}px`;
            } else {
                newPosition.bottom = `${window.innerHeight - inputRect.top + 8}px`;
            }
            newPosition.left = `${inputRect.left - 8}px`;
            setTimePickerStyle(newPosition);
        }
    };

    const updatePickerPosition = () => {
        if (inputRef.current && pickerVisibleRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const pickerHeight = pickerVisibleRef.current.getBoundingClientRect().height;
            const pickerWidth = pickerVisibleRef.current.getBoundingClientRect().width;
            const spaceBelow = window.innerHeight - inputRect.bottom;
            const spaceAbove = inputRect.top;
            const spaceRight = window.innerWidth - inputRect.left;
            const spaceLeft = inputRect.right;
            const newPosition: React.CSSProperties = { position: 'fixed' };

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
                const inputCenter = inputRect.left + (inputRect.width / 2);
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (type === 'date-time' || type === 'time') {
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return {
        date,
        setDate,
        isPickerVisible,
        setIsPickerVisible,
        typeDisplay,
        setTypeDisplay,
        isTimePickerVisible,
        setIsTimePickerVisible,
        pickerStyle,
        setPickerStyle,
        timePickerStyle,
        setTimePickerStyle,
        hoveredWeek,
        setHoveredWeek,
        inputRef,
        pickerRef,
        pickerVisibleRef,
        timePickerRef,
        hourInputRef,
        minuteInputRef,
        handleDayClick,
        handleWeekClick,
        handleMonthClick,
        handleYearClick,
        handleClickHour,
        handleClickMinute,
        handleClear,
        handleChangeDate,
        isDisabledPrevButton,
        isDisabledNextButton,
    }
}
