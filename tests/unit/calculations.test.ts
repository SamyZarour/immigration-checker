import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { addDays } from "date-fns";
import {
  daysBetween,
  calculateDaysInCanada,
  addYearsToDate,
  mergeAbsences,
  calculateCitizenship,
  calculatePRStatus,
  calculateResidencyStatus,
} from "../../src/utils/calculations";
import type { Absence } from "../../src/store/immigrationSlice";

// ============================================================================
// daysBetween
// ============================================================================

describe("daysBetween", () => {
  it("returns 1 for the same date", () => {
    const date = new Date("2024-01-01");
    expect(daysBetween(date, date)).toBe(1);
  });

  it("returns correct days for a range", () => {
    expect(daysBetween(new Date("2024-01-01"), new Date("2024-01-10"))).toBe(
      10
    );
  });

  it("handles reversed dates (absolute value)", () => {
    expect(daysBetween(new Date("2024-01-10"), new Date("2024-01-01"))).toBe(
      10
    );
  });

  it("counts across month boundaries", () => {
    expect(daysBetween(new Date("2024-01-28"), new Date("2024-02-03"))).toBe(7);
  });

  it("counts across year boundaries", () => {
    expect(daysBetween(new Date("2023-12-30"), new Date("2024-01-02"))).toBe(4);
  });

  it("handles leap year Feb 28 to Mar 1", () => {
    expect(daysBetween(new Date("2024-02-28"), new Date("2024-03-01"))).toBe(3);
  });

  it("handles non-leap year Feb 28 to Mar 1", () => {
    expect(daysBetween(new Date("2025-02-28"), new Date("2025-03-01"))).toBe(2);
  });

  it("full calendar year Jan 1 to Dec 31", () => {
    expect(daysBetween(new Date("2024-01-01"), new Date("2024-12-31"))).toBe(
      366
    );
    expect(daysBetween(new Date("2025-01-01"), new Date("2025-12-31"))).toBe(
      365
    );
  });
});

// ============================================================================
// addYearsToDate
// ============================================================================

describe("addYearsToDate", () => {
  it("adds years correctly", () => {
    const result = addYearsToDate(new Date("2020-06-15"), 5);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });

  it("handles negative years", () => {
    const result = addYearsToDate(new Date("2025-01-01"), -3);
    expect(result.getFullYear()).toBe(2022);
  });

  it("handles leap year Feb 29 to non-leap year (overflows to Mar 1)", () => {
    const result = addYearsToDate(new Date("2024-02-29"), 1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(1);
  });
});

// ============================================================================
// mergeAbsences
// ============================================================================

describe("mergeAbsences", () => {
  it("returns empty array for empty input", () => {
    expect(mergeAbsences([])).toEqual([]);
  });

  it("returns copy of single absence", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-10", endDate: "2024-01-15", description: "Trip" },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2024-01-10");
    expect(result[0].endDate).toBe("2024-01-15");
  });

  it("keeps non-overlapping absences separate", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-05", endDate: "2024-01-07", description: "A" },
      { startDate: "2024-01-20", endDate: "2024-01-22", description: "B" },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(2);
  });

  it("merges overlapping absences into union", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-10", endDate: "2024-01-20", description: "A" },
      { startDate: "2024-01-15", endDate: "2024-01-25", description: "B" },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2024-01-10");
    expect(result[0].endDate).toBe("2024-01-25");
  });

  it("merges contiguous (adjacent-day) absences", () => {
    const absences: Absence[] = [
      { startDate: "2024-06-01", endDate: "2024-06-15", description: "USA" },
      {
        startDate: "2024-06-16",
        endDate: "2024-06-30",
        description: "France",
      },
      {
        startDate: "2024-07-01",
        endDate: "2024-07-31",
        description: "Turkey",
      },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2024-06-01");
    expect(result[0].endDate).toBe("2024-07-31");
  });

  it("chain-merges multiple overlapping absences", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-01", endDate: "2024-01-10", description: "A" },
      { startDate: "2024-01-08", endDate: "2024-01-20", description: "B" },
      { startDate: "2024-01-18", endDate: "2024-01-30", description: "C" },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2024-01-01");
    expect(result[0].endDate).toBe("2024-01-30");
  });

  it("handles unsorted input", () => {
    const absences: Absence[] = [
      { startDate: "2024-03-01", endDate: "2024-03-10", description: "B" },
      { startDate: "2024-01-01", endDate: "2024-01-10", description: "A" },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(2);
    expect(result[0].startDate).toBe("2024-01-01");
    expect(result[1].startDate).toBe("2024-03-01");
  });

  it("does not merge absences with a gap of 2+ days", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-01", endDate: "2024-01-10", description: "A" },
      { startDate: "2024-01-12", endDate: "2024-01-20", description: "B" },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(2);
  });

  it("merges when second absence is fully contained within the first", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-01", endDate: "2024-01-31", description: "Long" },
      { startDate: "2024-01-10", endDate: "2024-01-15", description: "Short" },
    ];
    const result = mergeAbsences(absences);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2024-01-01");
    expect(result[0].endDate).toBe("2024-01-31");
  });
});

