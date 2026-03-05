export type HabitCardProps = {
  name: string;
  progress: number;
};

export function HabitCard({ name, progress }: HabitCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-4 flex flex-col gap-2 hover:bg-hover transition-colors">
      <span className="font-semibold text-textPrimary">{name}</span>
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[13px] text-textSecondary">{progress}% do dia</span>
    </div>
  );
}
