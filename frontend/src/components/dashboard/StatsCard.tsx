export type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-4 flex flex-col gap-2 hover:bg-hover transition-colors">
      <span className="font-semibold text-textPrimary text-[18px]">{title}</span>
      <span className="text-[28px] font-bold text-accent">{value}</span>
      {description && <span className="text-[13px] text-textSecondary">{description}</span>}
    </div>
  );
}
