import React from "react";
import { format, parseISO } from "date-fns";

type Props = {
  heatmap: Record<string, number> | undefined;
  days?: number;
};

function colorFor(count: number, max: number) {
  if (count <= 0) return "bg-transparent border-white/5";
  const pct = max === 0 ? 0 : count / max;
  if (pct > 0.75) return "bg-[#16a34a]"; // strong
  if (pct > 0.4) return "bg-[#f59e0b]"; // mid
  return "bg-[#f97316]"; // light
}

export default function Heatmap({ heatmap, days = 30 }: Props) {
  if (!heatmap) return null;
  const keys = Object.keys(heatmap || {});
  if (keys.length === 0) return null;
  const parsed = keys.map((k) => ({ date: k, count: heatmap![k] }));
  parsed.sort((a, b) => a.date.localeCompare(b.date));
  const max = Math.max(...parsed.map((p) => p.count), 0);
  const tail = parsed.slice(-days);

  return (
    <div className="bg-[#111] border border-white/5 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-[#666]">Heatmap (menções)</h3>
        <div className="text-[11px] text-[#555] font-mono">Últimos {tail.length} dias</div>
      </div>
      <div className="flex flex-wrap gap-1 items-center" aria-hidden={false}>
        {tail.map((e) => (
          <div key={e.date} className="flex flex-col items-center" title={`${format(parseISO(e.date), "dd/MM/yyyy")}: ${e.count}`}>
            <div className={`w-4 h-4 rounded-sm ${colorFor(e.count, max)} border border-white/5`} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[11px] text-[#666]">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-transparent border border-white/5" /> 0</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#f97316]" /> leve</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#f59e0b]" /> médio</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#16a34a]" /> alto</span>
      </div>
    </div>
  );
}
