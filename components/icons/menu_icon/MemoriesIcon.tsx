import * as React from "react";

const MemoriesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Memories icon (history clock) */}
    <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm-1 5h2v5h-4v-2h2z" fill="currentColor" />
  </svg>
);

export default MemoriesIcon;
