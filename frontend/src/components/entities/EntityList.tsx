import { EntityCard, EntityCardProps } from "./EntityCard";
import type { Entity } from "@/types/models";

export function EntityList({ entities }: { entities: Entity[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entities.map((entity) => (
        <EntityCard key={entity.id} {...entity} />
      ))}
    </div>
  );
}
