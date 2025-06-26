import { differenceInDays, addDays, startOfYear, addYears } from "date-fns";
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

// Calculate days in Canada for a given period
export function calculateDaysInCanada(
  startDate: Date,
  endDate: Date,
  absences: Absence[]
): number {
  let totalDays = daysBetween(startDate, endDate);

  // Subtract absences
  for (const absence of absences) {
    const absenceStart = new Date(absence.startDate);
    const absenceEnd = new Date(absence.endDate);

    // Check if absence overlaps with the period
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
  let isCitizenshipDateFound = false;
  let citizenshipDate = new Date();

  let tempDaysToday = 0;
  let prDaysToday = 0;
  let totalDaysToday = 0;

  let tempDays = 0;
  let prDays = 0;
  let totalDays = 0;

  while (!isCitizenshipDateFound) {
    // If tmpStartDate or prStartDate is before five years ago, use five years ago
    const fiveYearsAgo = addYearsToDate(citizenshipDate, -5);
    const tmpStartDateLocal =
      new Date(tmpStartDate) > fiveYearsAgo
        ? new Date(tmpStartDate)
        : fiveYearsAgo;
    const prStartDateLocal =
      new Date(prStartDate) > fiveYearsAgo
        ? new Date(prStartDate)
        : fiveYearsAgo;

    // If tmpStartDate is before prStartDate, calculate days in Canada for the period between tmpStartDate and prStartDate
    tempDays =
      tmpStartDateLocal < prStartDateLocal
        ? calculateDaysInCanada(tmpStartDateLocal, prStartDateLocal, absences)
        : 0;

    // Calculate days in Canada for the period between prStartDate and citizenshipDate
    prDays = calculateDaysInCanada(prStartDateLocal, citizenshipDate, absences);

    // If the sum of days in Canada for the period between tmpStartDate and prStartDate and days in Canada for the period between prStartDate and citizenshipDate is greater than or equal to 1095, set citizenshipDate to the current date
    totalDays = Math.min(Math.floor(tempDays / 2), 365) + prDays;
    const isToday =
      citizenshipDate.toISOString().split("T")[0] ==
      new Date().toISOString().split("T")[0];
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

  return {
    totalDays: totalDays,
    tempDays: tempDays,
    prDays: prDays,
    totalDaysToday: totalDaysToday,
    tempDaysToday: tempDaysToday,
    prDaysToday: prDaysToday,
    remainingDays: daysBetween(new Date(), citizenshipDate),
    progress: Math.min(100, (totalDaysToday / 1095) * 100),
    citizenshipDate,
    eligible: citizenshipDate < new Date(),
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
