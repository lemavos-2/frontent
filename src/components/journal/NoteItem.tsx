import clsx from "clsx";

export type NoteItemProps = {
  title: string;
  timestamp: string;
  selected?: boolean;
  onClick?: () => void;
};

export function NoteItem({ title, timestamp, selected, onClick }: NoteItemProps) {
  return (
    <div
      className={clsx(
        "flex items-center min-h-[48px] px-4 py-2 rounded-[10px] border border-border bg-surface hover:bg-hover transition-colors cursor-pointer",
        selected && "border-accent bg-background"
      )}
      onClick={onClick}
      aria-selected={selected}
      tabIndex={0}
    >
      <span className="font-semibold text-textPrimary">{title}</span>
      <span className="ml-auto text-textTertiary text-[13px]">{timestamp}</span>
    </div>
  );
}
