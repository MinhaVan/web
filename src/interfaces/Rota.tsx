export interface Rota {
  id: number;
  enderecoId: number;
  veiculoId: number;
  nome: string;
  emAndamento: boolean;
  diaSemana: number;
  horario: string;
  tipoRota: number;
}
