import * as React from "react";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};
export const Avatar: React.FC<AvatarProps> = ({ src = "", name = "", size = "md", className = "" }: AvatarProps) => (
  <img
    src={src || undefined}
    alt={name || "avatar"}
    className={`object-cover rounded-full bg-gray-200 ${sizeMap[size]} ${className}`}
  />
);
