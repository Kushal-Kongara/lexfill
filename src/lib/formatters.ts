import { format as formatDate, parseISO, isValid } from "date-fns";

export function formatByType(type: string, value: string): string {
  if (value == null) return "";
  const v = value.toString().trim();

  switch (type) {
    case "currency": {
      const num = Number(v.replace(/[^0-9.-]/g, ""));
      if (isNaN(num)) return v;
      try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
      } catch { return `$${num.toFixed(2)}`; }
    }
    case "number": {
      const num = Number(v.replace(/[^0-9.-]/g, ""));
      if (isNaN(num)) return v;
      try {
        return new Intl.NumberFormat("en-US").format(num);
      } catch { return String(num); }
    }
    case "date": {
      // Accept ISO or free-form; try parseISO first.
      const iso = parseISO(v);
      if (isValid(iso)) return formatDate(iso, "MMMM d, yyyy");
      // fallback: just return input
      return v;
    }
    default:
      return v;
  }
}