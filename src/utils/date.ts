export function isPastDate(date: string | null, now = new Date()) {
  if (!date) {
    return false;
  }

  return new Date(date).getTime() < now.getTime();
}

export function formatShortDate(date: string | null, locale = 'es-CO') {
  if (!date) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}
