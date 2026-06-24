/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Debtor, RepaymentDay, FinanceSummary } from "./types";

// Format currency as UZS with spaces: 6 000 000 so'm
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " so'm";
}

// Add days to date string
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// Generate the daily installment collection schedule
export function generateRepaymentSchedule(
  amountGiven: number,
  termDays: number,
  markupGiven: number,
  startDate: string
): RepaymentDay[] {
  const totalExpected = amountGiven + markupGiven;
  const dailyAmount = Math.round(totalExpected / termDays);
  const schedule: RepaymentDay[] = [];

  for (let i = 1; i <= termDays; i++) {
    // Due date is startDate + (i - 1) days
    const dueDate = addDays(startDate, i - 1);
    
    // For the last day, adjust for rounding errors to match totalExpected exactly
    let currentDayAmount = dailyAmount;
    if (i === termDays) {
      const sumPrior = dailyAmount * (termDays - 1);
      currentDayAmount = totalExpected - sumPrior;
    }

    schedule.push({
      id: `rep-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      dayIndex: i,
      dueDate,
      amount: currentDayAmount,
      paidAmount: 0,
      isPaid: false,
    });
  }

  return schedule;
}

// Financial calculations
export function calculateFinanceSummary(debtors: Debtor[]): FinanceSummary {
  let totalGiven = 0;
  let totalExpected = 0;
  let totalExpectedProfit = 0;
  let totalPaidAmount = 0;
  let totalCollectedProfit = 0;
  let totalLoss = 0;

  let activeCount = 0;
  let completedCount = 0;
  let overdueCount = 0;
  let lossCount = 0;

  debtors.forEach((debtor) => {
    // Basic sums
    totalGiven += debtor.amountGiven;
    totalExpected += debtor.totalExpected;
    totalExpectedProfit += debtor.markupGiven;

    // Calculate how much this debtor paid
    let debtorPaid = 0;
    
    // Sum from repayment schedule
    debtor.repaymentSchedule.forEach(day => {
      debtorPaid += day.paidAmount;
    });

    // Also sum from explicit payment logs if any (but the schedule is primary)
    // To ensure consistency, we rely on the repayment schedule's sum of paidAmount.
    totalPaidAmount += debtorPaid;

    // Profit Ratio = markupGiven / totalExpected (e.g. 1 200 000 / 7 200 000 = 16.666%)
    const profitRatio = debtor.totalExpected > 0 ? debtor.markupGiven / debtor.totalExpected : 0;
    
    // Collected profit from this debtor based on their repayments
    const collectedProfit = debtorPaid * profitRatio;
    totalCollectedProfit += collectedProfit;

    // Handle losses & statuses
    if (debtor.status === 'loss') {
      lossCount++;
      // Loss is whatever is left to pay
      const remainingUnpaid = Math.max(0, debtor.totalExpected - debtorPaid);
      totalLoss += remainingUnpaid;
    } else if (debtor.status === 'completed') {
      completedCount++;
    } else if (debtor.status === 'overdue') {
      overdueCount++;
    } else {
      activeCount++;
    }
  });

  return {
    totalGiven,
    totalExpected,
    totalExpectedProfit,
    totalPaidAmount,
    totalCollectedProfit: Math.round(totalCollectedProfit),
    totalLoss,
    activeCount,
    completedCount,
    overdueCount,
    lossCount,
  };
}

// Default empty array for debtors to allow fresh production testing by the user
export const defaultDebtors: Debtor[] = [];

