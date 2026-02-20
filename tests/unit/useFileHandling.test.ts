import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFileHandling } from "../../src/hooks/useFileHandling";

function createFile(content: string): File {
  return new File([content], "test.json", { type: "application/json" });
}

describe("useFileHandling", () => {
  describe("importData", () => {
    it("resolves with valid saved data", async () => {
      const { result } = renderHook(() => useFileHandling());

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

      const data = await result.current.importData(
        createFile(JSON.stringify(validData))
      );
      expect(data).toEqual(validData);
    });

    it("rejects with descriptive error for invalid JSON syntax", async () => {
      const { result } = renderHook(() => useFileHandling());

      await expect(
        result.current.importData(createFile("{not valid json"))
      ).rejects.toThrow("Invalid JSON file");
    });

    it("rejects with validation details for missing required fields", async () => {
      const { result } = renderHook(() => useFileHandling());
      const incomplete = { prStartDate: "2023-10-30" };

      await expect(
        result.current.importData(createFile(JSON.stringify(incomplete)))
      ).rejects.toThrow("Invalid data format:");
    });

    it("rejects when absences contain invalid entries", async () => {
      const { result } = renderHook(() => useFileHandling());
      const badAbsences = {
        prStartDate: "2023-10-30",
        tmpStartDate: "2019-12-02",
        absences: [{ startDate: "2024-01-01" }],
      };

      await expect(
        result.current.importData(createFile(JSON.stringify(badAbsences)))
      ).rejects.toThrow("Invalid data format:");
    });

    it("rejects when data is a primitive value", async () => {
      const { result } = renderHook(() => useFileHandling());

      await expect(
        result.current.importData(createFile('"just a string"'))
      ).rejects.toThrow("Invalid data format:");
    });

    it("rejects when data is an array instead of an object", async () => {
      const { result } = renderHook(() => useFileHandling());

      await expect(
        result.current.importData(createFile("[1, 2, 3]"))
      ).rejects.toThrow("Invalid data format:");
    });

    it("includes field paths in validation error messages", async () => {
      const { result } = renderHook(() => useFileHandling());
      const data = {
        prStartDate: "",
        tmpStartDate: "2019-12-02",
        absences: [],
      };

      await expect(
        result.current.importData(createFile(JSON.stringify(data)))
      ).rejects.toThrow("prStartDate");
    });
  });
});
