import React, { useEffect, useState } from 'react';
import { useEntityStore } from '@/stores/entityStore';
import type { Entity } from '@/types/models';

export const GraphView: React.FC = () => {
  const { getConnections } = useEntityStore();
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    // For simplicity, assume we have a list of entities, but since no list API, placeholder
    // In real, fetch all entities or from a store
    setEntities([]); // Placeholder
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Knowledge Graph</h1>
      <svg width="800" height="600" className="border">
        {entities.map((entity, index) => (
          <circle
            key={entity.id}
            cx={100 + index * 100}
            cy={100 + index * 50}
            r="20"
            fill="blue"
            onClick={() => window.location.href = `/entity/${entity.id}`}
            className="cursor-pointer"
          />
        ))}
        {entities.map((entity, index) => (
          <text
            key={`text-${entity.id}`}
            x={100 + index * 100}
            y={105 + index * 50}
            textAnchor="middle"
            fill="white"
            fontSize="10"
          >
            {entity.title}
          </text>
        ))}
      </svg>
    </div>
  );
};