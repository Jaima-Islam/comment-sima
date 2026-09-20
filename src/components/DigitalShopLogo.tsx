import React from 'react';

interface DigitalShopLogoProps {
  className?: string;
  size?: number | string;
}

export const DigitalShopLogo: React.FC<DigitalShopLogoProps> = ({
  className = 'w-10 h-10',
}) => {
  return (
    <div
      className={`${className} rounded-full overflow-hidden shrink-0 select-none bg-[#741697] text-white flex items-center justify-center font-bold shadow-xs`}
    >
      <span className="leading-none text-center font-sans font-extrabold">S</span>
    </div>
  );
};
