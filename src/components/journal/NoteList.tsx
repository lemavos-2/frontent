import { NoteItem, NoteItemProps } from "./NoteItem";

export function NoteList({ notes, selectedId, onSelect }: { notes: NoteItemProps[]; selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {notes.map((note, idx) => (
        <NoteItem
          key={idx}
          {...note}
          selected={selectedId === note.title}
          onClick={() => onSelect?.(note.title)}
        />
      ))}
    </div>
  );
}
