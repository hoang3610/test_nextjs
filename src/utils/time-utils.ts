import { differenceInDays, format, isYesterday, parse } from "date-fns";
import { vi } from "date-fns/locale";

export const getTodayDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getTodayYearMonthDay = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = today.getFullYear();
  return `${year}-${month}-${day}`; // Trả về định dạng YYYY-MM-DD
};

export const getCurrentTime = (): string => {
  const today = new Date();
  const hour = today.getHours();
  const minutes = today.getMinutes();
  return `${hour}:${minutes}`;
};

/**
 * Converts a date string from one format to another.
 * @param {string} dateString - The date string to be converted.
 * @param {string} currentFormat - The current format of the date string (e.g., 'dd/MM/yyyy').
 * @param {string} desiredFormat - The desired format to convert to (e.g., 'yyyy/MM/dd').
 * @returns {string} - The converted date string in the desired format.
 */
export const convertDateFormat = (dateString: string, currentFormat: string, desiredFormat: string) => {
  try {
    // Parse the date using the current format
    const parsedDate = parse(dateString, currentFormat, new Date());
    // Format it to the desired format
    return format(parsedDate, desiredFormat);
  } catch (error) {
    console.error("Error converting date:", error);
    return getTodayDate(); // Return null or an error message if conversion fails
  }
};
export function timeAgoChatMessage(dateString: string, isTimeLine: boolean = false): string {
  // Parse the input date string directly
  const dateFromInput = parse(dateString, "dd/MM/yyyy HH:mm:ss", new Date());
  const now = new Date();
  const dayDiff = differenceInDays(now, dateFromInput);

  try {
    if (isTimeLine) {
      if (dayDiff > 1) {
        return format(dateFromInput, "dd/MM/yyyy HH:mm:ss", { locale: vi });
      } else if (isYesterday(dateFromInput)) {
        return format(dateFromInput, "HH:mm", { locale: vi }) + " Hôm qua";
      } else {
        return format(dateFromInput, "HH:mm", { locale: vi }) + " Hôm nay";
      }
    } else {
      return format(dateFromInput, "HH:mm", { locale: vi });
    }
  } catch (error) {
    return "Invalid Date";
  }
}
export const getCurrentMonth = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, pad with 0
  const year = now.getFullYear();

  return `${month}/${year}`;
};
