import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import * as http from "../utils/api";
import { Rota } from "../interfaces/Rota";
import { Aluno } from "../interfaces/Aluno";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { Button } from "@/components/ui/button";

type AlunoOption = {
  value: string;
  label: string;
  raw: Aluno;
};

export default function ConfigurarRotaAlunos() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [rotaSelecionada, setRotaSelecionada] = useState<any>(null);
  const [alunosSelecionados, setAlunosSelecionados] = useState<Aluno[]>([]);
  const [loadingRotas, setLoadingRotas] = useState(false);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [alunosOriginais, setAlunosOriginais] = useState<Aluno[]>([]);
  const [sucesso, setSucesso] = useState("");
  const alunosOriginaisRef = useRef<Aluno[]>([]);

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
    async function fetchAlunosVinculados() {
      const response = await http.get<any>(
        `/Routes/v1/Rota/${rotaSelecionada.value}/Detalhe`
      );
      const vinculados = response.data.alunos || [];
      alunosOriginaisRef.current = vinculados;
      setAlunosSelecionados(vinculados);
    }
    if (rotaSelecionada) fetchAlunosVinculados();
  }, [rotaSelecionada]);

  // Busca alunos da API
  const loadAlunoOptions = debounce(async (inputValue: any, callback: any) => {
    if (!inputValue || inputValue.length < 3) return callback([]);

    setLoadingAlunos(true);
    try {
      const response = await http.get<Aluno[]>(
        `/Pessoas/v1/Aluno/Buscar?filtro=${encodeURIComponent(
          inputValue
        )}&rotaId=${rotaSelecionada?.value || ""}`
      );

      const options = (response.data || []).map((a) => ({
        value: a.id,
        label: `${a.primeiroNome} ${a.ultimoNome}`,
        raw: a, // salvar o objeto inteiro para exibir depois
      }));

      callback(options);
    } catch {
      callback([]);
    } finally {
      setLoadingAlunos(false);
    }
  }, 2000);

  function validar() {
    if (!rotaSelecionada) {
      setErro("Selecione uma rota");
      return false;
    }
    if (alunosSelecionados.length === 0) {
      setErro("Selecione pelo menos um aluno");
      return false;
    }
    setErro("");
    return true;
  }

  async function handleSalvar(e: any) {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const idsSelecionados = alunosSelecionados.map((a) => a.id);
      const idsOriginais = alunosOriginais.map((a) => a.id);

      const novos = alunosSelecionados.filter(
        (a) => !idsOriginais.includes(a.id)
      );
      const removidos = alunosOriginais.filter(
        (a) => !idsSelecionados.includes(a.id)
      );

      // Adiciona novos
      let promisesAlunosParaAdicionarNaRota: Promise<void>[] = [];
      if (novos.length > 0) {
        promisesAlunosParaAdicionarNaRota = novos.map(async (aluno) => {
          await http.put(
            `/Routes/v1/AlunoRota/Vincular?alunoId=${aluno.id}&rotaId=${rotaSelecionada.value}`,
            {}
          );
        });
      }

      // Remove os excluídos
      let promisesAlunosParaDesvincularNaRota: Promise<void>[] = [];
      if (removidos.length > 0) {
        promisesAlunosParaDesvincularNaRota = removidos.map(async (aluno) => {
          await http.put(
            `/Routes/v1/AlunoRota/Desvincular?alunoId=${aluno.id}&rotaId=${rotaSelecionada.value}`,
            {}
          );
        });
      }

      await Promise.all([
        promisesAlunosParaAdicionarNaRota,
        promisesAlunosParaDesvincularNaRota,
      ]).then(() => {
        setSucesso("Configuração salva com sucesso!");
        setAlunosOriginais(alunosSelecionados);
      });
    } catch {
      setErro("Falha ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Configurar Rota x Alunos</h1>

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
          <label className="block mb-2 font-medium">Alunos:</label>
          <AsyncSelect<AlunoOption>
            cacheOptions
            loadOptions={loadAlunoOptions}
            defaultOptions={false}
            isLoading={loadingAlunos}
            placeholder="Digite o nome do aluno..."
            isClearable={false}
            onChange={(selected) => {
              if (!selected) return;
              const aluno = selected.raw;

              const alreadyAdded = alunosSelecionados.some(
                (a) => a.id === aluno.id
              );
              if (!alreadyAdded) {
                setAlunosSelecionados((prev) => [...prev, aluno]);
              }
            }}
            noOptionsMessage={() => "Digite pelo menos 3 letras"}
          />

          {alunosSelecionados.length > 0 && (
            <div className="mt-6">
              <h2 className="font-medium mb-2">Alunos vinculados:</h2>
              <ul className="space-y-2">
                {alunosSelecionados.map((aluno) => (
                  <li
                    key={aluno.id}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded"
                  >
                    <span>
                      {aluno.primeiroNome} {aluno.ultimoNome}
                    </span>
                    <button
                      onClick={() =>
                        setAlunosSelecionados((prev) =>
                          prev.filter((a) => a.id !== aluno.id)
                        )
                      }
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      Remover
                    </button>
                  </li>
                ))}
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
