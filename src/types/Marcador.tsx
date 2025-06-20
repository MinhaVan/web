import { Aluno } from "./Aluno";

export interface Marcador {
  id: number;
  idTemporario: string;
  ordem: number;
  enderecoId: number;
  tipoMarcador: number;
  titulo: string;
  latitude: number;
  longitude: number;
  aluno: Aluno;
  alunos: Aluno[];
}
