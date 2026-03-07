import * as LucideIcons from "lucide-react";
import React from "react";

export type IconName = keyof typeof LucideIcons;

export function Icon({ name, size = 20, strokeWidth = 1.5, ...props }: { name: IconName; size?: number; strokeWidth?: number; [x: string]: any }) {
  const LucideIcon = LucideIcons[name];
  if (typeof LucideIcon === "function") {
    return <LucideIcon size={size} strokeWidth={strokeWidth} {...props} />;
  }
  return null;
}
