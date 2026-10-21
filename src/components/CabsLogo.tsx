import React from 'react';

export const CABS_LOGO_URL = '/assets/aistudio/d15b33ebf2643f03c732ae0338fa2daa69cb7330__1__4b0aba02.png';

interface CabsLogoProps {
  variant?: 'loan' | 'bank' | 'image-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const CabsLogo: React.FC<CabsLogoProps> = ({
  variant = 'loan',
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const imgHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-12 sm:h-14',
    xl: 'h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  if (variant === 'image-only') {
    return (
      <img
        src={CABS_LOGO_URL}
        alt="CABS Logo"
        className={`${imgHeights[size]} w-auto object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={CABS_LOGO_URL}
        alt="CABS Logo"
        className={`${imgHeights[size]} w-auto object-contain shrink-0`}
      />
      <div className="flex flex-col justify-center">
        <div
          className={`font-extrabold tracking-tight leading-tight text-[#273C83] ${textSizes[size]}`}
          style={{ fontFamily: "'Urbanist', sans-serif" }}
        >
          CABS{' '}
          <span className="font-normal text-[#008670]">
            {variant === 'bank' ? 'Bank' : 'Loan'}
          </span>
        </div>
        {showTagline && (
          <div
            className={`font-semibold uppercase tracking-wider text-[#008670] mt-0.5 ${taglineSizes[size]}`}
            style={{ fontFamily: "'Urbanist', sans-serif" }}
          >
            We&apos;ll Help You Get There
          </div>
        )}
      </div>
    </div>
  );
};
