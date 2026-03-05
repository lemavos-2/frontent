export type EntityCardProps = {
  name: string;
  type: string;
  notesCount: number;
};

export function EntityCard({ name, type, notesCount }: EntityCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-4 flex flex-col gap-2 hover:bg-hover transition-colors">
      <span className="font-semibold text-textPrimary">{name}</span>
      <span className="text-[13px] text-textSecondary">{type}</span>
      <span className="text-[13px] text-textTertiary">{notesCount} notas</span>
    </div>
  );
}
