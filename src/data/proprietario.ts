export type CampoProprietario = "nome" | "whatsapp" | "bairro" | "mensagem";

export type EstadoProprietario = {
  status: "inicial" | "erro" | "enviado";
  erros?: Partial<Record<CampoProprietario, string>>;
  valores?: Partial<Record<CampoProprietario, string>>;
  mensagem?: string;
  demonstracao?: boolean;
  bloqueado?: boolean;
};
