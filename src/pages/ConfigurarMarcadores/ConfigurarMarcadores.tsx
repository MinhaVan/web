import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import * as http from "@/utils/api";
import GoogleMapReact from "google-map-react";
import { useParams } from "react-router-dom";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "./components/SortableItem";
import { Marcador } from "@/types/Marcador";

const Marker = ({ text }: { text: string }) => (
  <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full shadow">
    {text}
  </div>
);

export default function ConfigurarMarcadores() {
  const { id } = useParams<{ id: string }>();
  const [rotaSelecionada, setRotaSelecionada] = useState<number | null>(null);
  const [marcadores, setMarcadores] = useState<Marcador[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (id) setRotaSelecionada(Number(id));
  }, [id]);

  useEffect(() => {
    buscarMarcadores();
  }, [rotaSelecionada]);

  const buscarMarcadores = async () => {
    if (!rotaSelecionada) return;
    setLoading(true);
    const res = await http.get<Marcador[]>(
      `/Routes/v1/Trajeto/Rota/${rotaSelecionada}/Marcadores`
    );
    setMarcadores(res.data);
    setLoading(false);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = marcadores.findIndex((m) => m.idTemporario === active.id);
    const newIndex = marcadores.findIndex((m) => m.idTemporario === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const novaOrdem = arrayMove(marcadores, oldIndex, newIndex);
    setMarcadores(novaOrdem);
  };

  const gerarMelhorRota = async () => {
    if (!rotaSelecionada) return;
    setSaving(true);
    try {
      await http.post(
        `/Routes/v1/Trajeto/Rota/${rotaSelecionada}/GerarMelhorTrajeto`,
        {}
      );
      buscarMarcadores();
      alert("Melhor ordem gerada com sucesso!");
    } catch (error) {
      alert("Erro ao salvar a ordem.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const salvarOrdem = async () => {
    if (!rotaSelecionada) return;
    setSaving(true);
    try {
      const data = marcadores;
      data.forEach((m, index) => {
        m.ordem = index + 1;
      });
      await http.post(`/Routes/v1/Trajeto/Rota/${rotaSelecionada}`, data);
      buscarMarcadores();
      alert("Ordem salva com sucesso!");
    } catch (error) {
      alert("Erro ao salvar a ordem.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Organizar Rota</h2>

      {loading && (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {marcadores.length > 0 && (
        <>
          <Card className="p-4 mb-4">
            <div className="h-[500px] w-full rounded-md overflow-hidden">
              <GoogleMapReact
                bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_KEY }}
                center={{
                  lat: marcadores[0].latitude,
                  lng: marcadores[0].longitude,
                }}
                defaultZoom={13}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map }: any) => {
                  mapRef.current = map;
                }}
              >
                {marcadores.map((m, index) => (
                  <Marker
                    key={m.idTemporario}
                    lat={m.latitude}
                    lng={m.longitude}
                    text={`${index + 1}`}
                  />
                ))}
              </GoogleMapReact>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-bold mb-2">Ordem dos Marcadores</h3>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={marcadores.map((m) => m.idTemporario)}
                strategy={verticalListSortingStrategy}
              >
                {marcadores.map((m) => (
                  <SortableItem key={m.idTemporario} marcador={m} />
                ))}
              </SortableContext>
            </DndContext>

            <p className="mt-4 text-sm text-muted-foreground">
              A ordem será usada como base para o trajeto.
            </p>
            <Button className="mt-4" onClick={salvarOrdem} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>

            <Button
              variant="outline"
              className="mt-4 ml-4 border-2 border-gray-900"
              onClick={gerarMelhorRota}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Gerando...
                </>
              ) : (
                "Gerar Melhor Trajeto"
              )}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
