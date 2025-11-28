import React from 'react'
import { createPortal } from 'react-dom'
import { DateType } from './useDateInput'

interface DatePickerPopupProps {
    isVisible: boolean
    typeDisplay: DateType
    style: React.CSSProperties
    pickerVisibleRef: React.RefObject<HTMLDivElement>
    onChangeDate: (next: boolean) => void
    onClear: () => void
    onToday: () => void
    onToggleTypeDisplay: () => void
    stringDateDisplay: string
    children?: React.ReactNode
    isDisabledPrev: boolean
    isDisabledNext: boolean
    isShowClearDate: boolean
}

const DatePickerPopup: React.FC<DatePickerPopupProps> = ({
    isVisible,
    typeDisplay,
    style,
    pickerVisibleRef,
    onChangeDate,
    onClear,
    onToday,
    onToggleTypeDisplay,
    stringDateDisplay,
    children,
    isDisabledPrev,
    isDisabledNext,
    isShowClearDate
}) => {
    if (!isVisible) return null

    return createPortal(
        <div data-portal="true">
            <div
                ref={pickerVisibleRef}
                className="min-w-[18.313rem] px-4 py-3 bg-white rounded-md border shadow-lg dark:bg-[#2e2e2e] z-[1999]"
                style={style}
            >
                {typeDisplay !== 'time' && (
                    <div className="flex flex-row items-center pb-[0.625rem]">
                        <button
                            type="button"
                            onClick={() => onChangeDate(false)}
                            disabled={isDisabledPrev}
                            className={`${isDisabledPrev ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]'} w-9 h-9 rounded-md flex items-center justify-center`}
                        >
                            <svg viewBox="0 0 15 15" className="rotate-90 w-[45%] h-[45%]" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="h-9 text-sm font-semibold flex-1 hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b] rounded-md dark:text-white"
                            onClick={onToggleTypeDisplay}
                        >
                            {stringDateDisplay}
                        </button>
                        <button
                            type="button"
                            onClick={() => onChangeDate(true)}
                            disabled={isDisabledNext}
                            className={`${isDisabledNext ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]'} w-9 h-9 rounded-md flex items-center justify-center`}
                        >
                            <svg viewBox="0 0 15 15" className="-rotate-90 w-[45%] h-[45%]" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                )}
                {children}
                {(typeDisplay === 'date' || typeDisplay === 'date-time' || typeDisplay === 'week') && (
                    <div className={`flex ${isShowClearDate ? 'justify-between' : 'justify-end'} pt-1`}>
                        {isShowClearDate && (
                            <button className="px-1 rounded-md text-primary hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]" onClick={onClear}>Xóa</button>
                        )}
                        <button className="px-1 rounded-md text-primary hover:bg-[#f1f3f5] hover:dark:bg-[#3b3b3b]" onClick={onToday}>
                            {typeDisplay === 'week' ? 'Tuần này' : 'Hôm nay'}
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}

export default DatePickerPopup