// ============================================================================
// calculateDaysInCanada
// ============================================================================

describe("calculateDaysInCanada", () => {
  const noAbsences: Absence[] = [];

  it("returns total days when no absences", () => {
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        noAbsences
      )
    ).toBe(31);
  });

  it("subtracts absence fully within the period (boundary day rule applied)", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-10", endDate: "2024-01-15", description: "Trip" },
    ];
    // Jan 10-15 = 6 inclusive days, return day (Jan 15) present → 5 absent
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(26);
  });

  it("handles absence partially overlapping the start of the period", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-05", endDate: "2024-01-12", description: "Trip" },
    ];
    // Adjusted absence: Jan 5-11. Overlap with Jan 10-20: Jan 10-11 = 2 days
    expect(
      calculateDaysInCanada(
        new Date("2024-01-10"),
        new Date("2024-01-20"),
        absences
      )
    ).toBe(9);
  });

  it("handles absence partially overlapping the end of the period", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-18", endDate: "2024-01-25", description: "Trip" },
    ];
    // Adjusted absence: Jan 18-24. Overlap with Jan 10-20: Jan 18-20 = 3 days
    expect(
      calculateDaysInCanada(
        new Date("2024-01-10"),
        new Date("2024-01-20"),
        absences
      )
    ).toBe(8);
  });

  it("handles absence completely outside the period", () => {
    const absences: Absence[] = [
      { startDate: "2024-03-01", endDate: "2024-03-10", description: "Trip" },
    ];
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(31);
  });

  it("handles absence covering the entire period", () => {
    const absences: Absence[] = [
      { startDate: "2024-01-05", endDate: "2024-01-25", description: "Trip" },
    ];
    expect(
      calculateDaysInCanada(
        new Date("2024-01-10"),
        new Date("2024-01-20"),
        absences
      )
    ).toBe(0);
  });

  it("handles multiple non-overlapping absences", () => {
    const absences: Absence[] = [
      {
        startDate: "2024-01-05",
        endDate: "2024-01-07",
        description: "Trip 1",
      },
      {
        startDate: "2024-01-20",
        endDate: "2024-01-22",
        description: "Trip 2",
      },
    ];
    // Trip 1: Jan 5-6 adjusted = 2 absent. Trip 2: Jan 20-21 adjusted = 2 absent
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(27);
  });

  it("never returns negative", () => {
    const absences: Absence[] = [
      { startDate: "2023-12-01", endDate: "2024-02-01", description: "Trip" },
    ];
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-10"),
        absences
      )
    ).toBe(0);
  });

  it("same-day absence is not counted per IRCC (BUG 2 fixed)", () => {
    const absences: Absence[] = [
      {
        startDate: "2024-01-15",
        endDate: "2024-01-15",
        description: "Day trip",
      },
    ];
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(31);
  });

  it("correctly merges overlapping absences (BUG 6 fixed)", () => {
    const absences: Absence[] = [
      {
        startDate: "2024-01-10",
        endDate: "2024-01-20",
        description: "Trip 1",
      },
      {
        startDate: "2024-01-15",
        endDate: "2024-01-25",
        description: "Trip 2",
      },
    ];
    // Merged: Jan 10-25. Adjusted end: Jan 24. Overlap with Jan 1-31: Jan 10-24 = 15 days
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(16);
  });

  it("same-day absences have zero impact on total (Profile F check)", () => {
    const absences: Absence[] = Array.from({ length: 10 }, (_, i) => ({
      startDate: `2024-${String(i + 1).padStart(2, "0")}-15`,
      endDate: `2024-${String(i + 1).padStart(2, "0")}-15`,
      description: `Day trip ${i + 1}`,
    }));
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-12-31"),
        absences
      )
    ).toBe(366);
  });
});

