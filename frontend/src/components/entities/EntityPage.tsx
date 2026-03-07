import React, { useEffect, useState } from 'react';
import { useEntityStore } from '@/stores/entityStore';
import type { Entity, Note } from '@/types/models';

interface EntityPageProps {
  entityId: string;
}

export const EntityPage: React.FC<EntityPageProps> = ({ entityId }) => {
  const { getEntity, getNotes, getConnections } = useEntityStore();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [connections, setConnections] = useState<Entity[]>([]);

  useEffect(() => {
    getEntity(entityId).then(setEntity);
    getNotes(entityId).then(setNotes);
    getConnections(entityId).then(setConnections);
  }, [entityId, getEntity, getNotes, getConnections]);

  if (!entity) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{entity.title}</h1>
      <p className="text-gray-600">{entity.description}</p>
      <h2 className="text-xl mt-4">Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id} className="p-2 border rounded mb-2">
            <h3>{note.title}</h3>
            <p>{note.content.substring(0, 200)}...</p>
          </li>
        ))}
      </ul>
      <h2 className="text-xl mt-4">Connections</h2>
      <ul>
        {connections.map((conn) => (
          <li key={conn.id} className="p-2 border rounded mb-2">
            {conn.title}
          </li>
        ))}
      </ul>
    </div>
  );
};