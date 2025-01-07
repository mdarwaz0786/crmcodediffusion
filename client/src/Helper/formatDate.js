// Function to convert date from "YYYY-MM-DD" to "DD MMM YYYY"
const formatDate = (dateString) => {
  if (!dateString) return ""; // Return empty if date is not provided

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const [year, month, day] = dateString.split("-").map(Number);

  const monthName = months[month - 1]; // Month is zero-indexed
  return `${day || ""} ${monthName || ""} ${year || ""}`;
};

export default formatDate;