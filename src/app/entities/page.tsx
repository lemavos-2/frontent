import { useState, useEffect } from "react";
import { EntityList } from "@/components/entities/EntityList";
import { entityService } from "@/services/entityService";
import type { Entity } from "@/types/models";

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    entityService.list().then(setEntities).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-4">
      <EntityList entities={entities} />
    </div>
  );
}
