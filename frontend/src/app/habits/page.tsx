import { useState, useEffect } from "react";
import { HabitGrid } from "@/components/habits/HabitGrid";
import { entityService } from "@/services/entityService";
import type { Entity } from "@/types/models";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    entityService.list("HABIT").then(setHabits).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-4">
      <HabitGrid habits={habits} />
    </div>
  );
}
