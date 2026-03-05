import { validateProspect } from "../prospect-helpers";

const validBase = {
  companyName: "Google",
  roleTitle: "Software Engineer",
  salary: 80000,
  city: "San Francisco",
  country: "United States",
};

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      ...validBase,
      companyName: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      ...validBase,
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });

  test("accepts a valid prospect with all required fields", () => {
    const result = validateProspect({
      ...validBase,
      salary: 120000,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("salary validation", () => {
  test("rejects missing salary", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      city: "NYC",
      country: "United States",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary is required");
  });

  test("rejects null salary", () => {
    const result = validateProspect({
      ...validBase,
      salary: null,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary is required");
  });

  test("rejects negative salary", () => {
    const result = validateProspect({
      ...validBase,
      salary: -50000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a positive number");
  });

  test("rejects non-numeric salary", () => {
    const result = validateProspect({
      ...validBase,
      salary: "eighty thousand",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a valid number");
  });

  test("rejects NaN salary", () => {
    const result = validateProspect({
      ...validBase,
      salary: NaN,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Salary must be a valid number");
  });

  test("accepts zero salary", () => {
    const result = validateProspect({
      ...validBase,
      salary: 0,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts whole number salary", () => {
    const result = validateProspect({
      ...validBase,
      salary: 85000,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts salary with decimals", () => {
    const result = validateProspect({
      ...validBase,
      salary: 85000.50,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts large salary values", () => {
    const result = validateProspect({
      ...validBase,
      roleTitle: "CEO",
      salary: 500000,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("location validation", () => {
  test("rejects missing city", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 120000,
      country: "United States",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("City is required");
  });

  test("rejects empty city", () => {
    const result = validateProspect({
      ...validBase,
      city: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("City is required");
  });

  test("rejects blank city (whitespace only)", () => {
    const result = validateProspect({
      ...validBase,
      city: "   ",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("City is required");
  });

  test("rejects missing country", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "Software Engineer",
      salary: 120000,
      city: "San Francisco",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Country is required");
  });

  test("rejects empty country", () => {
    const result = validateProspect({
      ...validBase,
      country: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Country is required");
  });

  test("rejects invalid country", () => {
    const result = validateProspect({
      ...validBase,
      country: "Narnia",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid country");
  });

  test("accepts valid US state for United States", () => {
    const result = validateProspect({
      ...validBase,
      state: "California",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects invalid state for United States", () => {
    const result = validateProspect({
      ...validBase,
      state: "Ontario",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid state for selected country");
  });

  test("accepts valid Canadian province for Canada", () => {
    const result = validateProspect({
      ...validBase,
      country: "Canada",
      city: "Toronto",
      state: "Ontario",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects US state for Canada", () => {
    const result = validateProspect({
      ...validBase,
      country: "Canada",
      city: "Toronto",
      state: "California",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid state for selected country");
  });

  test("accepts country with no states and any state value", () => {
    const result = validateProspect({
      ...validBase,
      country: "Singapore",
      city: "Singapore",
      state: "Anything",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts prospect with no state (state is optional)", () => {
    const result = validateProspect({
      ...validBase,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts valid UK region for United Kingdom", () => {
    const result = validateProspect({
      ...validBase,
      country: "United Kingdom",
      city: "London",
      state: "England",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("rejects invalid region for United Kingdom", () => {
    const result = validateProspect({
      ...validBase,
      country: "United Kingdom",
      city: "London",
      state: "California",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid state for selected country");
  });
});
