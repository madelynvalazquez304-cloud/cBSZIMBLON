import React from 'react';
import { CabsLogo } from './CabsLogo';
import { LoanApplicationData } from '../types';
import { CheckCircle2, Download, Home, RotateCcw, ShieldCheck, Printer } from 'lucide-react';

interface DisbursementReceiptProps {
  data: LoanApplicationData;
  onHome: () => void;
  onStartNew: () => void;
}

export const DisbursementReceipt: React.FC<DisbursementReceiptProps> = ({
  data,
  onHome,
  onStartNew,
}) => {
  const loanAmount = parseFloat(data.loanAmount) || 0;
  const txRef = 'CABS-ZW-' + Math.floor(10000000 + Math.random() * 90000000);
  const now = new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  let months = 6;
  if (data.repayment.includes('1 Month')) months = 1;
  else if (data.repayment.includes('3 Months')) months = 3;
  else if (data.repayment.includes('6 Months')) months = 6;
  else if (data.repayment.includes('12 Months')) months = 12;
  else if (data.repayment.includes('18 Month')) months = 18;
  else if (data.repayment.includes('24 Month')) months = 24;
  else if (data.repayment.includes('36 Month')) months = 36;
  else if (data.repayment.includes('60 Month')) months = 60;

  const totalPayable = loanAmount * (1 + 0.03 * months);
  const monthlyInstallment = totalPayable / months;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#273C83] to-[#1a2a5c] py-10 px-4 flex flex-col items-center justify-center text-[#1a1a1a]"
      style={{ fontFamily: "'Albert Sans', sans-serif" }}
    >
      <div className="w-full max-w-[560px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-t-[5px] border-[#8DC63F] overflow-hidden animate-fadeInUp">
        {/* Top Header */}
        <div className="bg-[#f8fafc] p-6 border-b border-gray-100 flex items-center justify-between">
          <CabsLogo variant="loan" size="md" showTagline={false} />
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              Disbursed
            </span>
            <div className="text-[11px] text-gray-500 mt-1">{now}</div>
          </div>
        </div>

        {/* Success Banner */}
        <div className="p-8 text-center bg-gradient-to-b from-white to-[#fcfcfd]">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#273C83] mb-1"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            Loan Successfully Disbursed!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The funds have been credited directly to your CABS checking account.
          </p>

          <div className="bg-[#f0f9f6] border border-[#008670]/20 rounded-2xl p-5 mb-6 text-center">
            <span className="text-xs uppercase font-bold text-[#008670] tracking-wider block mb-1">
              Credited Amount
            </span>
            <div
              className="text-4xl font-extrabold text-[#273C83]"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              USD$ {loanAmount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Available balance updated instantly</div>
          </div>

          {/* Receipt Details Table */}
          <div className="divide-y divide-gray-100 text-sm text-left border-t border-b border-gray-100 mb-6">
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Transaction Ref:</span>
              <span className="font-mono font-bold text-[#273C83]">{txRef}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Beneficiary:</span>
              <span className="font-bold text-gray-800">{data.fullName || 'Valued Customer'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Mobile Number:</span>
              <span className="font-medium text-gray-800">{data.phone}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Loan Facility:</span>
              <span className="font-medium text-[#008670]">{data.loanType || 'Personal Loan'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Repayment Period:</span>
              <span className="font-medium text-gray-800">{data.repayment || '6 Months'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Monthly Installment:</span>
              <span className="font-bold text-[#273C83]">${monthlyInstallment.toFixed(2)} USD / mo</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-gray-500">Total Payable:</span>
              <span className="font-bold text-[#008670]">${totalPayable.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Security and compliance note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-6">
            <ShieldCheck className="w-4 h-4 text-[#008670]" />
            <span>Authorized by CABS • Member of Old Mutual Group</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-[#273C83] font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onHome}
              className="flex-1 py-3 px-4 bg-[#8DC63F] hover:bg-[#a3d45a] text-[#1a2a5c] font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
            <button
              onClick={onStartNew}
              className="py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Apply for another loan"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
