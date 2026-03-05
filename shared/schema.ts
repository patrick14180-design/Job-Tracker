import { pgTable, serial, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { COUNTRIES, getStatesForCountry } from "./locations";

export const STATUSES = [
  "Bookmarked",
  "Applied",
  "Phone Screen",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export const INTEREST_LEVELS = ["High", "Medium", "Low"] as const;

export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  jobUrl: text("job_url"),
  status: text("status").notNull().default("Bookmarked"),
  interestLevel: text("interest_level").notNull().default("Medium"),
  salary: doublePrecision("salary"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  status: z.enum(STATUSES).default("Bookmarked"),
  interestLevel: z.enum(INTEREST_LEVELS).default("Medium"),
  salary: z.number({ required_error: "Salary is required. If unknown, make your best guess." }).min(0, "Salary must be a positive number"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required").refine(
    (val) => COUNTRIES.includes(val),
    { message: "Invalid country" }
  ),
  state: z.string().optional().nullable(),
  jobUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (!data.state || !data.country) return true;
    const states = getStatesForCountry(data.country);
    if (states.length === 0) return true;
    return states.includes(data.state);
  },
  { message: "Invalid state for selected country", path: ["state"] }
);

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;
