export interface BaseResponse<T> {
  sucesso: boolean;
  data: T;
  mensagem: string;
  erros: string[];
}
