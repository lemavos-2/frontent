import { NoteList } from "@/components/journal/NoteList";
import { JournalEditor } from "@/components/journal/JournalEditor";

const notes = [
  { title: "Primeira nota", timestamp: "Hoje 09:00" },
  { title: "Ideias", timestamp: "Ontem 18:30" },
];

export default function JournalPage() {
  const [selected, setSelected] = React.useState(notes[0].title);
  const [content, setContent] = React.useState("<p>Conteúdo da nota</p>");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <NoteList notes={notes} selectedId={selected} onSelect={setSelected} />
      </div>
      <div className="h-full">
        <JournalEditor content={content} onUpdate={setContent} />
      </div>
    </div>
  );
}
