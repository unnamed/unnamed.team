import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

// add default locale (en)
TimeAgo.addDefaultLocale(en);

export const timeAgo = new TimeAgo('en-US');

export function formatTimeAgo(date: Date | number) {
  return timeAgo.format(date);
}