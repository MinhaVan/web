interface Rota {
  id?: number;
  enderecoId: number;
  veiculoId: number;
  nome: string;
  emAndamento: boolean;
  deveBuscarRotaNoGoogleMaps: boolean;
  diaSemana: number;
  horario: string;
  tipoRota: number;
  status: number;
  veiculo?: Veiculo;
}
