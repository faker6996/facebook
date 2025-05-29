import * as React from "react";

const ReelsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Reels icon (camera_roll) */}
    <path
      d="M18 5H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12
         c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-4 2
         c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 10
         H6V7h12v10zm-6-2c1.1 0 2 .9 2 2s-.9 2-2 2
         -2-.9-2-2 .9-2 2-2z"
      fill="currentColor"
    />
  </svg>
);

export default ReelsIcon;
