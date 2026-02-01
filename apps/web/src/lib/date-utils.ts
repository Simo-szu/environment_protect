/**
 * 日期工具函数
 */

/**
 * 安全地格式化日期
 * @param dateStr 日期字符串（ISO 8601 格式或其他可解析格式）
 * @param locale 语言环境
 * @param options 格式化选项
 * @returns 格式化后的日期字符串，如果无效则返回空字符串或原字符串
 */
export function formatDate(
  dateStr: string | null | undefined,
  locale: string = 'zh-CN',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) {
    return '';
  }

  try {
    const date = new Date(dateStr);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateStr);
      return '';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    return date.toLocaleDateString(locale, defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error, dateStr);
    return '';
  }
}

/**
 * 格式化为短日期（年-月-日）
 */
export function formatShortDate(
  dateStr: string | null | undefined,
  locale: string = 'zh-CN'
): string {
  return formatDate(dateStr, locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 格式化为日期时间
 */
export function formatDateTime(
  dateStr: string | null | undefined,
  locale: string = 'zh-CN'
): string {
  return formatDate(dateStr, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 格式化为相对时间（如"3天前"）
 */
export function formatRelativeTime(
  dateStr: string | null | undefined,
  locale: string = 'zh-CN'
): string {
  if (!dateStr) {
    return '';
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (locale === 'zh-CN' || locale === 'zh') {
      if (diffSecs < 60) return '刚刚';
      if (diffMins < 60) return `${diffMins}分钟前`;
      if (diffHours < 24) return `${diffHours}小时前`;
      if (diffDays < 7) return `${diffDays}天前`;
      return formatShortDate(dateStr, locale);
    } else {
      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return formatShortDate(dateStr, locale);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error, dateStr);
    return '';
  }
}
