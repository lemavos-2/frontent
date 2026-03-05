import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function DashboardPage() {
  const stats = [
    { title: "Hábitos", value: 5 },
    { title: "Notas", value: 42 },
    { title: "Entidades", value: 8 },
  ];
  const activities = [
    { id: "1", text: "Nota criada", timestamp: "Hoje 10:00" },
    { id: "2", text: "Hábito concluído", timestamp: "Hoje 09:30" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
    <h2 className="text-[22px] font-semibold tracking-tight mb-4">Atividade recente</h2>
    <ActivityFeed items={activities} />
  );
}
