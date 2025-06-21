// src/pages/GerenciarRotas.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import * as http from "../utils/api";
import { Link } from "react-router-dom";

export default function GerenciarRotas() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Rota | null>(null);
  const [formData, setFormData] = useState<Rota>({} as Rota);

  const diaSemana: any[] = [
    { id: 0, description: "Nenhum" },
    { id: 1, description: "Domingo" },
    { id: 2, description: "Segunda" },
    { id: 3, description: "Terça" },
    { id: 4, description: "Quarta" },
    { id: 5, description: "Quinta" },
    { id: 6, description: "Sexta" },
    { id: 7, description: "Sábado" },
    { id: 8, description: "Dias utéis" },
    { id: 9, description: "Todos" },
  ];

  useEffect(() => {
    fetchRotas();
    fetchVeiculos();
  }, []);

  const fetchRotas = async () => {
    const res = await http.get<Rota[]>(
      "/Routes/v1/Rota?incluirDeletados=true&incluirDetalhes=true"
    );
    setRotas(res.data);
  };

  const fetchVeiculos = async () => {
    const res = await http.get<Veiculo[]>(
      "/Routes/v1/Veiculo?incluirDeletados=true"
    );
    setVeiculos(res.data);
  };

  const salvarRota = async () => {
    if (editando?.id) {
      console.log("{ id: editando.id, ...formData }", {
        id: editando.id,
        ...formData,
      });
      await http.put(`/Routes/v1/Rota`, { id: editando.id, ...formData });
    } else {
      await http.post("/Routes/v1/Rota", formData);
    }
    fetchRotas();
    setDialogOpen(false);
    resetFormData();
  };

  const removerRota = async (id: number) => {
    await http.del(`/Routes/v1/Rota/${id}`);
    fetchRotas();
  };

  const abrirEditar = (rota: Rota) => {
    setEditando(rota);
    setFormData(rota);
    setDialogOpen(true);
  };

  const resetFormData = () => {
    setFormData({ status: 1, deveBuscarRotaNoGoogleMaps: false } as Rota);
    setEditando(null);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Rotas</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetFormData();
                setDialogOpen(true);
              }}
            >
              Nova Rota
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogTitle>{editando ? "Editar Rota" : "Nova Rota"}</DialogTitle>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Nome da Rota:</label>
                <Input
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-2">Veículo:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.veiculoId ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, veiculoId: +e.target.value })
                  }
                >
                  <option value="">Selecione um veículo</option>
                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {`${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">Horário:</label>
                <Input
                  placeholder="Horário"
                  type="time"
                  value={formData.horario}
                  onChange={(e) =>
                    setFormData({ ...formData, horario: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block mb-2">Dia da Semana:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.diaSemana}
                  onChange={(e) =>
                    setFormData({ ...formData, diaSemana: +e.target.value })
                  }
                >
                  {diaSemana.map((dia) => (
                    <option key={dia.id} value={dia.id}>
                      {dia.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">Tipo da rota:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.tipoRota}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoRota: +e.target.value })
                  }
                >
                  <option value={1}>Ida</option>
                  <option value={2}>Volta</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="status"
                  type="checkbox"
                  checked={formData.status === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked ? 1 : 2,
                    })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="status" className="text-sm">
                  Ativo
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="deveBuscarRotaNoGoogleMaps"
                  type="checkbox"
                  checked={formData.deveBuscarRotaNoGoogleMaps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deveBuscarRotaNoGoogleMaps: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="deveBuscarRotaNoGoogleMaps" className="text-sm">
                  Ao iniciar, deve buscar a rota no GoogleMaps
                </label>
              </div>

              <Button onClick={salvarRota}>
                {editando ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rotas.map((rota) => (
          <Card key={rota.id}>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-lg font-semibold">{rota.nome}</h3>
              <p>
                Veículo:{" "}
                {`${rota.veiculo?.marca} ${rota.veiculo?.modelo} - ${rota.veiculo?.placa}`}
              </p>
              <p>Horário: {rota.horario}</p>
              <p>
                Dia da Semana:{" "}
                {diaSemana.find((x) => x.id === rota.diaSemana)?.description}
              </p>
              <p>Tipo de Rota: {rota.tipoRota === 1 ? "Ida" : "Volta"}</p>
              <p>Status: {rota.status == 1 ? "Ativo" : "Deletado"}</p>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => abrirEditar(rota)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => removerRota(rota.id!)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Link para configurar marcadores */}
              <div>
                {rota.deveBuscarRotaNoGoogleMaps && rota.status === 1 && (
                  <Link
                    to={`/rota/${rota.id}/marcadores`}
                    className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Configurar Marcadores
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
