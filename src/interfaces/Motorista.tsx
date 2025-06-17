export interface Motorista {
  id?: number;
  cpf?: string;
  status?: number;
  contato?: string;
  email?: string;
  primeiroNome?: string;
  ultimoNome?: string;
  perfil?: number;
  planoId?: number;
  usuarioValidado?: boolean;
  enderecoPrincipalId?: number;
  senha?: string;
  refreshToken?: string;
  refreshTokenExpiryTime?: Date;
  empresaId?: number;
  cnh?: string;
  vencimento?: Date;
  tipoCNH?: number;
  foto?: string;
}
