import * as React from "react";

const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* SVG path for Video icon (videocam) */}
    <path
      d="M17 10.5V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12
         c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.5l4 4v-11
         l-4 4z"
      fill="currentColor"
    />
  </svg>
);

export default VideoIcon;
