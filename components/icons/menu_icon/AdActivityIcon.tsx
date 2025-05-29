import * as React from "react";

const AdActivityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for AdActivity icon (bar chart) */}
    <path d="M4 10h4v8H4v-8zm6-2h4v10h-4V8zm6-4h4v14h-4V4z" fill="currentColor" />
  </svg>
);

export default AdActivityIcon;
