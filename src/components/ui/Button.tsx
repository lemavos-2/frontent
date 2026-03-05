import clsx from "clsx";

export type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
  [x: string]: any;
};

export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  const base =
    "min-h-[44px] px-4 rounded-[8px] font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";
  const variants = {
    primary: "bg-accent text-background hover:bg-accentHover",
    secondary: "bg-surface text-textPrimary hover:bg-hover",
    ghost: "bg-transparent text-textPrimary hover:bg-hover",
  };
  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
