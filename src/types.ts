/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RepaymentDay {
  id: string;
  dayIndex: number; // 1 to N
  dueDate: string; // YYYY-MM-DD
  amount: number; // expected installment amount for this day
  paidAmount: number; // actual amount paid
  paidDate?: string; // YYYY-MM-DD when paid
  isPaid: boolean;
}

export interface PaymentLog {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface VideoAttachment {
  id: string;
  title: string;
  url: string; // Base64 or Object URL
  fileName: string;
  fileSize?: string;
  date: string;
}

export interface Debtor {
  id: string;
  firstName: string; // Ism
  lastName: string; // Familiya
  phone: string; // Telefon raqami
  amountGiven: number; // Berilgan pul summasi (e.g. 6 000 000)
  termDays: number; // Necha kunga berilganligi (Muddati)
  startDate: string; // Boshlangan sana (YYYY-MM-DD)
  interestPercent: number; // Ustama foiz %
  markupGiven: number; // Ustama foyda summasi (e.g. 1 200 000)
  totalExpected: number; // Qaytarilishi kerak bo'lgan jami summa = amountGiven + markupGiven
  dailyInstallment: number; // Kunlik qaytarish summasi = totalExpected / termDays
  status: 'active' | 'completed' | 'overdue' | 'loss'; 
  notes: string; // Izohlar
  repaymentSchedule: RepaymentDay[]; // Kunlik bo'lib to'lash jadvali
  paymentLogs: PaymentLog[]; // To'lovlar tarixi loglari
  videos?: VideoAttachment[]; // Tasdiqlovchi videolar ro'yxati
  createdAt: string;
}

export interface Settings {
  projectName: string;
  bgType: 'image' | 'gradient' | 'solid' | 'system';
  customBgUrl: string; // Custom image URL provided by user
  bgPreset: string; // Predefined wallpaper value
  themeColor: string; // primary accent, e.g., 'emerald', 'blue', 'indigo', 'rose'
  telegramPhone?: string; // Telegram raqami/telefon raqami
  telegramUsername?: string; // Telegram foydalanuvchi nomi (@username)
}

export interface FinanceSummary {
  totalGiven: number; // Jami berilgan pul summasi
  totalExpected: number; // Jami qaytishi kutilayotgan summa
  totalExpectedProfit: number; // Kutilayotgan sof foyda
  totalPaidAmount: number; // Jami to'langan summa
  totalCollectedProfit: number; // Jami olingan foyda
  totalLoss: number; // Jami ziyon summasi
  activeCount: number;
  completedCount: number;
  overdueCount: number;
  lossCount: number;
}
