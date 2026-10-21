export type PageStep = 'landing' | 'form' | 'dash' | 'confirm' | 'otp' | 'receipt';

export interface LoanApplicationData {
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  employment: string;
  income: string;
  loanType: string;
  loanAmount: string;
  repayment: string;
  terms: boolean;
  pin?: string;
  otp?: string;
  accountNumber?: string;
  submissionId?: string;
}

export interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  dob?: string;
  dobYear?: string;
  dobMonth?: string;
  dobDay?: string;
  employment?: string;
  income?: string;
  loanType?: string;
  loanAmount?: string;
  repayment?: string;
  terms?: string;
}
