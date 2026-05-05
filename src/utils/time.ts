import dayjs from 'dayjs';

export function formatDisplayTime(date?: Date | string | number | null) {
  if (!date) return '';

  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : '';
}
