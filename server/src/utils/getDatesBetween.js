export function getDatesBetween(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const formatted = currentDate.toISOString().split('T')[0];
    dates.push(formatted);
    currentDate.setDate(currentDate.getDate() + 1);
  };

  return dates;
};