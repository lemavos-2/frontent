import clsx from "clsx";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-surface border border-border rounded-[10px] p-4 hover:bg-hover transition-colors duration-150",
        className
      )}
    >
      {children}
    </div>
  );
}
