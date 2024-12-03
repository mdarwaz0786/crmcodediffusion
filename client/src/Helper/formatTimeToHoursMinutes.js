// Function to format time as "08 hours 30 minutes" or return meaningful output
const formatTimeToHoursMinutes = timeString => {
  if (!timeString) return ""; // Return empty if time is not provided

  const [hours, minutes] = timeString.split(":").map(Number); // Split hours and minutes

  if (hours === 0 && minutes === 0) {
    return null;
  }

  if (hours === 0) {
    return `${String(minutes).padStart(2, "0")} minutes`;
  }

  if (minutes === 0) {
    return `${String(hours).padStart(2, "0")} hours`;
  }

  return `${String(hours).padStart(2, "0")} hours ${String(minutes).padStart(
    2,
    "0",
  )} minutes`;
};

export default formatTimeToHoursMinutes;
