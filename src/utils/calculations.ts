import { differenceInDays, addDays, startOfYear } from "date-fns";
import type { Absence } from "../store/immigrationSlice";

function parseDate(value: string): Date {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new RangeError(`Invalid date string: "${value}"`);
  }
  return d;
}

export interface CitizenshipResult {
  totalDays: number;
  tempDays: number;
  prDays: number;
  totalDaysToday: number;
  tempDaysToday: number;
  prDaysToday: number;
  remainingDays: number;
  progress: number;
  citizenshipDate: Date;
  eligible: boolean;
}

export interface PRStatusResult {
  status: "safe" | "warning" | "danger";
  lossDate: Date | null;
}

export interface ResidencyResult {
  status: "safe" | "warning" | "danger";
  lossDate: number | null;
}

// Calculate days between two dates
export function daysBetween(startDate: Date, endDate: Date): number {
  return Math.abs(differenceInDays(startDate, endDate)) + 1;
}

// Merge overlapping or contiguous absences into non-overlapping intervals.
// Per IRCC, contiguous trips (no return to Canada) should be treated as one
// continuous absence so the boundary day rule applies once per trip.
export function mergeAbsences(absences: Absence[]): Absence[] {
  if (absences.length <= 1) return [...absences];

  const sorted = [...absences].sort(
    (a, b) =>
      parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime()
  );

  const merged: Absence[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    const lastEnd = parseDate(last.endDate);
    const currentStart = parseDate(current.startDate);

    if (currentStart <= addDays(lastEnd, 1)) {
      const currentEnd = parseDate(current.endDate);
      merged[merged.length - 1] = {
        ...last,
        endDate: currentEnd > lastEnd ? current.endDate : last.endDate,
        description: last.description + " + " + current.description,
      };
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

// Calculate days in Canada for a given period.
// Per IRCC rules:
//   - The return day of an absence counts as present (boundary day rule)
//   - Same-day trips (leave and return same day) are not absences
//   - Overlapping/contiguous absences are merged first
export function calculateDaysInCanada(
  startDate: Date,
  endDate: Date,
  absences: Absence[]
): number {
  let totalDays = daysBetween(startDate, endDate);

  const merged = mergeAbsences(absences);

  for (const absence of merged) {
    const absenceStart = parseDate(absence.startDate);
    const absenceEnd = addDays(parseDate(absence.endDate), -1);

    if (absenceEnd < absenceStart) continue;

    if (absenceStart <= endDate && absenceEnd >= startDate) {
      const overlapStart = new Date(
        Math.max(startDate.getTime(), absenceStart.getTime())
      );
      const overlapEnd = new Date(
        Math.min(endDate.getTime(), absenceEnd.getTime())
      );
      const overlapDays = daysBetween(overlapStart, overlapEnd);
      totalDays -= overlapDays;
    }
  }

  return Math.max(0, totalDays);
}

export function addYearsToDate(date: Date, years: number): Date {
  return new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
}

interface DayBreakdown {
  tempDays: number;
  prDays: number;
  totalDays: number;
}

// Compute temp/PR/total days for a specific candidate citizenship date.
// Extracted from the calculateCitizenship loop body for reuse in binary search.
function computeDaysForDate(
  candidateDate: Date,
  prStart: Date,
  tmpStart: Date,
  absences: Absence[]
): DayBreakdown {
  const fiveYearsAgo = addYearsToDate(candidateDate, -5);
  const tmpStartLocal = tmpStart > fiveYearsAgo ? tmpStart : fiveYearsAgo;
  const prStartLocal = prStart > fiveYearsAgo ? prStart : fiveYearsAgo;

  // BUG 3 fix: temp period ends the day BEFORE PR start
  const tempDays =
    tmpStartLocal < prStartLocal
      ? calculateDaysInCanada(
          tmpStartLocal,
          addDays(prStartLocal, -1),
          absences
        )
      : 0;

  // BUG 4 fix: application date itself does not count toward physical presence
  const prDays = calculateDaysInCanada(
    prStartLocal,
    addDays(candidateDate, -1),
    absences
  );

  const totalDays = Math.min(Math.floor(tempDays / 2), 365) + prDays;

  return { tempDays, prDays, totalDays };
}

// Calculate citizenship eligibility using binary search.
// totalDays is monotonically non-decreasing for future dates (no future
// absences), so binary search correctly finds the earliest eligible date.
export function calculateCitizenship(
  prStartDate: string,
  tmpStartDate: string,
  absences: Absence[]
): CitizenshipResult {
  const today = new Date();
  const prStart = parseDate(prStartDate);
  const tmpStart = parseDate(tmpStartDate);

  const todayResult = computeDaysForDate(today, prStart, tmpStart, absences);

  if (todayResult.totalDays >= 1095) {
    return {
      ...todayResult,
      totalDaysToday: todayResult.totalDays,
      tempDaysToday: todayResult.tempDays,
      prDaysToday: todayResult.prDays,
      remainingDays: 0,
      progress: Math.min(100, (todayResult.totalDays / 1095) * 100),
      citizenshipDate: today,
      eligible: true,
    };
  }

  // Binary search for the earliest date where totalDays >= 1095.
  // lo/hi are day offsets from today.
  let lo = 1;
  let hi = 3650;

  while (
    computeDaysForDate(addDays(today, hi), prStart, tmpStart, absences)
      .totalDays < 1095
  ) {
    hi *= 2;
  }

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const midResult = computeDaysForDate(
      addDays(today, mid),
      prStart,
      tmpStart,
      absences
    );
    if (midResult.totalDays >= 1095) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  const citizenshipDate = addDays(today, lo);
  const result = computeDaysForDate(
    citizenshipDate,
    prStart,
    tmpStart,
    absences
  );
  const daysUntilEligible = differenceInDays(citizenshipDate, today);

  return {
    ...result,
    totalDaysToday: todayResult.totalDays,
    tempDaysToday: todayResult.tempDays,
    prDaysToday: todayResult.prDays,
    remainingDays: Math.max(0, daysUntilEligible),
    progress: Math.min(100, (todayResult.totalDays / 1095) * 100),
    citizenshipDate,
    eligible: daysUntilEligible <= 0,
  };
}

// Return Date when you would lose your PR status
export function calculatePRStatus(
  prStartDate: string,
  citizenshipDate: Date,
  absences: Absence[]
): PRStatusResult {
  const prStart = parseDate(prStartDate);
  const fiveYearsAfterPR = addYearsToDate(prStart, 5);

  if (citizenshipDate < fiveYearsAfterPR) {
    return {
      status: "safe",
      lossDate: null,
    };
  }

  // Check each rolling 5-year window for < 730 days of presence.
  // Not monotonic, so linear scan is required.
  const dayCount = daysBetween(new Date(fiveYearsAfterPR), citizenshipDate);
  for (let i = 0; i < dayCount; i++) {
    const date = addDays(prStart, i);
    const dateInFiveYears = addYearsToDate(date, 5);
    const daysInCanada = calculateDaysInCanada(date, dateInFiveYears, absences);
    if (daysInCanada < 730) {
      return {
        status: "danger",
        lossDate: dateInFiveYears,
      };
    }
  }

  return {
    status: "safe",
    lossDate: null,
  };
}

// Calculate residency status
export function calculateResidencyStatus(
  citizenshipDate: Date,
  absences: Absence[]
): ResidencyResult {
  const requiredDays = 183; // 6 months = ~183 days

  let yearStart = startOfYear(new Date());
  let yearStartNext = addYearsToDate(yearStart, 1);

  while (yearStart < citizenshipDate) {
    const daysInCanada = calculateDaysInCanada(
      yearStart,
      yearStartNext,
      absences
    );

    if (daysInCanada < requiredDays) {
      return {
        status: "danger",
        lossDate: yearStart.getFullYear(),
      };
    }

    yearStart = addYearsToDate(yearStart, 1);
    yearStartNext = addYearsToDate(yearStartNext, 1);
  }

  return {
    status: "safe",
    lossDate: null,
  };
}
