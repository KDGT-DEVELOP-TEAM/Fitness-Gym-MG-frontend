export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (time: string): string => {
  return time.substring(0, 5); // HH:MM形式に変換
};

export const formatDateForGrouping = (date: string | Date | null | undefined): string => {
  // null/undefinedチェック
  if (!date) {
    return '日付不明';
  }
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Invalid Dateチェック
  if (isNaN(d.getTime())) {
    return '日付不明';
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今日';
  } else if (diffDays === 1) {
    return '昨日';
  } else if (diffDays === 2) {
    return '一昨日';
  } else {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[d.getDay()];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${weekday})`;
  }
};

export const formatDateTimeForCompare = (date: string | Date | null | undefined): string => {
  // null/undefinedチェック
  if (!date) {
    return '日付不明';
  }
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Invalid Dateチェック
  if (isNaN(d.getTime())) {
    return '日付不明';
  }
  
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[d.getDay()];
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekday}曜日 ${hours}:${minutes}`;
};

export const groupByDate = <T extends { takenAt?: string | null }>(items: T[]): Map<string, T[]> => {
  const grouped = new Map<string, T[]>();
  items.forEach((item) => {
    // takenAtがundefinedやnullの場合はスキップ
    if (!item.takenAt) {
      return;
    }
    const dateKey = formatDateForGrouping(item.takenAt);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(item);
  });
  return grouped;
};

/**
 * Format date as YYYY.M.D (e.g., "2025.12.14")
 * Used for displaying dates on image cards
 */
export const formatDateForDisplay = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

/**
 * Format date and time separately for display
 * Returns an object with dateStr and timeStr
 * Used in DashboardLessonCard component
 * 
 * @param dateString - Date string or Date object or null/undefined
 * @returns Object with dateStr and timeStr properties
 */
export const formatDateTimeSplit = (dateString: string | Date | null | undefined): { dateStr: string; timeStr: string } => {
  if (!dateString) return { dateStr: '-', timeStr: '--:--' };
  
  const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
  // Invalid Dateチェック
  if (isNaN(dateObj.getTime())) return { dateStr: '不正な日付', timeStr: '--:--' };
  
  return {
    dateStr: dateObj.toLocaleDateString('ja-JP'),
    timeStr: dateObj.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  };
};

/**
 * Format date as "M月D日 (曜日)" (e.g., "12月14日 (月)")
 * Used in LessonHistory and TrainerDashboard
 * 
 * @param dateStr - Date string or Date object or null/undefined
 * @returns Formatted date string
 */
export const formatDateWithWeekday = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 (${weekday})`;
};

/**
 * Format time as "HH:MM" or "HH:MM 〜" (e.g., "14:30" or "14:30 〜")
 * Used in LessonHistory and TrainerDashboard
 * 
 * @param dateTimeStr - Date string or Date object or null/undefined
 * @param withTilde - Whether to append " 〜" suffix (default: false)
 * @returns Formatted time string
 */
export const formatTimeOnly = (
  dateTimeStr: string | Date | null | undefined,
  withTilde: boolean = false
): string => {
  if (!dateTimeStr) return '';
  const date = typeof dateTimeStr === 'string' ? new Date(dateTimeStr) : dateTimeStr;
  if (isNaN(date.getTime())) return '';
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return withTilde ? `${hours}:${minutes} 〜` : `${hours}:${minutes}`;
};

/**
 * Calculate age from birthdate (considering month and day)
 * More accurate than simple year subtraction
 * 
 * @param birthdate - Birthdate string (YYYY-MM-DD format) or Date object or null/undefined
 * @returns Age in years, or 0 if invalid
 */
export const calculateAge = (birthdate: string | Date | null | undefined): number => {
  if (!birthdate) return 0;
  
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  if (isNaN(birth.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // まだ誕生日が来ていない場合は1歳減らす
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age < 0 ? 0 : age;
};

