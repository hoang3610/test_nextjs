export enum STATUS {
  ACTIVE = 1,
  INACTIVE = 0,
  ALL = -1,
}

export enum GENDER {
  MALE = 1,
  FEMALE = 0,
}

export const PAGE_SIZES = [20, 50, 100];

export enum NOTIFICATION_OBJECT_TYPE {
  ORDER = 1,
  USER = 2,
}

export enum ATTENDANCE_STATUS {
  NONE = 0, // Không có
  ON_TIME = 1, // Đung giờ
  LATE = 2, // Trễ
  LEAVE_EARLY = 3, // Về sớm
  NOT_CHECKED_IN = 4, // Chưa in
  NOT_CHECKED_OUT = 5, // Chưa checkout
}

export enum ATTENDANCE_ISSUE_TYPE {
  LATE_CHECK_IN = 1,
  EARLY_CHECK_OUT = 2,
  MULTIPLE_CHECK_INS = 3,
}

export enum ABSENCE_TYPE { // Loại vắng mặt
  NONE = 0, // Không vắng mặt
  PERMITTED_PAID = 1, // Có phép - có lương
  PERMITTED_UNPAID = 2, // Có phép - không lương
  UNPERMITTED = 3, // Không phép
  NO_SHIFT = 4, // Không có ca làm
}

export enum CHECK_IN_LOCATION_TYPE {
  OUTSIDE_COMPANY = 1,
  INSIDE_COMPANY = 2,
}
