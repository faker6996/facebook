// components/icons/ChevronRight.tsx
import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const ChevronRightIcon = (props: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    {...props}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default ChevronRightIcon;
