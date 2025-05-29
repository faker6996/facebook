import * as React from "react";

const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Messenger icon */}
    <path
      d="M12 2C6.48 2 2 6.48 2 11.51c0 3.66 2.4 6.78 5.78 8.14L9 22l1.5-3.7c.36.11.74.17 1.15.17  
         5.52 0 10-4.48 10-10S17.52 2 12 2zm5 7l-6 7-2-4-4 4 2.5-6L5 9l7-3 3 5z"
      fill="currentColor"
    />
  </svg>
);

export default MessengerIcon;
