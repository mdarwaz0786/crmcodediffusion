// Function to format time with AM/PM
const formatTimeWithAmPm = timeString => {
  if (!timeString) return ""; // Return empty if time is not provided
  const [hour, minute] = timeString.split(":").map(Number); // Split hour and minute
  const suffix = hour >= 12 ? "PM" : "AM"; // Determine suffix
  const formattedHour = hour % 12 || 12; // Convert to 12-hour format
  return `${String(formattedHour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )} ${suffix}`;
};

export default formatTimeWithAmPm;
