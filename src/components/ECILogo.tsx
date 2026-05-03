import React from 'react';
import { cn } from '@/lib/utils';

interface ECILogoProps {
  className?: string;
  size?: number;
}

export default function ECILogo({ className = "", size = 48 }: ECILogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Election AI Logo"
    >
      <rect width="100" height="100" rx="12" fill="#F8F9FA" />
      {/* Saffron Check */}
      <path d="M 25 45 L 45 65 L 80 25" stroke="#FF9933" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, -12)" />
      {/* Green Check */}
      <path d="M 25 45 L 45 65 L 80 25" stroke="#138808" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" transform="translate(0, 12)" />
      {/* Ashoka Chakra representation */}
      <circle cx="45" cy="53" r="8" fill="#000080" />
      <circle cx="45" cy="53" r="3" fill="#FFFFFF" />
    </svg>
  );
}
