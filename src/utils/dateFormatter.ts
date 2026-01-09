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

