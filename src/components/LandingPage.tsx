import React, { useState } from 'react';
import { CabsLogo } from './CabsLogo';
import { Check, Shield, Clock, TrendingUp, Users, ChevronRight, Menu, X, Calculator } from 'lucide-react';

interface LandingPageProps {
  onApply: (prefillAmount?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onApply }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calcAmount, setCalcAmount] = useState(1500);
  const [calcMonths, setCalcMonths] = useState(6);

  const interestRate = 0.03; // 3% per month
  const totalRepayable = calcAmount * (1 + interestRate * calcMonths);
  const monthlyInstallment = totalRepayable / calcMonths;

  const handleApplyWithCalc = () => {
    onApply(calcAmount.toString());
  };

  return (
    <div className="min-h-screen bg-white text-[#1e293b] flex flex-col font-sans">
      {/* ===== TOP BAR ===== */}
      <div className="bg-[#273C83] px-4 md:px-10 py-2 flex justify-between md:justify-end items-center gap-6 text-[13px] text-white/70">
        <span className="md:hidden text-[#8DC63F] text-xs font-semibold">CABS Online Portal</span>
        <div className="flex gap-4 md:gap-6">
          <a href="#personal" className="hover:text-[#8DC63F] transition-colors font-medium">Personal Banking</a>
          <a href="#sme" className="hover:text-[#8DC63F] transition-colors font-medium">SME Banking</a>
          <a href="#contact" className="hover:text-[#8DC63F] transition-colors font-medium">Contact Us</a>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="px-4 md:px-10 py-4 flex justify-between items-center bg-white shadow-[0_2px_12px_rgba(39,60,131,0.1)] sticky top-[41px] z-40">
        <CabsLogo variant="loan" size="md" showTagline={true} />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-[#273C83]" style={{ fontFamily: "'Urbanist', sans-serif" }}>
          <a href="#home" className="hover:text-[#008670] transition-colors">Home</a>
          <a href="#loans" className="hover:text-[#008670] transition-colors">Loans</a>
          <a href="#about" className="hover:text-[#008670] transition-colors">About</a>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <button
            onClick={() => onApply()}
            className="px-7 py-2.5 bg-[#008670] hover:bg-[#00a88a] text-white font-bold rounded text-[15px] cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            Apply Now
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 text-[#273C83] rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <CabsLogo variant="loan" size="sm" showTagline={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-4 text-lg font-semibold text-[#273C83]">
                <a
                  href="#home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-gray-100"
                >
                  Home
                </a>
                <a
                  href="#loans"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-gray-100"
                >
                  Loans
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-gray-100"
                >
                  About
                </a>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onApply();
                }}
                className="w-full py-3.5 bg-[#8DC63F] hover:bg-[#a3d45a] text-[#1a2a5c] font-bold rounded-lg text-base cursor-pointer shadow-md transition-transform"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Apply for a Loan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="relative px-6 md:px-12 py-16 md:py-20 bg-gradient-to-br from-[#273C83] to-[#1a2a5c] text-white overflow-hidden">
        {/* Ambient radial backdrop glow */}
        <div
          className="absolute -top-32 -right-24 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(141,198,63,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-20 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,134,112,0.2) 0%, transparent 70%)' }}
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Text */}
          <div className="lg:col-span-7">
            <div
              className="text-[#8DC63F] font-bold uppercase tracking-[2px] text-sm mb-3.5"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              We&apos;ll Help You Get There
            </div>
            <h2
              className="text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.12] mb-5 tracking-tight"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              Fast &amp; Secure <span className="text-[#8DC63F]">CABS Loans</span>
            </h2>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl font-normal">
              Get instant access to personal and business loans directly through CABS, a member of the Old Mutual Group. Enjoy flexible repayment terms and quick approvals — 100% digital.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onApply()}
                className="px-10 py-3.5 bg-[#8DC63F] hover:bg-[#a3d45a] text-[#1a2a5c] font-extrabold rounded text-base cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(141,198,63,0.35)] flex items-center gap-2"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                <span>Apply for a Loan</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              <a
                href="#features"
                className="px-6 py-3 border border-white/20 hover:border-white/40 text-white/90 hover:text-white rounded text-sm font-semibold transition-colors"
              >
                Learn More
              </a>
            </div>

            {/* Quick stats mini row */}
            <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#8DC63F]">Instant</div>
                <div className="text-xs text-white/70 mt-0.5">Approval Process</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">3% <span className="text-xs font-normal">/mo</span></div>
                <div className="text-xs text-white/70 mt-0.5">Competitive Rates</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">$50k</div>
                <div className="text-xs text-white/70 mt-0.5">Maximum Limit</div>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Loan Overview + Interactive Calculator */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.22)] border-t-4 border-[#8DC63F] text-[#1e293b]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#8DC63F]/30">
                <h3
                  className="text-xl sm:text-2xl font-extrabold text-[#273C83]"
                  style={{ fontFamily: "'Urbanist', sans-serif" }}
                >
                  Loan Overview
                </h3>
                <span className="text-xs uppercase font-bold px-2 py-0.5 bg-[#8DC63F]/20 text-[#273C83] rounded">
                  2026 Terms
                </span>
              </div>

              <div className="divide-y divide-gray-100 text-sm">
                <div className="py-3 flex justify-between items-center">
                  <strong className="text-[#273C83] font-bold" style={{ fontFamily: "'Urbanist', sans-serif" }}>Loan Limit</strong>
                  <span className="text-[#008670] font-bold">Up to USD 50,000</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <strong className="text-[#273C83] font-bold" style={{ fontFamily: "'Urbanist', sans-serif" }}>Interest Rate</strong>
                  <span className="text-[#008670] font-bold">From 3% per month</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <strong className="text-[#273C83] font-bold" style={{ fontFamily: "'Urbanist', sans-serif" }}>Tenure</strong>
                  <span className="text-[#008670] font-bold">1 – 36 months</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <strong className="text-[#273C83] font-bold" style={{ fontFamily: "'Urbanist', sans-serif" }}>Approval</strong>
                  <span className="text-[#008670] font-bold">Instant - 24 hours</span>
                </div>
              </div>

              {/* Interactive Loan Simulator */}
              <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#273C83] uppercase flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-[#008670]" /> Quick Estimate
                  </span>
                  <span className="text-sm font-bold text-[#273C83]">${calcAmount.toLocaleString()} USD</span>
                </div>

                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full accent-[#008670] cursor-pointer"
                />

                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-gray-500">Period:</span>
                  <div className="flex gap-1.5">
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCalcMonths(m)}
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          calcMonths === m
                            ? 'bg-[#008670] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase">Monthly Installment</div>
                    <div className="text-base font-extrabold text-[#273C83]">
                      ${monthlyInstallment.toFixed(2)} <span className="text-[10px] text-gray-500 font-normal">/mo</span>
                    </div>
                  </div>
                  <button
                    onClick={handleApplyWithCalc}
                    className="px-3.5 py-1.5 bg-[#273C83] hover:bg-[#1a2a5c] text-white text-xs font-bold rounded shadow-sm transition-colors cursor-pointer"
                  >
                    Select &amp; Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-16 md:py-20 px-6 md:px-12 bg-[#f5f7fa]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="text-[#008670] font-bold text-xs uppercase tracking-wider block mb-2"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              Why Choose CABS
            </span>
            <h3
              className="text-3xl sm:text-4xl font-extrabold text-[#273C83]"
              style={{ fontFamily: "'Urbanist', sans-serif" }}
            >
              Designed for Convenience and Trust
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-xl border-l-4 border-[#008670] hover:border-[#8DC63F] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-[#8DC63F]/20 text-[#273C83] flex items-center justify-center font-bold mb-4">
                <Clock className="w-5 h-5 text-[#008670]" />
              </div>
              <h4
                className="text-lg font-extrabold text-[#273C83] mb-2.5 flex items-center gap-2"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Instant Approval
              </h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                No paperwork required. Apply directly from your phone or online through CABS digital platforms.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border-l-4 border-[#008670] hover:border-[#8DC63F] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-[#8DC63F]/20 text-[#273C83] flex items-center justify-center font-bold mb-4">
                <Shield className="w-5 h-5 text-[#008670]" />
              </div>
              <h4
                className="text-lg font-extrabold text-[#273C83] mb-2.5 flex items-center gap-2"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Secure CABS Platform
              </h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Your information is protected using bank-grade security standards trusted by the Old Mutual Group.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border-l-4 border-[#008670] hover:border-[#8DC63F] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-[#8DC63F]/20 text-[#273C83] flex items-center justify-center font-bold mb-4">
                <TrendingUp className="w-5 h-5 text-[#008670]" />
              </div>
              <h4
                className="text-lg font-extrabold text-[#273C83] mb-2.5 flex items-center gap-2"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Flexible Repayment
              </h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Choose repayment plans that match your income flow and budget with CABS.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border-l-4 border-[#008670] hover:border-[#8DC63F] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-[#8DC63F]/20 text-[#273C83] flex items-center justify-center font-bold mb-4">
                <Users className="w-5 h-5 text-[#008670]" />
              </div>
              <h4
                className="text-lg font-extrabold text-[#273C83] mb-2.5 flex items-center gap-2"
                style={{ fontFamily: "'Urbanist', sans-serif" }}
              >
                Trusted Nationwide
              </h4>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Serving thousands of customers across Zimbabwe with pride as part of the Old Mutual family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== APPLY CENTER ===== */}
      <section className="relative text-center py-16 px-6 bg-gradient-to-br from-[#273C83] to-[#1a2a5c] text-white overflow-hidden">
        <div
          className="absolute -bottom-24 -left-12 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(141,198,63,0.12) 0%, transparent 70%)' }}
        />
        <div className="max-w-2xl mx-auto relative z-10">
          <h3
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            Ready to Get Started?
          </h3>
          <p className="text-white/75 text-base mb-8">
            Apply now and we&apos;ll help you get there — fast, secure, and hassle-free.
          </p>
          <button
            onClick={() => onApply()}
            className="px-12 py-4 bg-[#8DC63F] hover:bg-[#a3d45a] text-[#1a2a5c] font-extrabold rounded text-base cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(141,198,63,0.35)]"
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            Apply Now
          </button>
        </div>
      </section>

      {/* ===== TRUST BADGE ===== */}
      <div className="py-8 bg-white border-t border-gray-200 text-center flex flex-col items-center justify-center">
        <CabsLogo variant="image-only" size="lg" />
        <p className="text-xs text-[#6b7280] mt-2 font-medium tracking-wide">
          A Member of the Old Mutual Group
        </p>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#1a2a5c] text-white/50 py-7 px-6 text-center text-xs border-t border-[#8DC63F]/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 CABS. A Member of the <span className="text-[#8DC63F]">Old Mutual Group</span>. All Rights Reserved.</p>
          <div className="flex gap-5 text-xs text-white/60">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-white transition-colors">Security Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
