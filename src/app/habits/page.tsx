import { HabitGrid } from "@/components/habits/HabitGrid";

const habits = [
  { name: "Exercício", progress: 80 },
  { name: "Leitura", progress: 60 },
  { name: "Meditação", progress: 100 },
];

export default function HabitsPage() {
  return (
    <div className="mt-4">
      <HabitGrid habits={habits} />
    </div>
  );
}
