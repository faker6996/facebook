// components/SocialIcons.tsx
import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const GoogleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" {...props}>
    <path fill="#4285F4" d="M24 9.5c3.54 0 6.04 1.53 7.43 2.81l5.49-5.49C33.03 3.33 28.94 1.5 24 1.5c-9.27 0-17.12 6.4-19.91 14.77l6.86 5.33C12.4 15.44 17.68 9.5 24 9.5z"/>
    <path fill="#34A853" d="M46.5 24c0-1.53-.14-3.01-.39-4.43H24v8.4h12.7c-.54 2.89-2.18 5.34-4.59 7.02l7.19 5.59C44.1 36.7 46.5 31.0 46.5 24z"/>
    <path fill="#FBBC05" d="M10.95 28.02a14.95 14.95 0 010-8.03l-6.86-5.33a24.94 24.94 0 000 18.69l6.86-5.33z"/>
    <path fill="#EA4335" d="M24 46.5c6.51 0 11.98-2.15 15.97-5.86l-7.19-5.59c-2.02 1.36-4.62 2.17-8.78 2.17-6.32 0-11.6-5.94-12.95-13.1l-6.86 5.33C6.88 40.1 14.73 46.5 24 46.5z"/>
  </svg>
);

export const FacebookIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24" {...props}>
    <path fill="#1877F2" d="M24 1C11.85 1 1.5 11.35 1.5 23.5S11.85 46 24 46s22.5-10.35 22.5-22.5S36.15 1 24 1z"/>
    <path fill="#FFF" d="M26.67 35.56v-9.67h3.23l.49-3.78h-3.72v-2.42c0-1.1.31-1.85 1.91-1.85h2.04V14.1c-.35-.05-1.54-.15-2.93-.15-2.9 0-4.89 1.77-4.89 5.02v2.8H19v3.78h3.8v9.67h3.87z"/>
  </svg>
);

export default { GoogleIcon, FacebookIcon };