import * as React from "react";

const MarketplaceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Marketplace icon (store) */}
    <path
      d="M18 6V4c0-1.1-.9-2-2-2H8
         C6.9 2 6 2.9 6 4v2H3v2h1v10
         c0 1.1.9 2 2 2h12
         c1.1 0 2-.9 2-2V8h1V6h-3zm-2 0
         H8V4h8v2zm2 14H6V8h12v12z"
      fill="currentColor"
    />
  </svg>
);

export default MarketplaceIcon;
