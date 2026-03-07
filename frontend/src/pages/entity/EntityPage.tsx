import React from 'react';
import { useParams } from 'react-router-dom';
import { EntityPage as EntityPageComponent } from '@/components/entities/EntityPage';

export const EntityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <EntityPageComponent entityId={id!} />;
};