import { STATUSES, INTEREST_LEVELS } from "@shared/schema";
import { COUNTRIES, getStatesForCountry, isValidStateForCountry } from "@shared/locations";

export function getNextStatus(currentStatus: string): string {
  const terminalStatuses = ["Offer", "Rejected", "Withdrawn"];
  if (terminalStatuses.includes(currentStatus)) {
    return currentStatus;
  }
  const index = STATUSES.indexOf(currentStatus as (typeof STATUSES)[number]);
  if (index === -1 || index >= STATUSES.length - 1) {
    return currentStatus;
  }
  const next = STATUSES[index + 1];
  if (next === "Rejected" || next === "Withdrawn") {
    return currentStatus;
  }
  return next;
}

export function validateProspect(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.companyName || typeof data.companyName !== "string" || data.companyName.trim() === "") {
    errors.push("Company name is required");
  }

  if (!data.roleTitle || typeof data.roleTitle !== "string" || data.roleTitle.trim() === "") {
    errors.push("Role title is required");
  }

  if (data.status !== undefined) {
    if (!STATUSES.includes(data.status as (typeof STATUSES)[number])) {
      errors.push(`Status must be one of: ${STATUSES.join(", ")}`);
    }
  }

  if (data.interestLevel !== undefined) {
    if (!INTEREST_LEVELS.includes(data.interestLevel as (typeof INTEREST_LEVELS)[number])) {
      errors.push(`Interest level must be one of: ${INTEREST_LEVELS.join(", ")}`);
    }
  }

  if (data.salary === undefined || data.salary === null) {
    errors.push("Salary is required");
  } else if (typeof data.salary !== "number" || isNaN(data.salary)) {
    errors.push("Salary must be a valid number");
  } else if (data.salary < 0) {
    errors.push("Salary must be a positive number");
  }

  if (!data.city || typeof data.city !== "string" || data.city.trim() === "") {
    errors.push("City is required");
  }

  if (!data.country || typeof data.country !== "string" || data.country.trim() === "") {
    errors.push("Country is required");
  } else if (!COUNTRIES.includes(data.country as string)) {
    errors.push("Invalid country");
  } else {
    const states = getStatesForCountry(data.country as string);
    if (data.state && typeof data.state === "string" && data.state.trim() !== "") {
      if (states.length > 0 && !isValidStateForCountry(data.state as string, data.country as string)) {
        errors.push("Invalid state for selected country");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isTerminalStatus(status: string): boolean {
  return status === "Rejected" || status === "Withdrawn" || status === "Offer";
}
