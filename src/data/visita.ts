// Tipos do pedido de visita (fora de actions.ts: arquivo "use server" só exporta funções assíncronas)
export type CampoVisita = "dia" | "turno" | "nome" | "whatsapp";

export type EstadoVisita = {
  status: "inicial" | "erro" | "enviado";
  erros?: Partial<Record<CampoVisita, string>>;
  valores?: Partial<Record<CampoVisita | "codigo", string>>;
  mensagem?: string;
  demonstracao?: boolean;
  bloqueado?: boolean;
};

// Próximos 7 dias de atendimento (sem domingo), no formato AAAA-MM-DD
export function proximosDias(hoje = new Date()) {
  const dias: { iso: string; semana: string; dia: number }[] = [];
  const d = new Date(hoje);
  const sem = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  while (dias.length < 7) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) continue;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dias.push({ iso, semana: sem[d.getDay()], dia: d.getDate() });
  }
  return dias;
}
