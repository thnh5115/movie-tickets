export const formatCountdown = (milliseconds: number): string => {
  if (milliseconds <= 0) return '00:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getTimeRemaining = (targetTime: number): number => {
  return Math.max(0, targetTime - Date.now());
};

export const isExpired = (targetTime: number): boolean => {
  return Date.now() >= targetTime;
};
