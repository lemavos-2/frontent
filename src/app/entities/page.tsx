import { EntityList } from "@/components/entities/EntityList";

const entities = [
  { name: "Projeto X", type: "Projeto", notesCount: 5 },
  { name: "Livro Y", type: "Livro", notesCount: 2 },
];

export default function EntitiesPage() {
  return (
    <div className="mt-4">
      <EntityList entities={entities} />
    </div>
  );
}
