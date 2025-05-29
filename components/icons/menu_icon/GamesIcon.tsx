import * as React from "react";

const GamesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Games icon */}
    <path
      d="M18 9h-1.5l-1.5-2h-6l-1.5 2H6c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1.5l1.5 2h6l1.5-2H18c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm-6 5h-2v-2H8v-2h2V9h2v2h2v2h-2z"
      fill="currentColor"
    />
  </svg>
);

export default GamesIcon;
