import type { Entity } from "@/types/models";
import { Link } from "react-router-dom";

export type EntityCardProps = Entity;

export function EntityCard({ id, name, entityType, description }: EntityCardProps) {
  return (
    <Link to={`/entities/${id}`} className="block">
      <div className="bg-surface border border-border rounded-[10px] p-4 flex flex-col gap-2 hover:bg-hover transition-colors">
        <span className="font-semibold text-textPrimary">{name}</span>
        <span className="text-[13px] text-textSecondary">{entityType}</span>
        {description && <span className="text-[13px] text-textTertiary">{description}</span>}
      </div>
    </Link>
  );
}
