import clsx from "clsx";
import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  return (
    <input
      className={clsx(
        "bg-surface border border-border rounded-[8px] px-3 py-2 text-textPrimary focus:border-accent focus:outline-none transition-colors duration-150",
        props.className
      )}
      {...props}
    />
  );
}
