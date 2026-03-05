import { EntityCard, EntityCardProps } from "./EntityCard";

export function EntityList({ entities }: { entities: EntityCardProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entities.map((entity, idx) => (
        <EntityCard key={idx} {...entity} />
      ))}
    </div>
  );
}
