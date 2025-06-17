import { useEffect, useState } from "react";
import Select from "react-select";
import * as http from "../utils/api";
import { Rota } from "../interfaces/Rota";
import { Aluno } from "../interfaces/Aluno";
import { Motorista } from "../interfaces/Motorista";
import { BaseResponse } from "../interfaces/BaseResponse";
import { Button } from "@/components/ui/button";

type AlunoOption = {
  value: string;
  label: string;
  raw: Aluno;
};

export default function ConfigurarRotaMotorista() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [motoristaVinculado, setMotoristaVinculado] = useState<
    Motorista | undefined
  >();
  const [motoristaVinculadoBackUp, setMotoristaVinculadoBackUp] = useState<
    Motorista | undefined
  >();
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [rotaSelecionada, setRotaSelecionada] = useState<any | undefined>(null);
  const [loadingMotorista, setloadingMotorista] = useState(false);
  const [loadingRotas, setLoadingRotas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function fetchMotoristas() {
      setloadingMotorista(true);
      try {
        const response = await http.get<Rota[]>(
          "/Pessoas/v1/Motorista?completarDadosDoUsuario=true"
        );
        setMotoristas(response.data || []);
      } catch {
        setErro("Erro ao carregar motoristas");
      } finally {
        setloadingMotorista(false);
      }
    }
    fetchMotoristas();
  }, []);

  useEffect(() => {
    async function fetchRotas() {
      setLoadingRotas(true);
      try {
        const response = await http.get<Rota[]>("/Routes/v1/Rota");
        setRotas(response.data || []);
      } catch {
        setErro("Erro ao carregar rotas");
      } finally {
        setLoadingRotas(false);
      }
    }
    fetchRotas();
  }, []);

  useEffect(() => {
    async function fetchMotoristasVinculados() {
      const response = await http.get<Motorista>(
        `/Routes/v1/MotoristaRota/Motorista/Rota/${rotaSelecionada.value}`
      );
      const vinculados = response.data || {};
      setMotoristaVinculado(vinculados);
      setMotoristaVinculadoBackUp(vinculados);
    }
    if (rotaSelecionada) fetchMotoristasVinculados();
  }, [rotaSelecionada]);

  async function handleSalvar(e: any) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso("");
    try {
      // Adiciona novo
      let promisesAlunosParaAdicionarNaRota: BaseResponse<unknown> =
        {} as BaseResponse<unknown>;
      if (motoristaVinculadoBackUp?.id !== motoristaVinculado?.id) {
        promisesAlunosParaAdicionarNaRota = await http.put(
          `/Routes/v1/MotoristaRota/Vincular`,
          {
            MotoristaId: motoristaVinculado?.id,
            RotaId: rotaSelecionada.value,
          }
        );
      }

      // Remove os excluídos
      let promisesAlunosParaDesvincularNaRota: Promise<BaseResponse<unknown>> =
        {} as Promise<BaseResponse<unknown>>;
      if (
        motoristaVinculadoBackUp?.id &&
        motoristaVinculadoBackUp?.id !== motoristaVinculado?.id
      ) {
        promisesAlunosParaDesvincularNaRota = http.put(
          `/Routes/v1/MotoristaRota/Desvincular`,
          {
            MotoristaId: motoristaVinculadoBackUp?.id,
            RotaId: rotaSelecionada.value,
          }
        );
      }
      await Promise.all([
        promisesAlunosParaAdicionarNaRota,
        promisesAlunosParaDesvincularNaRota,
      ]).then(() => {
        setRotaSelecionada(undefined);
        setMotoristaVinculado(undefined);
        setMotoristas([]);
        setMotoristaVinculadoBackUp(undefined);
        setSucesso("Configuração salva com sucesso!");
        setTimeout(() => {
          setSucesso("");
        }, 3000);
      });
    } catch {
      setErro("Falha ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-semibold mb-6">
        Configurar Rota x Motorista
      </h1>

      {erro && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{erro}</div>
      )}
      {sucesso && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {sucesso}
        </div>
      )}

      <form onSubmit={handleSalvar} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Selecione a rota:</label>
          <Select
            isLoading={loadingRotas}
            options={rotas.map((r) => ({
              value: r.id,
              label: r.nome,
            }))}
            value={rotaSelecionada}
            onChange={setRotaSelecionada}
            placeholder="Digite para filtrar..."
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Motorista:</label>
          <Select
            isLoading={loadingMotorista}
            options={motoristas
              .filter((m) => m.id !== motoristaVinculado?.id)
              .map((m) => ({
                value: m.id,
                label:
                  `${m.primeiroNome ?? ""} ${m.ultimoNome ?? ""}`.trim() ||
                  "Motorista sem nome",
              }))}
            onChange={(selected) => {
              const motorista = motoristas.find(
                (m) => m.id === selected?.value
              );
              setMotoristaVinculado(motorista);
            }}
            placeholder="Selecione um motorista"
          />

          {motoristaVinculado && (
            <div className="mt-6">
              <h2 className="font-medium mb-2">Motorista vinculado:</h2>
              <ul className="space-y-2">
                <li
                  key={motoristaVinculado.id}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <span>
                    {motoristaVinculado.primeiroNome}{" "}
                    {motoristaVinculado.ultimoNome}
                  </span>
                  <button
                    onClick={() => setMotoristaVinculado(undefined)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    Remover
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={salvando}
          className={`w-full py-3 text-white font-semibold rounded`}
        >
          {salvando ? "Salvando..." : "Salvar Configuração"}
        </Button>
      </form>
    </div>
  );
}
