import * as React from "react";
import Image from "next/image";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const sizeClass = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export const Avatar: React.FC<AvatarProps> = ({ src = "", name = "", size = "md", className = "" }: AvatarProps) => (
  <div className={`relative ${sizeClass[size]} ${className}`}>
    <Image
      src={src || "/avatar-placeholder.png"}
      alt={name || "avatar"}
      fill
      className="object-cover rounded-full bg-gray-200"
      sizes={`${sizeMap[size]}px`}
    />
  </div>
);
