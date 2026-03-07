import { HabitCard, HabitCardProps } from "./HabitCard";
import type { Entity } from "@/types/models";

export function HabitGrid({ habits }: { habits: Entity[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((habit) => (
        <HabitCard key={habit.id} {...habit} />
      ))}
    </div>
  );
}
