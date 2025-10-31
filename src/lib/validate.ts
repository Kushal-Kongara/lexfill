import { parseISO, isValid as isValidDate } from "date-fns";

export function validateByType(type: string, value: string): string | null {
  const v = (value ?? "").trim();
  if (!v) return "This field is required.";

  switch (type) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Please enter a valid email.";
    case "number":
      return isNaN(Number(v)) ? "Please enter a valid number." : null;
    case "currency":
      return isNaN(Number(v.replace(/[^0-9.-]/g, ""))) ? "Please enter a valid amount." : null;
    case "date":
      return isValidDate(parseISO(v)) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(v)
        ? null
        : "Please enter a valid date (YYYY-MM-DD or MM/DD/YYYY).";
    default:
      return null;
  }
}
