// Real Calendar Date Helper
export const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getPolishedHeaderDate = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};
