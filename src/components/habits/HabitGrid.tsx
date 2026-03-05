import { HabitCard, HabitCardProps } from "./HabitCard";

export function HabitGrid({ habits }: { habits: HabitCardProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((habit, idx) => (
        <HabitCard key={idx} {...habit} />
      ))}
    </div>
  );
}
