import type { ExpenseStatusType, ReportType } from "@/config/constants.js";

export interface ReportResponse {
  reportId: string;
  reportType: ReportType;
  period: {
    fromDate: string;
    toDate: string;
  };
  filters: {
    department?: string;
    status?: ExpenseStatusType;
  };
  summary: {
    totalExpenses: number;
    totalAmount: number;
    currency: string;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byDepartment?: Record<string, number>;
  };
  expenses?: Array<{
    expenseId: string;
    submitter: string;
    category: string;
    amount: number;
    status: ExpenseStatusType;
    expenseDate: string;
  }>;
  generatedAt: string;
  generatedBy: {
    userId: string;
    fullName: string;
  };
}
