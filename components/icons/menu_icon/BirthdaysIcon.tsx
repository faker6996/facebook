import * as React from "react";

const BirthdaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Birthdays icon */}
    <path
      d="M12 8c1.1 0 2-.9 2-2 0-.55-.22-1.05-.59-1.41L12 4l-1.41.59C10.22 4.95 10 5.45 10 6c0 1.1.9 2 2 2zm4 1v2H8v-2c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2zm-9 1H4v7c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-7h-3v1H7v-1z"
      fill="currentColor"
    />
  </svg>
);

export default BirthdaysIcon;
