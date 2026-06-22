export function formatDate(value: string | null): string {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value ?? 'Chưa có dữ liệu';
  }
}
