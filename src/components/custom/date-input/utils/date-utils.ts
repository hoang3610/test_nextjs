import { getWeek, getWeekYear } from 'date-fns'
import { DateType } from '../useDateInput'

export function convertToInputDate(dateString: string, type: DateType): string {
    switch (type) {
        case 'date-time': {
            const [datePart, timePart] = dateString.split(' ')
            const [day, month, year] = datePart.split('/')
            const [hour, minute] = timePart.split(':')
            return `${year}-${month}-${day}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
        }
        case 'week': {
            const [_, weekPart] = dateString.split('Tuần ')
            const [weekNumber, year] = weekPart.split('/')
            const firstDayOfYear = new Date(parseInt(year), 0, 1)
            const daysToAdd = (parseInt(weekNumber) - 1) * 7
            firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd)
            const month = (firstDayOfYear.getMonth() + 1).toString().padStart(2, '0')
            const day = firstDayOfYear.getDate().toString().padStart(2, '0')
            return `${year}-${month}-${day}`
        }
        case 'month': {
            const [month, year] = dateString.split('/')
            return `${year}-${month}`
        }
        case 'time': {
            const [hour, minute] = dateString.split(':')
            return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
        }
        default: {
            const [day, month, year] = dateString.split('/')
            return `${year}-${month}-${day}`
        }
    }
}

export function formatDate(date: Date, type: DateType): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const year = date.getFullYear()

    const formats = {
        'date-time': `${day}/${month}/${year} ${hour}:${minutes}`,
        'time': `${hour}:${minutes}`,
        'date': `${day}/${month}/${year}`,
        'month': `${month}/${year}`,
        'year': `${year}`,
        'week': `Tuần ${getWeekNumber(date)}/${getWeekYear(date, { weekStartsOn: 1 })}`
    }

    return formats[type] ?? ''
}

export function getWeekNumber(date: Date): number {
    return getWeek(date, { weekStartsOn: 1 })
}

export function isTimeDisabled(date: Date, minDate?: string, maxDate?: string, type?: DateType): boolean {
    if (!minDate && !maxDate) return false
    let minDateTime: Date | null = null
    let maxDateTime: Date | null = null
    // Parse minDate
    if (minDate) {
        if (type === 'time') {
            // Format: HH:mm - sử dụng ngày hiện tại
            const [hour, minute] = minDate.split(':')
            const today = new Date()
            minDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hour), parseInt(minute))
        } else if (type === 'date-time') {
            // Format: dd/MM/yyyy HH:mm
            const [datePart, timePart] = minDate.split(' ')
            if (datePart && timePart) {
                const [day, month, year] = datePart.split('/')
                const [hour, minute] = timePart.split(':')
                minDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
            }
        } else {
            // Format: dd/MM/yyyy
            minDateTime = new Date(convertToInputDate(minDate, type ?? 'date'))
        }
    }
    // Parse maxDate
    if (maxDate) {
        if (type === 'time') {
            // Format: HH:mm - sử dụng ngày hiện tại
            const [hour, minute] = maxDate.split(':')
            const today = new Date()
            maxDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hour), parseInt(minute))
        } else if (type === 'date-time') {
            // Format: dd/MM/yyyy HH:mm
            const [datePart, timePart] = maxDate.split(' ')
            if (datePart && timePart) {
                const [day, month, year] = datePart.split('/')
                const [hour, minute] = timePart.split(':')
                maxDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
            }
        } else {
            // Format: dd/MM/yyyy
            maxDateTime = new Date(convertToInputDate(maxDate, type ?? 'date'))
        }
    }
    // So sánh trực tiếp với timestamp để xử lý cả ngày và giờ
    if (minDateTime && date.getTime() < minDateTime.getTime()) {
        return true
    }
    if (maxDateTime && date.getTime() > maxDateTime.getTime()) {
        return true
    }
    return false
}



export function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate()
}

export function getFirstWeekdayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay()
}

export function getLastWeekdayOfMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDay()
}

export function getDefaultPlaceholder(type: string): string {
    const placeholders = {
        'date': 'dd/mm/yyyy',
        'date-time': 'dd/mm/yyyy, --:--',
        'month': 'mm/yyyy',
        'year': 'yyyy',
        'week': 'Tuần --, ----',
        'time': '--:--',
    };
    return placeholders[type as keyof typeof placeholders] ?? 'dd/mm/yyyy';
};