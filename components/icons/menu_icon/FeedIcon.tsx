import * as React from "react";

const FeedIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Feed icon (RSS) */}
    <path d="M4 4v6c4.42 0 8 3.58 8 8h6c0-7.72-6.28-14-14-14zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
  </svg>
);

export default FeedIcon;
