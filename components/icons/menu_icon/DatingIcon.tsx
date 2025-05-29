import * as React from "react";

const DatingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="
        M12 21.35
        l-1.45-1.32
        C5.4 15.36 2 12.28 2 8.5
        C2 5.42 4.42 3 7.5 3
        c1.74 0 3.41 0.81 4.5 2.09
        C13.09 3.81 14.76 3 16.5 3
        C19.58 3 22 5.42 22 8.5
        c0 3.78-3.4 6.86-8.55 11.54
        L12 21.35
        z
      "
      fill="currentColor"
    />
    <rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" />
  </svg>
);

export default DatingIcon;
