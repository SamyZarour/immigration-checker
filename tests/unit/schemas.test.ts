import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { savedDataSchema } from "../../src/schemas/forms";

describe("savedDataSchema", () => {
  const validData = {
    prStartDate: "2023-10-30",
    tmpStartDate: "2019-12-02",
    absences: [
      {
        startDate: "2024-06-01",
        endDate: "2024-06-15",
        description: "Vacation",
      },
    ],
  };

  it("accepts valid saved data", () => {
    const result = savedDataSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it("accepts data with empty absences array", () => {
    const data = { ...validData, absences: [] };
    const result = savedDataSchema.parse(data);
    expect(result.absences).toEqual([]);
  });

  it("accepts data with multiple absences", () => {
    const data = {
      ...validData,
      absences: [
        { startDate: "2024-01-01", endDate: "2024-01-10", description: "A" },
        { startDate: "2024-03-01", endDate: "2024-03-15", description: "" },
      ],
    };
    const result = savedDataSchema.parse(data);
    expect(result.absences).toHaveLength(2);
  });

  it("rejects missing prStartDate", () => {
    const data = { tmpStartDate: "2019-12-02", absences: [] };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects missing tmpStartDate", () => {
    const data = { prStartDate: "2023-10-30", absences: [] };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects missing absences", () => {
    const data = { prStartDate: "2023-10-30", tmpStartDate: "2019-12-02" };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects empty prStartDate", () => {
    const data = { ...validData, prStartDate: "" };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects empty tmpStartDate", () => {
    const data = { ...validData, tmpStartDate: "" };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects non-string prStartDate", () => {
    const data = { ...validData, prStartDate: 123 };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects absences with missing startDate", () => {
    const data = {
      ...validData,
      absences: [{ endDate: "2024-06-15", description: "Trip" }],
    };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects absences with missing endDate", () => {
    const data = {
      ...validData,
      absences: [{ startDate: "2024-06-01", description: "Trip" }],
    };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects absences with missing description", () => {
    const data = {
      ...validData,
      absences: [{ startDate: "2024-06-01", endDate: "2024-06-15" }],
    };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects absences as non-array", () => {
    const data = { ...validData, absences: "not-an-array" };
    expect(() => savedDataSchema.parse(data)).toThrow(ZodError);
  });

  it("rejects completely invalid input", () => {
    expect(() => savedDataSchema.parse(null)).toThrow(ZodError);
    expect(() => savedDataSchema.parse(42)).toThrow(ZodError);
    expect(() => savedDataSchema.parse("string")).toThrow(ZodError);
    expect(() => savedDataSchema.parse([])).toThrow(ZodError);
  });

  it("strips unknown top-level properties", () => {
    const data = { ...validData, extraField: "should be ignored" };
    const result = savedDataSchema.parse(data);
    expect(result).not.toHaveProperty("extraField");
  });
});
