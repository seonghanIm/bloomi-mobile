/**
 * 날짜를 로컬 시간대 기준 YYYY-MM-DD 형식으로 포맷
 * (UTC 변환 없이 디바이스 로컬 시간대 사용)
 */
export const formatLocalDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 현재 연월을 YYYY-MM 형식으로 반환
 */
export const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};