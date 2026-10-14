/**
 * Date and Time utilities for cricket match schedules and freshness indicators.
 * Converts UTC ISO strings to localized formatted strings (default Asia/Kolkata).
 */

export function formatMatchTime(isoString: string, timeZone: string = 'Asia/Kolkata'): {
  dayLabel: string;
  timeLabel: string;
  fullLabel: string;
} {
  try {
    const matchDate = new Date(isoString);
    if (isNaN(matchDate.getTime())) {
      return { dayLabel: 'Scheduled', timeLabel: 'TBD', fullLabel: 'Scheduled' };
    }

    const now = new Date();

    // Check if same calendar day in target timezone
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    const matchDayStr = new Intl.DateTimeFormat('en-IN', dateOptions).format(matchDate);
    const todayStr = new Intl.DateTimeFormat('en-IN', dateOptions).format(now);

    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
    const tomorrowStr = new Intl.DateTimeFormat('en-IN', dateOptions).format(tomorrow);

    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
    const yesterdayStr = new Intl.DateTimeFormat('en-IN', dateOptions).format(yesterday);

    let dayLabel = matchDayStr;
    if (matchDayStr === todayStr) {
      dayLabel = 'Today';
    } else if (matchDayStr === tomorrowStr) {
      dayLabel = 'Tomorrow';
    } else if (matchDayStr === yesterdayStr) {
      dayLabel = 'Yesterday';
    }

    const timeLabel = new Intl.DateTimeFormat('en-IN', timeOptions).format(matchDate);

    return {
      dayLabel,
      timeLabel: `${timeLabel} IST`,
      fullLabel: `${dayLabel}, ${timeLabel} IST`,
    };
  } catch {
    return { dayLabel: 'Scheduled', timeLabel: 'TBD', fullLabel: 'Scheduled' };
  }
}

export function formatTimeAgo(isoStringOrTimestamp: string | number | null | undefined): string {
  if (!isoStringOrTimestamp) return 'just now';

  try {
    const time =
      typeof isoStringOrTimestamp === 'number'
        ? isoStringOrTimestamp
        : new Date(isoStringOrTimestamp).getTime();

    if (isNaN(time)) return 'just now';

    const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'just now';
  }
}
