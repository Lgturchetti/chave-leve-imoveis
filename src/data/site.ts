// Imobiliária FICTÍCIA — projeto de demonstração/portfólio (pacote "Com painel").
// Dados fixos do negócio. Os imóveis ficam em imoveis.ts (parte 2: vêm do Supabase).

export const site = {
  nome: "Chave Leve Imóveis",
  nomeCurto: "Chave Leve", // cabeçalho: até ~14 caracteres
  descricao:
    "Aluguel em Santa Maria sem precisar ir até a imobiliária: kitnets e apartamentos perto da UFSM, fotos de verdade, custo total na hora e visita agendada pelo site.",
  url: "https://chave-leve.vercel.app",
  endereco: "Rua Fictícia, 789, sala 4 — Camobi, Santa Maria/RS",
  whatsapp: "5555900000000", // número de exemplo
  telefone: "(55) 3000-0000", // número de exemplo
  email: "contato@exemplo.com.br",
  creci: "CRECI-RS 00000-J", // número de exemplo
  horario: "Segunda a sexta, 9h às 18h. Sábado, 9h às 12h.",
};

// UFSM (campus de Camobi): referência para "minutos a pé" e para o pino no mapa
export const UFSM = { lat: -29.7176, lon: -53.7163 };

export function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
