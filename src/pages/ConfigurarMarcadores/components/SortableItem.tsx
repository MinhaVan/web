import { Marcador } from "@/types/Marcador";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem({ marcador }: { marcador: Marcador }) {
  const { idTemporario, titulo } = marcador;
  const id = idTemporario;
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-100 p-2 mb-2 rounded shadow cursor-move"
    >
      {titulo}
    </div>
  );
}
