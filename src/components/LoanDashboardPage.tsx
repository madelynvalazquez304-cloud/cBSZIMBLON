import React, { useState, useEffect } from 'react';
import { CabsLogo } from './CabsLogo';
import { LoanApplicationData } from '../types';
import { ArrowUpRight, Lock, ArrowLeft, RefreshCw } from 'lucide-react';

interface LoanDashboardPageProps {
  data: LoanApplicationData;
  onProceedToConfirm: () => void;
  onBackToForm: () => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const LoanDashboardPage: React.FC<LoanDashboardPageProps> = ({
  data,
  onProceedToConfirm,
  onBackToForm,
  onToast,
}) => {
  const [showPreloader, setShowPreloader] = useState(true);
  const [progress, setProgress] = useState(0);

  // Parse figures
  const loanAmount = parseFloat(data.loanAmount) || 500;
  let months = 6;
  if (data.repayment.includes('1 Month')) months = 1;
  else if (data.repayment.includes('3 Months')) months = 3;
  else if (data.repayment.includes('6 Months')) months = 6;
  else if (data.repayment.includes('12 Months')) months = 12;
  else if (data.repayment.includes('18 Month')) months = 18;
  else if (data.repayment.includes('24 Month')) months = 24;
  else if (data.repayment.includes('36 Month')) months = 36;
  else if (data.repayment.includes('60 Month')) months = 60;

  const loanLimit = loanAmount + 10;
  const interestRate = 0.03; // 3% per month
  const totalPayable = loanAmount * (1 + interestRate * months);

  useEffect(() => {
    // Animate progress
    let start = Date.now();
    const duration = 2800; // 2.8s
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => setShowPreloader(false), 300);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const handleWithdrawal = () => {
    onToast('Processing withdrawal request...');
    setTimeout(() => {
      onProceedToConfirm();
    }, 1000);
  };

  const handleSkipLoader = () => {
    setShowPreloader(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#273C83] to-[#1a2a5c] py-6 px-4 flex flex-col justify-center items-center text-[#1a1a1a]"
      style={{ fontFamily: "'Albert Sans', sans-serif" }}
    >
      {/* ===== PRE-LOADER ===== */}
      {showPreloader && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#273C83] to-[#1a2a5c] flex flex-col items-center justify-center p-6 text-white transition-opacity duration-500">
          <div className="relative w-32 h-32 mb-8">
            {/* Outer spinning ring */}
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#273C83] border-r-[#8DC63F]"
              style={{ animation: 'rotate 1.5s linear infinite' }}
            />
            {/* Inner spinning ring */}
            <div
              className="absolute inset-3.5 rounded-full border-4 border-transparent border-b-[#273C83] border-left-[#8DC63F]"
              style={{ animation: 'rotate 1s linear infinite reverse' }}
            />
            {/* Center Brand Text */}
            <div
              className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#8DC63F] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              CABS
            </div>
          </div>

          {/* Dots animation */}
          <div className="flex gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8DC63F] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-[#8DC63F] animate-bounce" style={{ animationDelay: '200ms' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-[#8DC63F] animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>

          <div
            className="text-xl sm:text-2xl font-bold text-[#8DC63F] text-center mb-2"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            Your loan is being processed
          </div>
          <div className="text-sm text-white/70 text-center max-w-sm mb-6">
            Please wait while we verify your details and calculate your approved credit line...
          </div>

          {/* Progress bar */}
          <div className="w-72 max-w-[85%] h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#8DC63F] to-[#a3d45a] transition-all duration-100 shadow-[0_0_10px_rgba(141,198,63,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            onClick={handleSkipLoader}
            className="mt-4 text-xs text-white/60 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            Skip waiting →
          </button>
        </div>
      )}

      {/* Main Dashboard Container */}
      <div className="w-full max-w-[900px] my-auto">
        {/* Top actions pill */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBackToForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Application Details</span>
          </button>
        </div>

        {/* CABS Header Bar */}
        <div className="bg-white px-6 sm:px-8 py-4 rounded-t-2xl flex items-center justify-between gap-4 border-b-[3px] border-[#8DC63F] shadow-sm">
          <CabsLogo variant="bank" size="md" showTagline={false} />
          <div
            className="text-xs text-[#008670] font-bold uppercase tracking-wider hidden sm:block"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            We&apos;ll Help You Get There
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-b-2xl p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(39,60,131,0.2)] animate-fadeInUp">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-4 border-b border-gray-100">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[#273C83]"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Loan Overview
              </h2>
              <p className="text-xs text-gray-500 mt-1">Application ID: CABS-ZW-{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] animate-pulse">
                ● Active Loan Approved
              </span>
            </div>
          </div>

          {/* 6 Grid Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Borrower Name */}
            <div className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#008670]" />
              <span
                className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-1.5"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Borrower Name
              </span>
              <strong
                className="text-lg sm:text-xl font-bold text-[#1a1a1a] block truncate"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                {data.fullName || 'Valued Customer'}
              </strong>
            </div>

            {/* Loan Amount */}
            <div className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#008670]" />
              <span
                className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-1.5"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Loan Amount
              </span>
              <strong
                className="text-lg sm:text-xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                USD$ {loanAmount.toLocaleString()}
              </strong>
            </div>

            {/* Loan Period */}
            <div className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#008670]" />
              <span
                className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-1.5"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Loan Period
              </span>
              <strong
                className="text-lg sm:text-xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                {data.repayment || '6 Months'}
              </strong>
            </div>

            {/* Interest Rate */}
            <div className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#008670]" />
              <span
                className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-1.5"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Interest Rate
              </span>
              <strong
                className="text-lg sm:text-xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                3% per month
              </strong>
            </div>

            {/* Loan Limit */}
            <div className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#008670]" />
              <span
                className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-1.5"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Loan Limit
              </span>
              <strong
                className="text-lg sm:text-xl font-bold text-[#1a1a1a]"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                USD$ {loanLimit.toLocaleString()}
              </strong>
            </div>

            {/* Total Payable */}
            <div className="bg-[#f4f6f9] p-5 rounded-xl border border-[#e2e8f0] relative overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#008670]" />
              <span
                className="block text-xs font-bold uppercase tracking-wider text-[#273C83] mb-1.5"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Total Payable
              </span>
              <strong
                className="text-lg sm:text-xl font-bold text-[#008670]"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                USD$ {totalPayable.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Withdraw Section */}
          <div className="border-t-2 border-[#f4f6f9] pt-6 mt-2">
            <h3
              className="text-xl font-bold text-[#273C83] mb-2"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              Withdraw Your Loan
            </h3>
            <p className="text-sm text-[#6c757d] mb-5 leading-relaxed">
              Your approved loan amount is ready for withdrawal. Click below to credit your CABS account instantly.
            </p>

            <div className="bg-[#f4f6f9] rounded-2xl p-6 sm:p-8 text-center border border-[#e2e8f0] flex flex-col items-center">
              <button
                onClick={handleWithdrawal}
                className="w-full max-w-md py-4 px-8 rounded-full bg-gradient-to-r from-[#8DC63F] to-[#75a832] hover:from-[#a3d45a] hover:to-[#8DC63F] text-[#1a2a5c] font-extrabold text-base transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(141,198,63,0.35)] cursor-pointer flex items-center justify-center gap-2"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                <span>Withdraw to CABS Account</span>
                <ArrowUpRight className="w-5 h-5" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#6c757d]">
                <Lock className="w-3.5 h-3.5 text-[#008670]" />
                <span>Secure transaction via CABS Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="text-center py-5 bg-white/5 rounded-b-2xl mt-0.5">
          <CabsLogo variant="image-only" size="md" className="justify-center mx-auto opacity-80" />
          <p className="text-[11px] text-white/50 mt-1 font-medium">
            A Member of the Old Mutual Group
          </p>
        </div>
      </div>
    </div>
  );
};
