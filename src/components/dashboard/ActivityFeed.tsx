export type ActivityItem = {
  id: string;
  text: string;
  timestamp: string;
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="bg-surface border border-border rounded-[10px] p-3 flex items-center gap-2 hover:bg-hover transition-colors">
          <span className="text-textPrimary text-[15px]">{item.text}</span>
          <span className="ml-auto text-[13px] text-textTertiary">{item.timestamp}</span>
        </div>
      ))}
    </div>
  );
}