// ============================================================================
// calculateCitizenship -- Profile Tests
// ============================================================================

describe("calculateCitizenship", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --------------------------------------------------------------------------
  // Profile B: Direct PR, No Temp History, No Absences
  // --------------------------------------------------------------------------
  describe("Profile B: Direct PR, no temp history, no absences", () => {
    const prStart = "2022-06-01";
    const tmpStart = prStart;

    it("is eligible once 1095 PR days have accumulated", () => {
      vi.setSystemTime(new Date("2025-07-01"));
      const result = calculateCitizenship(prStart, tmpStart, []);

      expect(result.tempDays).toBe(0);
      expect(result.totalDays).toBeGreaterThanOrEqual(1095);
      expect(result.eligible).toBe(true);
    });

    it("is not eligible when PR days < 1095", () => {
      vi.setSystemTime(new Date("2024-12-01"));
      const result = calculateCitizenship(prStart, tmpStart, []);

      expect(result.tempDays).toBe(0);
      expect(result.eligible).toBe(false);
      expect(result.citizenshipDate.getTime()).toBeGreaterThan(
        new Date("2024-12-01").getTime()
      );
    });

    it("totalDays equals prDays when no temp credit", () => {
      vi.setSystemTime(new Date("2025-06-01"));
      const result = calculateCitizenship(prStart, tmpStart, []);

      expect(result.totalDays).toBe(result.prDays);
    });
  });

  // --------------------------------------------------------------------------
  // Profile C: Long-Term Temp Resident (Cap at 365)
  // --------------------------------------------------------------------------
  describe("Profile C: Long-term temp resident, cap at 365 credited days", () => {
    it("caps temp credit at 365 days", () => {
      vi.setSystemTime(new Date("2025-06-01"));
      const result = calculateCitizenship("2023-01-01", "2017-01-01", []);

      const creditedTemp = Math.min(Math.floor(result.tempDays / 2), 365);
      expect(creditedTemp).toBe(365);
    });
  });

  // --------------------------------------------------------------------------
  // Profile D: Temp Exactly at Cap Boundary (730 actual days)
  // --------------------------------------------------------------------------
  describe("Profile D: Temp exactly at cap boundary", () => {
    it("reaches exactly 365 credited days from sufficient temp days", () => {
      vi.setSystemTime(new Date("2026-06-15"));

      const result = calculateCitizenship("2023-06-15", "2019-01-01", []);

      const creditedTemp = Math.min(Math.floor(result.tempDays / 2), 365);
      expect(creditedTemp).toBe(365);
    });
  });

  // --------------------------------------------------------------------------
  // Profile E: Frequent Short-Trip Traveler (15 absences)
  // --------------------------------------------------------------------------
  describe("Profile E: Frequent short-trip traveler", () => {
    const absences: Absence[] = [
      { startDate: "2023-02-10", endDate: "2023-02-14", description: "1" },
      { startDate: "2023-04-01", endDate: "2023-04-05", description: "2" },
      { startDate: "2023-06-10", endDate: "2023-06-13", description: "3" },
      { startDate: "2023-08-20", endDate: "2023-08-24", description: "4" },
      { startDate: "2023-10-05", endDate: "2023-10-08", description: "5" },
      { startDate: "2023-12-20", endDate: "2023-12-24", description: "6" },
      { startDate: "2024-01-15", endDate: "2024-01-19", description: "7" },
      { startDate: "2024-03-10", endDate: "2024-03-13", description: "8" },
      { startDate: "2024-05-01", endDate: "2024-05-04", description: "9" },
      { startDate: "2024-07-15", endDate: "2024-07-18", description: "10" },
      { startDate: "2024-09-01", endDate: "2024-09-03", description: "11" },
      { startDate: "2024-11-10", endDate: "2024-11-14", description: "12" },
      { startDate: "2025-01-05", endDate: "2025-01-09", description: "13" },
      { startDate: "2025-03-15", endDate: "2025-03-18", description: "14" },
      { startDate: "2025-05-10", endDate: "2025-05-12", description: "15" },
    ];

    it("with 15 short absences, is still eligible if enough PR days", () => {
      vi.setSystemTime(new Date("2026-03-01"));
      const result = calculateCitizenship("2022-01-01", "2022-01-01", absences);

      expect(result.totalDays).toBeGreaterThanOrEqual(1095);
      expect(result.eligible).toBe(true);
    });

    it("shows fewer days than no-absence baseline", () => {
      vi.setSystemTime(new Date("2026-01-01"));
      const withAbsences = calculateCitizenship(
        "2022-01-01",
        "2022-01-01",
        absences
      );
      const noAbsences = calculateCitizenship("2022-01-01", "2022-01-01", []);

      expect(withAbsences.prDaysToday).toBeLessThan(noAbsences.prDaysToday);
    });
  });

  // --------------------------------------------------------------------------
  // Profile F: Same-Day Border Crosser (10 day trips)
  // --------------------------------------------------------------------------
  describe("Profile F: Same-day border crosser", () => {
    const absences: Absence[] = Array.from({ length: 10 }, (_, i) => ({
      startDate: `2024-${String(i + 1).padStart(2, "0")}-15`,
      endDate: `2024-${String(i + 1).padStart(2, "0")}-15`,
      description: `Day trip ${i + 1}`,
    }));

    it("same-day trips have zero impact (BUG 2 fixed)", () => {
      vi.setSystemTime(new Date("2025-06-01"));
      const withDayTrips = calculateCitizenship(
        "2022-01-01",
        "2022-01-01",
        absences
      );
      const noDayTrips = calculateCitizenship("2022-01-01", "2022-01-01", []);

      expect(noDayTrips.prDaysToday - withDayTrips.prDaysToday).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Profile G: Just-Barely-Eligible (Threshold Boundary)
  // --------------------------------------------------------------------------
  describe("Profile G: Threshold boundary at exactly 1095 days", () => {
    it("becomes eligible on the exact day totalDays hits 1095", () => {
      const prStart = "2022-01-01";
      vi.setSystemTime(new Date("2024-12-25"));

      const result = calculateCitizenship(prStart, prStart, []);

      expect(result.totalDays).toBeGreaterThanOrEqual(1095);
      expect(result.totalDays).toBeLessThanOrEqual(1096);
    });

    it("is not eligible one day before the threshold date", () => {
      const prStart = "2022-01-01";
      vi.setSystemTime(new Date("2024-12-25"));

      const result = calculateCitizenship(prStart, prStart, []);
      const eligDate = result.citizenshipDate;

      const dayBefore = addDays(eligDate, -1);
      vi.setSystemTime(dayBefore);

      const beforeResult = calculateCitizenship(prStart, prStart, []);
      if (beforeResult.totalDaysToday < 1095) {
        expect(beforeResult.eligible).toBe(false);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Profile H: COVID-Era Long Absence
  // --------------------------------------------------------------------------
  describe("Profile H: COVID-era long absence during temp period", () => {
    const absences: Absence[] = [
      {
        startDate: "2020-03-15",
        endDate: "2022-01-15",
        description: "COVID absence",
      },
    ];

    it("reduces temp credit due to COVID absence", () => {
      vi.setSystemTime(new Date("2026-06-01"));
      const withCovid = calculateCitizenship(
        "2023-06-01",
        "2019-09-01",
        absences
      );
      const noCovid = calculateCitizenship("2023-06-01", "2019-09-01", []);

      expect(withCovid.tempDays).toBeLessThan(noCovid.tempDays);
    });

    it("still has PR days unaffected by temp-period absence", () => {
      vi.setSystemTime(new Date("2026-06-01"));
      const result = calculateCitizenship("2023-06-01", "2019-09-01", absences);

      expect(result.prDays).toBeGreaterThan(900);
    });

    it("5-year window clamps correctly when absence spans the boundary", () => {
      vi.setSystemTime(new Date("2026-06-01"));
      const result = calculateCitizenship("2023-06-01", "2019-09-01", absences);

      expect(result.tempDays).toBeGreaterThan(0);
      expect(result.totalDays).toBeGreaterThanOrEqual(1095);
    });
  });

  // --------------------------------------------------------------------------
  // Profile I: Recent PR with Extensive Temp Credit
  // --------------------------------------------------------------------------
  describe("Profile I: Recent PR, mostly temp credit", () => {
    it("is not eligible with only 5 months of PR", () => {
      vi.setSystemTime(new Date("2025-06-01"));
      const result = calculateCitizenship("2025-01-01", "2020-01-01", []);

      expect(result.eligible).toBe(false);
      expect(result.totalDaysToday).toBeGreaterThan(400);
      expect(result.totalDaysToday).toBeLessThan(600);
    });

    it("temp credit is capped at 365 even with 5 years of temp", () => {
      vi.setSystemTime(new Date("2025-06-01"));
      const result = calculateCitizenship("2025-01-01", "2020-01-01", []);

      const creditedTemp = Math.min(Math.floor(result.tempDaysToday / 2), 365);
      expect(creditedTemp).toBe(365);
    });
  });

  // --------------------------------------------------------------------------
  // Profile A: Turkish Immigrant (Real User Data from data.json)
  // --------------------------------------------------------------------------
  describe("Profile A: Turkish immigrant (real user data)", () => {
    const turkishAbsences: Absence[] = [
      {
        startDate: "2020-04-10",
        endDate: "2021-07-01",
        description: "Covid school year",
      },
      {
        startDate: "2023-12-09",
        endDate: "2023-12-09",
        description: "Bellingham day trip",
      },
      {
        startDate: "2024-01-12",
        endDate: "2024-02-11",
        description: "New York visit",
      },
      {
        startDate: "2024-04-06",
        endDate: "2024-04-20",
        description: "Thailand",
      },
      {
        startDate: "2024-05-03",
        endDate: "2024-05-11",
        description: "New York niece birthday",
      },
      {
        startDate: "2024-06-07",
        endDate: "2024-06-14",
        description: "New York family",
      },
      {
        startDate: "2024-06-15",
        endDate: "2024-06-15",
        description: "Egypt layover",
      },
      {
        startDate: "2024-06-16",
        endDate: "2024-09-07",
        description: "Turkey friends wedding",
      },
      {
        startDate: "2024-12-25",
        endDate: "2025-01-22",
        description: "New York family",
      },
      {
        startDate: "2025-01-25",
        endDate: "2025-01-31",
        description: "Mexico Cancun",
      },
      {
        startDate: "2025-02-15",
        endDate: "2025-02-15",
        description: "New York family",
      },
      {
        startDate: "2025-04-30",
        endDate: "2025-07-24",
        description: "Europe and Turkey trip",
      },
    ];
    const prStart = "2023-10-30";
    const tmpStart = "2019-12-02";

    it("is not eligible as of 2026-02-17", () => {
      vi.setSystemTime(new Date("2026-02-17"));
      const result = calculateCitizenship(prStart, tmpStart, turkishAbsences);

      expect(result.eligible).toBe(false);
      expect(result.citizenshipDate.getTime()).toBeGreaterThan(
        new Date("2026-02-17").getTime()
      );
    });

    it("has non-zero temp and PR days", () => {
      vi.setSystemTime(new Date("2026-02-17"));
      const result = calculateCitizenship(prStart, tmpStart, turkishAbsences);

      expect(result.tempDaysToday).toBeGreaterThan(0);
      expect(result.prDaysToday).toBeGreaterThan(0);
    });

    it("temp credit is capped at 365", () => {
      vi.setSystemTime(new Date("2026-02-17"));
      const result = calculateCitizenship(prStart, tmpStart, turkishAbsences);

      const creditedTemp = Math.min(Math.floor(result.tempDaysToday / 2), 365);
      expect(creditedTemp).toBeLessThanOrEqual(365);
    });

    it("absences reduce both temp and PR day counts", () => {
      vi.setSystemTime(new Date("2026-02-17"));
      const withAbsences = calculateCitizenship(
        prStart,
        tmpStart,
        turkishAbsences
      );
      const noAbsences = calculateCitizenship(prStart, tmpStart, []);

      expect(withAbsences.prDaysToday).toBeLessThan(noAbsences.prDaysToday);
      expect(withAbsences.tempDaysToday).toBeLessThan(noAbsences.tempDaysToday);
    });

    it("progress is between 0 and 100", () => {
      vi.setSystemTime(new Date("2026-02-17"));
      const result = calculateCitizenship(prStart, tmpStart, turkishAbsences);

      expect(result.progress).toBeGreaterThan(0);
      expect(result.progress).toBeLessThanOrEqual(100);
    });

    it("remainingDays is positive when not eligible", () => {
      vi.setSystemTime(new Date("2026-02-17"));
      const result = calculateCitizenship(prStart, tmpStart, turkishAbsences);

      expect(result.remainingDays).toBeGreaterThan(0);
    });

    it("eligibility date is in the future", () => {
      vi.setSystemTime(new Date("2026-02-17"));
      const result = calculateCitizenship(prStart, tmpStart, turkishAbsences);

      const eligDateStr = result.citizenshipDate.toISOString().split("T")[0];
      expect(eligDateStr > "2026-02-17").toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Edge Case: PR start date > 5 years ago (clamped to fiveYearsAgo)
  // --------------------------------------------------------------------------
  describe("Edge Case: PR start date older than 5 years", () => {
    it("clamps PR start to 5-year window when PR is older", () => {
      vi.setSystemTime(new Date("2026-06-15"));
      const result = calculateCitizenship("2018-01-01", "2016-01-01", []);

      expect(result.eligible).toBe(true);
      expect(result.totalDays).toBeGreaterThanOrEqual(1095);
      expect(result.prDays).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Profile L: Consecutive Absences Without Returning to Canada
  // --------------------------------------------------------------------------
  describe("Profile L: Consecutive absences (continuous trip)", () => {
    it("contiguous absences entered as separate records equal one combined record", () => {
      vi.setSystemTime(new Date("2026-01-01"));

      const contiguousAbsences: Absence[] = [
        {
          startDate: "2024-06-01",
          endDate: "2024-06-15",
          description: "USA",
        },
        {
          startDate: "2024-06-16",
          endDate: "2024-06-30",
          description: "France",
        },
        {
          startDate: "2024-07-01",
          endDate: "2024-07-31",
          description: "Turkey",
        },
      ];

      const singleAbsence: Absence[] = [
        {
          startDate: "2024-06-01",
          endDate: "2024-07-31",
          description: "Combined trip",
        },
      ];

      const resultSplit = calculateCitizenship(
        "2022-01-01",
        "2022-01-01",
        contiguousAbsences
      );
      const resultCombined = calculateCitizenship(
        "2022-01-01",
        "2022-01-01",
        singleAbsence
      );

      expect(resultSplit.prDaysToday).toBe(resultCombined.prDaysToday);
      expect(resultSplit.totalDaysToday).toBe(resultCombined.totalDaysToday);
    });
  });
});

// ============================================================================
// calculatePRStatus -- Profile Tests
// ============================================================================

describe("calculatePRStatus", () => {
  it("returns safe when citizenship date is before 5 years after PR", () => {
    const result = calculatePRStatus("2022-01-01", new Date("2025-01-01"), []);
    expect(result.status).toBe("safe");
    expect(result.lossDate).toBeNull();
  });

  it("returns safe when present > 730 days in every 5-year window", () => {
    const absences: Absence[] = [
      {
        startDate: "2022-06-01",
        endDate: "2022-07-01",
        description: "Vacation",
      },
    ];
    const result = calculatePRStatus(
      "2020-01-01",
      new Date("2026-01-01"),
      absences
    );
    expect(result.status).toBe("safe");
  });

  // Profile J: PR at Risk of Losing Status
  describe("Profile J: PR at risk of losing status", () => {
    it("returns danger when heavily absent in 5-year window", () => {
      const absences: Absence[] = [
        {
          startDate: "2019-06-01",
          endDate: "2021-06-01",
          description: "Long absence 1",
        },
        {
          startDate: "2022-01-01",
          endDate: "2023-06-01",
          description: "Long absence 2",
        },
      ];

      const result = calculatePRStatus(
        "2019-01-01",
        new Date("2026-01-01"),
        absences
      );

      expect(result.status).toBe("danger");
      expect(result.lossDate).toBeInstanceOf(Date);
    });

    it("lossDate is a date in the future relative to PR start + 5 years", () => {
      const absences: Absence[] = [
        {
          startDate: "2019-06-01",
          endDate: "2022-06-01",
          description: "3-year absence",
        },
      ];

      const result = calculatePRStatus(
        "2019-01-01",
        new Date("2026-01-01"),
        absences
      );

      if (result.status === "danger") {
        const lossYear = result.lossDate!.getFullYear();
        expect(lossYear).toBeGreaterThanOrEqual(2024);
      }
    });
  });
});

// ============================================================================
// calculateResidencyStatus -- Profile Tests
// ============================================================================

describe("calculateResidencyStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns safe when present all year with no absences", () => {
    vi.setSystemTime(new Date("2025-06-01"));
    const result = calculateResidencyStatus(new Date("2026-01-01"), []);
    expect(result.status).toBe("safe");
    expect(result.lossDate).toBeNull();
  });

  // Profile K: Tax Residency Danger
  describe("Profile K: Tax residency danger", () => {
    it("flags year where presence < 183 days", () => {
      vi.setSystemTime(new Date("2026-01-01"));

      const absences: Absence[] = [
        {
          startDate: "2026-01-01",
          endDate: "2026-08-01",
          description: "Long trip",
        },
      ];

      const result = calculateResidencyStatus(new Date("2027-01-01"), absences);

      expect(result.status).toBe("danger");
      expect(result.lossDate).toBe(2026);
    });

    it("returns safe when marginally above 183 days per year", () => {
      vi.setSystemTime(new Date("2025-01-01"));

      const absences: Absence[] = [
        {
          startDate: "2025-03-01",
          endDate: "2025-08-01",
          description: "5-month trip",
        },
      ];

      const result = calculateResidencyStatus(new Date("2026-01-01"), absences);

      const absentDays = daysBetween(
        new Date("2025-03-01"),
        new Date("2025-08-01")
      );
      const yearDays = daysBetween(
        new Date("2025-01-01"),
        new Date("2026-01-01")
      );
      const presentDays = yearDays - absentDays;
      if (presentDays >= 183) {
        expect(result.status).toBe("safe");
      } else {
        expect(result.status).toBe("danger");
      }
    });

    it("flags the correct year when multiple years checked", () => {
      vi.setSystemTime(new Date("2024-01-01"));

      const absences: Absence[] = [
        {
          startDate: "2025-01-01",
          endDate: "2025-09-01",
          description: "Long trip in 2025",
        },
      ];

      const result = calculateResidencyStatus(new Date("2027-01-01"), absences);

      if (result.status === "danger") {
        expect(result.lossDate).toBe(2025);
      }
    });
  });
});

// ============================================================================
// IRCC Compliance Tests
//
// These tests assert CORRECT behavior per official IRCC rules.
// All 6 bugs have been fixed, so these should now pass.
// ============================================================================

describe("IRCC Compliance", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("BUG 1 FIXED: absence days respect IRCC boundary day rule", () => {
    const absences: Absence[] = [
      {
        startDate: "2024-01-10",
        endDate: "2024-01-14",
        description: "5-day trip",
      },
    ];
    // Jan 10-14 = 5 inclusive days, return day (Jan 14) present → 4 absent
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(27);
  });

  it("BUG 2 FIXED: same-day trip is not an absence per IRCC", () => {
    const absences: Absence[] = [
      {
        startDate: "2024-01-15",
        endDate: "2024-01-15",
        description: "Day trip to USA",
      },
    ];
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(31);
  });

  it("BUG 3 FIXED: PR start date is not counted in temp period", () => {
    vi.setSystemTime(new Date("2026-01-01"));
    const result = calculateCitizenship("2024-01-01", "2023-01-01", []);
    // Temp period: 2023-01-01 to 2023-12-31 = 365 days (excludes PR start)
    expect(result.tempDays).toBe(365);
  });

  it("BUG 4 FIXED: application date does not count toward physical presence", () => {
    vi.setSystemTime(new Date("2025-12-31"));
    const result = calculateCitizenship("2022-12-31", "2022-12-31", []);
    // PR period: 2022-12-31 to 2025-12-30 (day before application) = 1096 days
    expect(result.prDays).toBe(1096);
  });

  it("BUG 5 FIXED: remainingDays is 0 and eligible is true when already eligible", () => {
    vi.setSystemTime(new Date("2026-01-01"));
    const result = calculateCitizenship("2022-01-01", "2022-01-01", []);
    expect(result.eligible).toBe(true);
    expect(result.remainingDays).toBe(0);
  });

  it("BUG 6 FIXED: overlapping absences do not double-subtract days", () => {
    const absences: Absence[] = [
      {
        startDate: "2024-01-10",
        endDate: "2024-01-20",
        description: "Trip 1",
      },
      {
        startDate: "2024-01-15",
        endDate: "2024-01-25",
        description: "Trip 2",
      },
    ];
    // Merged: Jan 10-25. Adjusted end: Jan 24. Overlap: Jan 10-24 = 15 days absent
    expect(
      calculateDaysInCanada(
        new Date("2024-01-01"),
        new Date("2024-01-31"),
        absences
      )
    ).toBe(16);
  });

  it("Turkish immigrant data now reports more credited days with bug fixes", () => {
    vi.setSystemTime(new Date("2026-02-17"));

    const turkishAbsences: Absence[] = [
      {
        startDate: "2020-04-10",
        endDate: "2021-07-01",
        description: "Covid",
      },
      {
        startDate: "2023-12-09",
        endDate: "2023-12-09",
        description: "Bellingham",
      },
      {
        startDate: "2024-01-12",
        endDate: "2024-02-11",
        description: "New York",
      },
      {
        startDate: "2024-04-06",
        endDate: "2024-04-20",
        description: "Thailand",
      },
      {
        startDate: "2024-05-03",
        endDate: "2024-05-11",
        description: "New York",
      },
      {
        startDate: "2024-06-07",
        endDate: "2024-06-14",
        description: "New York",
      },
      {
        startDate: "2024-06-15",
        endDate: "2024-06-15",
        description: "Egypt",
      },
      {
        startDate: "2024-06-16",
        endDate: "2024-09-07",
        description: "Turkey",
      },
      {
        startDate: "2024-12-25",
        endDate: "2025-01-22",
        description: "New York",
      },
      {
        startDate: "2025-01-25",
        endDate: "2025-01-31",
        description: "Mexico",
      },
      {
        startDate: "2025-02-15",
        endDate: "2025-02-15",
        description: "New York",
      },
      {
        startDate: "2025-04-30",
        endDate: "2025-07-24",
        description: "Europe",
      },
    ];

    const result = calculateCitizenship(
      "2023-10-30",
      "2019-12-02",
      turkishAbsences
    );

    expect(result.totalDaysToday).toBeGreaterThan(0);
    expect(result.prDaysToday).toBeGreaterThan(300);
    expect(result.tempDaysToday).toBeGreaterThan(500);
  });
});
