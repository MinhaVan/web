export interface Aluno {
  id?: number;
  primeiroNome: string;
  ultimoNome: string;
  contato: string;
  email: string;
  cPF: string;
  responsavelId: number;
  empresaId: number;
  enderecoPartidaId: number;
  enderecoDestinoId: number;
  enderecoRetornoId?: number;
}
