import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { Trash2, Pencil } from "lucide-react";
import * as http from "../utils/api";
import { Motorista } from "@/interfaces/Motorista";
import { Perfil } from "@/interfaces/Perfil";
import { CNH } from "@/interfaces/CNH";
import { RemoverDialog } from "@/dialog/RemoverDialog";

export default function GerenciarMotoristas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [CNHs, setCNHs] = useState<CNH[]>([]);
  const [perfils, setPerfils] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Motorista | null>(null);
  const [formData, setFormData] = useState<Omit<Motorista, "id">>({
    cpf: "",
    status: 0,
    contato: "",
    email: "",
    primeiroNome: "",
    ultimoNome: "",
    perfil: 0,
    planoId: 0,
    usuarioValidado: false,
    enderecoPrincipalId: 0,
    senha: "",
    refreshToken: "",
    refreshTokenExpiryTime: undefined,
    empresaId: 0,
    cnh: "",
    vencimento: undefined,
    tipoCNH: 0,
    foto: "",
  });

  useEffect(() => {
    fetchMotoristas();
    fetchPerfis();
    fetchCNH();
  }, []);

  const fetchPerfis = async () => {
    setLoading(true);
    const response = await http.get<Perfil[]>("/Auth/v1/Perfil");
    const data = await response.data;
    setPerfils(data);
    setLoading(false);
  };

  const fetchCNH = async () => {
    setLoading(true);
    const response = await http.get<CNH[]>("/Pessoas/v1/Motorista/CNH");
    const data = await response.data;
    setCNHs(data);
    setLoading(false);
  };

  const fetchMotoristas = async () => {
    setLoading(true);
    const response = await http.get<Motorista[]>(
      "/Pessoas/v1/Motorista?completarDadosDoUsuario=true&adicionarDeletados=true"
    );
    const data = await response.data;
    setMotoristas(data);
    setLoading(false);
  };

  const salvarMotorista = async () => {
    if (editando && editando.id != null) {
      await http.put(`/Pessoas/v1/Motorista`, { ...formData, id: editando.id });
    } else {
      await http.post("/Pessoas/v1/Motorista", formData);
    }
    setDialogOpen(false);
    setEditando(null);
    resetFormData();
    fetchMotoristas();
  };

  const resetFormData = () => {
    setFormData({
      cpf: "",
      status: 0,
      contato: "",
      email: "",
      primeiroNome: "",
      ultimoNome: "",
      perfil: 0,
      planoId: 0,
      usuarioValidado: false,
      enderecoPrincipalId: 0,
      senha: "",
      refreshToken: "",
      refreshTokenExpiryTime: undefined,
      empresaId: 0,
      cnh: "",
      vencimento: undefined,
      tipoCNH: 0,
      foto: "",
    });
  };

  const removerMotorista = async (id: number) => {
    await http.del(`/Pessoas/v1/Motorista/${id}`);
    fetchMotoristas();
  };

  const abrirEditar = (motorista: Motorista) => {
    setEditando(motorista);
    setFormData({
      cpf: motorista.cpf ?? "",
      status: motorista.status ?? 0,
      contato: motorista.contato ?? "",
      email: motorista.email ?? "",
      primeiroNome: motorista.primeiroNome ?? "",
      ultimoNome: motorista.ultimoNome ?? "",
      perfil: motorista.perfil ?? 0,
      planoId: motorista.planoId ?? 0,
      usuarioValidado: motorista.usuarioValidado ?? false,
      enderecoPrincipalId: motorista.enderecoPrincipalId ?? 0,
      senha: motorista.senha ?? "",
      refreshToken: motorista.refreshToken ?? "",
      refreshTokenExpiryTime: motorista.refreshTokenExpiryTime
        ? new Date(motorista.refreshTokenExpiryTime)
        : undefined,
      empresaId: motorista.empresaId ?? 0,
      cnh: motorista.cnh ?? "",
      vencimento: motorista.vencimento
        ? new Date(motorista.vencimento)
        : undefined,
      tipoCNH: motorista.tipoCNH ?? 0,
      foto: motorista.foto ?? "",
    });
    setDialogOpen(true);
  };

  // Handler para selecionar arquivo da foto
  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFoto(e.target.files[0]);
    }
  };

  // Upload da foto para S3 via backend e atualiza formData.foto com URL
  const uploadFoto = async (file: File) => {
    try {
      // 1. Solicita URL pré-assinada para upload
      const { data: uploadInfo } = await http.post<{
        url: string;
        key: string;
      }>("/api/fotos/upload-url", { fileName: file.name, fileType: file.type });

      // 2. Faz upload direto para S3 usando a URL pré-assinada
      await fetch(uploadInfo.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      // 3. Atualiza o formData com a URL pública (ou caminho) da imagem
      // Supondo que o backend retorna o key que pode ser concatenado a uma URL base
      const publicUrl = `$${uploadInfo.key}`;
      setFormData((old) => ({ ...old, foto: publicUrl }));
    } catch (error) {
      alert("Erro ao enviar a foto.");
      console.error(error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Motoristas</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditando(null);
                resetFormData();
                setDialogOpen(true);
              }}
            >
              Novo Motorista
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogTitle>
              {editando ? `Editar Motorista` : "Novo Motorista"}
            </DialogTitle>
            <div className="space-y-4 max-h-[70vh] overflow-auto pr-2">
              <div>
                <label>Primeiro nome:</label>
                <Input
                  placeholder="Primeiro Nome"
                  value={formData.primeiroNome}
                  onChange={(e) =>
                    setFormData({ ...formData, primeiroNome: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Ultimo nome:</label>
                <Input
                  placeholder="Último Nome"
                  value={formData.ultimoNome}
                  onChange={(e) =>
                    setFormData({ ...formData, ultimoNome: e.target.value })
                  }
                />
              </div>

              <div>
                <label>CPF:</label>
                <Input
                  placeholder="CPF"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Contato:</label>
                <Input
                  placeholder="Contato"
                  value={formData.contato}
                  onChange={(e) =>
                    setFormData({ ...formData, contato: e.target.value })
                  }
                />
              </div>

              <div>
                <label>E-mail:</label>
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Perfil:</label>
                <select
                  value={formData.perfil}
                  onChange={(e) =>
                    setFormData({ ...formData, perfil: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                >
                  {perfils &&
                    perfils.map((perfil) => (
                      <option key={perfil.id} value={perfil.id}>
                        {perfil.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.usuarioValidado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usuarioValidado: e.target.checked,
                      })
                    }
                  />{" "}
                  Usuário Validado
                </label>
              </div>

              <div>
                <label>CNH:</label>
                <Input
                  placeholder="CNH"
                  value={formData.cnh}
                  onChange={(e) =>
                    setFormData({ ...formData, cnh: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Vencimento CNH:</label>
                <Input
                  placeholder="Vencimento CNH"
                  type="date"
                  value={
                    formData.vencimento
                      ? formData.vencimento.toISOString().substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vencimento: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>

              <div>
                <label>Tipo CNH:</label>
                <select
                  value={formData.tipoCNH}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoCNH: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  {CNHs &&
                    CNHs.map((cnh) => (
                      <option key={cnh.id} value={cnh.id}>
                        {cnh.nome}
                      </option>
                    ))}
                </select>
              </div>
              {/* Foto upload e preview */}
              {/* <div className="space-y-2">
                <label className="block font-medium">Foto:</label>
                {formData.foto ? (
                  <img
                    src={formData.foto}
                    alt="Foto do Motorista"
                    className="w-32 h-32 object-cover rounded-md cursor-pointer border border-gray-300"
                    onClick={() => {
                      const fileInput = document.getElementById(
                        "foto-upload"
                      ) as HTMLInputElement;
                      fileInput?.click();
                    }}
                  />
                ) : (
                  <div
                    className="w-32 h-32 flex items-center justify-center border border-dashed border-gray-400 rounded-md cursor-pointer text-gray-500"
                    onClick={() => {
                      const fileInput = document.getElementById(
                        "foto-upload"
                      ) as HTMLInputElement;
                      fileInput?.click();
                    }}
                  >
                    Clique para adicionar foto
                  </div>
                )}
                <input
                  type="file"
                  id="foto-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
              </div> */}
              <div>
                <label>Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value={0}>Desativado</option>
                  <option value={1}>Ativo</option>
                </select>
              </div>

              <Button onClick={salvarMotorista}>
                {editando ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p>Carregando motoristas...</p>
        ) : (
          motoristas.map((motorista) => (
            <Card key={motorista.id}>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">
                  {motorista.primeiroNome} {motorista.ultimoNome}
                </h3>
                <p>CPF: {motorista.cpf}</p>
                <p>Status: {motorista.status === 1 ? "Ativo" : "Desativado"}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => abrirEditar(motorista)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <RemoverDialog
                    title="Deseja remover este motorista?"
                    subtitle="Caso necessário, essa ação poderá ser desfeita."
                    onConfirm={() => removerMotorista(motorista.id ?? 0)}
                    trigger={
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
