import { differenceInDays, addDays, startOfYear } from "date-fns";
import type {
  Absence,
  CitizenshipCalculation,
  PRStatusCalculation,
  ResidencyCalculation,
} from "../store/atoms";

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
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const merged: Absence[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    const lastEnd = new Date(last.endDate);
    const currentStart = new Date(current.startDate);

    if (currentStart <= addDays(lastEnd, 1)) {
      const currentEnd = new Date(current.endDate);
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
    const absenceStart = new Date(absence.startDate);
    const absenceEnd = addDays(new Date(absence.endDate), -1);

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

// Calculate citizenship eligibility
export function calculateCitizenship(
  prStartDate: string,
  tmpStartDate: string,
  absences: Absence[]
): CitizenshipCalculation {
  const today = new Date();
  let isCitizenshipDateFound = false;
  let citizenshipDate = new Date(today);

  let tempDaysToday = 0;
  let prDaysToday = 0;
  let totalDaysToday = 0;

  let tempDays = 0;
  let prDays = 0;
  let totalDays = 0;

  while (!isCitizenshipDateFound) {
    const fiveYearsAgo = addYearsToDate(citizenshipDate, -5);
    const tmpStartDateLocal =
      new Date(tmpStartDate) > fiveYearsAgo
        ? new Date(tmpStartDate)
        : fiveYearsAgo;
    const prStartDateLocal =
      new Date(prStartDate) > fiveYearsAgo
        ? new Date(prStartDate)
        : fiveYearsAgo;

    // BUG 3 fix: temp period ends the day BEFORE PR start (PR start date
    // belongs to the PR period, not the temp period)
    tempDays =
      tmpStartDateLocal < prStartDateLocal
        ? calculateDaysInCanada(
            tmpStartDateLocal,
            addDays(prStartDateLocal, -1),
            absences
          )
        : 0;

    // BUG 4 fix: per IRCC, the application date itself does not count toward
    // physical presence, so the PR period ends the day before citizenshipDate
    prDays = calculateDaysInCanada(
      prStartDateLocal,
      addDays(citizenshipDate, -1),
      absences
    );

    totalDays = Math.min(Math.floor(tempDays / 2), 365) + prDays;
    const isToday =
      citizenshipDate.toISOString().split("T")[0] ===
      today.toISOString().split("T")[0];
    if (isToday) {
      tempDaysToday = tempDays;
      prDaysToday = prDays;
      totalDaysToday = totalDays;
    }

    if (totalDays >= 1095) {
      isCitizenshipDateFound = true;
    } else {
      citizenshipDate = addDays(citizenshipDate, 1);
    }
  }

  // BUG 5 fix: use differenceInDays so remainingDays is 0 when eligible today,
  // and use date-string comparison for eligible so it's not timing-dependent
  const daysUntilEligible = differenceInDays(citizenshipDate, today);

  return {
    totalDays,
    tempDays,
    prDays,
    totalDaysToday,
    tempDaysToday,
    prDaysToday,
    remainingDays: Math.max(0, daysUntilEligible),
    progress: Math.min(100, (totalDaysToday / 1095) * 100),
    citizenshipDate,
    eligible: daysUntilEligible <= 0,
  };
}

// Return Date when you would lose your PR status
export function calculatePRStatus(
  prStartDate: string,
  citizenshipDate: Date,
  absences: Absence[]
): PRStatusCalculation {
  // Date when I can start losing my PR status
  const fiveYearsAfterPR = addYearsToDate(new Date(prStartDate), 5);

  // If I have not yet reached the 5 years since PR, I am safe
  if (citizenshipDate < fiveYearsAfterPR) {
    return {
      status: "safe",
      lossDate: null,
    };
  }

  // Calculate days in Canada between the 5 years after PR and the citizenship date
  const daysBetweenDeadlineAndCitizenship = daysBetween(
    new Date(fiveYearsAfterPR),
    citizenshipDate
  );
  for (let i = 0; i < daysBetweenDeadlineAndCitizenship; i++) {
    const date = addDays(new Date(prStartDate), i);
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
): ResidencyCalculation {
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
